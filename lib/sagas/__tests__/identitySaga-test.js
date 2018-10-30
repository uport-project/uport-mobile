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
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import { currentIdentity } from 'uPortMobile/lib/selectors/identities'
import { hdAccountIndex } from 'uPortMobile/lib/selectors/hdWallet'
import { onboardingNetwork } from 'uPortMobile/lib/selectors/chains'
import { storeIdentity, storeSubAccount, removeIdentity, savePublicUport } from 'uPortMobile/lib/actions/uportActions'
import {
  startWorking, completeProcess, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import { createIdentityKeyPair, createSubAccountAddress, createRecoveryAddress } from '../keychain'

import {
  createEthIdentity, createSubAccount, createKeyPairAccount, createDeviceKey
} from '../identitySaga'

describe('createEthIdentity', () => {
  const deviceAddress = '0x00521965e7bd230323c423d96c657db5b79d099f'
  const recoveryAddress = '0x0101recovery'
  const identity = {
    address: `did:ethr:${deviceAddress}`,
    deviceAddress,
    recoveryAddress,
    hdindex: 0,
    network: 'mainnet'
  }

  it('successfull call', () => {
    return expectSaga(createEthIdentity, {})
      .provide([
        [call(createIdentityKeyPair), identity]
      ])
      .put(startWorking('createIdentity'))
      .call(createIdentityKeyPair)
      .put(completeProcess('createIdentity'))
      .run()
  })
})

describe('createKeyPairAccount', () => {
  const parent = '0x0101parent'
  const publicKey = '0x04publicKey'
  const address = '2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX'
  const hexaddress = '0x00521965e7bd230323c423d96c657db5b79d099f'
  const network = 'mainnet'
  const managerType = 'KeyPair'
  const kp = {
    hdindex: 1,
    address: hexaddress,
    publicKey
  }

  const finalAccount = {
    ...kp,
    address,
    parent,
    signerType: managerType,
    hexaddress,
    network
  }

  describe('non app specific', () => {
    it('successfull call', () => {
      return expectSaga(createKeyPairAccount, {parent, network})
        .provide([
          [select(hdAccountIndex, parent), 1],
          [call(createSubAccountAddress, 1), kp]
        ])
        .put(startWorking('createSubAccount'))
        .call(createSubAccountAddress, 1)
        .put(storeSubAccount(finalAccount))
        .put(completeProcess('createSubAccount'))
        .returns(address)
        .run()
    })  
  })

  describe('app specific', () => {
    const clientId = '0xgnosis'
    it('successfull call', () => {
      return expectSaga(createKeyPairAccount, {parent, network, clientId})
        .provide([
          [select(hdAccountIndex, parent), 1],
          [call(createSubAccountAddress, 1), kp]
        ])
        .put(startWorking('createSubAccount'))
        .call(createSubAccountAddress, 1)
        .put(storeSubAccount({...finalAccount, clientId}))
        .put(completeProcess('createSubAccount'))
        .returns(address)
        .run()
    })
  })
})

describe('createDeviceKey', () => {
  const parent = '0x0101parent'
  const clientId = '0xgnosis'
  const publicKey = '0x04publicKey'
  const hexaddress = '0x00521965e7bd230323c423d96c657db5b79d099f'
  const network = '0xdeadbeef'
  const managerType = 'MetaIdentityManager'
  const kp = {
    hdindex: 1,
    address: hexaddress,
    publicKey
  }

  const finalAccount = {
    ...kp,
    address: `temp-${network}-${clientId}-${hexaddress}`,
    deviceAddress: hexaddress,
    clientId,
    parent,
    signerType: managerType,
    network
  }

  describe('app specific', () => {
    it('successfull call', () => {
      return expectSaga(createDeviceKey, {parent, network, clientId})
        .provide([
          [select(hdAccountIndex, parent), 1],
          [call(createSubAccountAddress, 1), kp]
        ])
        .put(startWorking('createSubAccount'))
        .call(createSubAccountAddress, 1)
        .put(storeSubAccount(finalAccount))
        .put(completeProcess('createSubAccount'))
        .returns(hexaddress)
        .run()
    })
  })
})
