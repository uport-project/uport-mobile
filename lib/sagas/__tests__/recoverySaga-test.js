// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//
jest.mock('react-native', () => {
  return {
    NativeModules: {
      NativeHDSignerModule: {
        showSeed: (address, message) => new Promise((resolve, reject) => {
          if (address !== '0x7f2d6bb19b6a52698725f4a292e985c51cefc315') return reject(new Error('Unsupported address'))
          resolve('secret seed')
        })
      }
    }
  }
})
jest.mock('react-native-navigation', () => {
  return {
    Navigation: {}
  }
})
jest.mock('../persona', () => {
  return {
    lookupUportHash: (address) => Promise.resolve('IPFS')
  }
})

import { NativeModules } from 'react-native'
import { call, select, put, fork, spawn } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'

import recoverySaga from '../recoverySaga'
import { importSeed, createRecoveryAddress, encryptionPublicKey, DEFAULT_LEVEL } from '../keychain'
import { lookupAccount } from '../unnu'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import authorize from 'uPortMobile/lib/helpers/authorize'
const MNID = require('mnid')
import {
  showRecoverySeed,
  saveRecoverySeed,
  startSeedRecovery
 } from 'uPortMobile/lib/actions/recoveryActions'
import {
  saveMessage, startWorking, completeProcess, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import { performCatchup } from 'uPortMobile/lib/sagas/hubSaga'
import { storeIdentity, storeKeyChainLevel, storeSecurityLevel, removeIdentity } from 'uPortMobile/lib/actions/uportActions'
import {
  seedConfirmed, resetHDWallet
} from 'uPortMobile/lib/actions/HDWalletActions'
import {
  fetchCurrentCountry
} from 'uPortMobile/lib/actions/onboardingActions'

import { fetchAllSettings } from '../blockchain'
import { lookupUportHash } from '../persona'
import UportContracts from 'uport-identity'
const TxRelay = UportContracts.TxRelay.v2

describe('SHOW_RECOVERY_SEED', () => {
  const root = '0x7f2d6bb19b6a52698725f4a292e985c51cefc315'
  it('shows seed if user authorizes', () => {
    return expectSaga(recoverySaga)
      .provide([
        [matchers.call.fn(authorize), true],
        [select(hdRootAddress), root]
      ])
      .call(NativeModules.NativeHDSignerModule.showSeed, root, 'Show your current recovery seed?')
      .put(saveRecoverySeed('secret seed'))
      .dispatch(showRecoverySeed())
      .run({ silenceTimeout: true })
  })

  it('does not shows seed if user does not authorize', () => {
    return expectSaga(recoverySaga)
      .provide([
        [matchers.call.fn(authorize), false]
      ])
      .not.call(NativeModules.NativeHDSignerModule.showSeed, root, 'Show your current recovery seed?')
      .not.put(saveRecoverySeed('secret seed'))
      .dispatch(showRecoverySeed())
      .run({ silenceTimeout: true })
  })
})

describe('START_SEED_RECOVERY', () => {
  const seed = 'magic words'
  const deviceAddress = '0x0101device'
  const publicKey = '0x0401public'
  const publicEncKey = 'ENCRYPTION KEY'

  const kp = {
    deviceAddress,
    hexaddress: deviceAddress,
    hdindex: 0,
    publicKey,
    address: `did:ethr:${deviceAddress}`,
    publicEncKey,
    own: { name: 'uPort User' },
    securityLevel: 'simple',
    network: 'mainnet'
  }
  
  describe('ethr did identity', () => {
    it('is successful', () => {
      return expectSaga(recoverySaga)
        .provide([
          [call(importSeed, seed), kp],
          [call(lookupAccount, {deviceAddress})]
        ])
        .put(startWorking('recovery'))
        .call(importSeed, seed)
        .call(lookupAccount, {deviceAddress})
        .put(storeIdentity(kp))
        .put(seedConfirmed())
        .put(fetchCurrentCountry())
        .spawn(fetchAllSettings, {address: kp.address})
        .put(completeProcess('recovery'))
        .dispatch(startSeedRecovery(seed))
        .silentRun()
    })
  })
  
  describe('legacy identity', () => {
    const recoveryAddress = '0x0101recovery'
    const managerType = 'MetaIdentityManager'
    const managerAddress = '0x0102manager'
    const address = '2ocuXMaz4pJPtzkbqeaAeJUvGRdVGm2MJth'
    const hexaddress = MNID.decode(address).address
    const ipfsProfile = 'IPFSHASH'
    const identity = {
      address,
      deviceAddress,
      network: 'rinkeby',
      identityManagerAddress: managerAddress,
      controllerAddress: managerAddress,
      signerType: managerType,
      hexaddress,
      txRelayAddress: TxRelay.networks[4].address
    }
    it('is successful ', () => {
      return expectSaga(recoverySaga)
        .provide([
          [call(importSeed, seed), kp],
          [call(lookupAccount, {deviceAddress}), identity],
          [call(createRecoveryAddress, 0), recoveryAddress],
          [call(encryptionPublicKey, {idIndex: 0, actIndex: 0}), publicEncKey],
          [call(lookupUportHash, address), ipfsProfile],
          [spawn(fetchAllSettings, {address}), undefined]
        ])
        .put(startWorking('recovery'))
        .call(importSeed, seed)
        .call(lookupAccount, {deviceAddress})
        .call(createRecoveryAddress, 0)
        .put(storeIdentity({
          ...identity,
          deviceAddress,
          recoveryAddress,
          publicEncKey,
          hdindex: 0,
          ipfsProfile,
          own: { name: 'uPort User' },
          publicKey: publicKey,
          securityLevel: DEFAULT_LEVEL})
        )
        .put(seedConfirmed())
        .put(fetchCurrentCountry())
        .spawn(fetchAllSettings, {address})
        .put(completeProcess('recovery'))
        .dispatch(startSeedRecovery(seed))
        .silentRun()
    })
  })

  describe('errors', () => {
    it('invalid seed fails', () => {
      return expectSaga(recoverySaga)
        .provide([
          [call(importSeed, seed), undefined]
        ])
        .put(startWorking('recovery'))
        .call(importSeed, seed)
        .put(failProcess('recovery', 'Invalid seed'))
        .put(removeIdentity('new'))
        .put(resetHDWallet())
        .not.call(lookupAccount, {deviceAddress})
        .dispatch(startSeedRecovery(seed))
        .silentRun()
    })

    it('random exception', () => {
      return expectSaga(recoverySaga)
        .provide([
          [call(importSeed, seed), kp],
          [call(lookupAccount, {deviceAddress}), throwError(new Error('Bad Connection'))]
        ])
        .put(startWorking('recovery'))
        .call(importSeed, seed)
        .call(lookupAccount, {deviceAddress})
        .not.call(createRecoveryAddress, 0)
        .put(failProcess('recovery', 'Error recovering identity'))
        .put(removeIdentity('new'))
        .put(resetHDWallet())
        .dispatch(startSeedRecovery(seed))
        .silentRun()
    })
  })
})
