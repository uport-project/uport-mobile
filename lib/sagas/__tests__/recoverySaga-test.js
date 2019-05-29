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
import { RNUportHDSigner } from 'react-native-uport-signer'
import { call, select, spawn } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'

import recoverySaga, { alert } from '../recoverySaga'
import { checkForBackup } from '../hubSaga'
import {
  importSeed,
  createRecoveryAddress,
  encryptionPublicKey,
  DEFAULT_LEVEL
} from '../keychain'
import { lookupAccount } from '../unnu'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import authorize from 'uPortMobile/lib/helpers/authorize'

import {
  showRecoverySeed,
  saveRecoverySeed,
  startSeedRecovery
} from 'uPortMobile/lib/actions/recoveryActions'
import {
  startWorking,
  completeProcess,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import { storeIdentity } from 'uPortMobile/lib/actions/uportActions'
import { seedConfirmed } from 'uPortMobile/lib/actions/HDWalletActions'

import { fetchAllSettings } from '../blockchain'
import { lookupUportHash } from '../persona'
import UportContracts from 'uport-identity'
import { securityLevel } from 'uPortMobile/lib/selectors/chains'
import { Navigation } from 'react-native-navigation'
import SCREENS from 'uPortMobile/lib/screens/Screens'

jest.mock('react-native-navigation', () => {
  return {
    Navigation: {
      push: () => true
    }
  }
})
jest.mock('../persona', () => {
  return {
    lookupUportHash: address => Promise.resolve('IPFS')
  }
})
jest.mock('react-native-uport-signer', () => {
  return {
    RNUportHDSigner: {
      showSeed: async (address, message) => {
        if (address !== '0x7f2d6bb19b6a52698725f4a292e985c51cefc315') { throw new Error('Unsupported address') }
        return 'secret seed'
      },
      importSeed: async seed => {
        return {
          address: '0x7f2d6bb19b6a52698725f4a292e985c51cefc315'
        }
      }
    }
  }
})

jest.mock('../persona', () => {
  return {
    lookupUportHash: address => Promise.resolve('IPFS')
  }
})

const MNID = require('mnid')
const TxRelay = UportContracts.TxRelay.v2
const root = '0x7f2d6bb19b6a52698725f4a292e985c51cefc315'

describe('SHOW_RECOVERY_SEED', () => {
  it('shows seed if user authorizes', () => {
    return expectSaga(recoverySaga)
      .provide([
        [matchers.call.fn(authorize), true],
        [select(hdRootAddress), root]
      ])
      .call(RNUportHDSigner.showSeed, root, 'Show your current recovery seed?')
      .put(saveRecoverySeed('secret seed'))
      .dispatch(showRecoverySeed())
      .run({ silenceTimeout: true })
  })

  it('does not shows seed if user does not authorize', () => {
    return expectSaga(recoverySaga)
      .provide([[matchers.call.fn(authorize), false]])
      .not.call(
        RNUportHDSigner.showSeed,
        root,
        'Show your current recovery seed?'
      )
      .not.put(saveRecoverySeed('secret seed'))
      .dispatch(showRecoverySeed())
      .run({ silenceTimeout: true })
  })
})

describe('START_SEED_RECOVERY', () => {
  const seed = 'magic words'
  const deviceAddress = root
  const publicKey = '0x0401public'
  const publicEncKey = 'ENCRYPTION KEY'
  const componentId = 'COMPONENT_ID'

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
    describe('blank device', () => {
      it('is successful', () => {
        return expectSaga(recoverySaga)
          .provide([
            [select(hdRootAddress), undefined],
            [select(securityLevel), DEFAULT_LEVEL],
            [
              call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL),
              { address: root }
            ],
            [call(importSeed, seed), kp],
            [call(checkForBackup, deviceAddress), true],
            [call(lookupAccount, { deviceAddress })],
            [
              call(alert, 'Recovery Successful!!!', {
                screen: 'recovery.seedSuccess',
                backButtonTitle: '',
                navigatorStyle: {
                  navBarHidden: true
                }
              })
            ]
          ])
          .put(startWorking('recovery'))
          .call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL)
          .call(importSeed, seed)
          .put(storeIdentity(kp))
          .put(seedConfirmed())
          .put(completeProcess('recovery'))
          .call([Navigation, Navigation.push], componentId, {
            component: {
              name: SCREENS.RECOVERY.RestoreSeedSuccess,
              options: {
                topBar: {
                  visible: false
                }
              }
            }
          })
          .dispatch(startSeedRecovery(seed, componentId))
          .silentRun()
      })
    })
  })

  describe('unbacked up did identity', () => {
    describe('blank device', () => {
      it('is successful', () => {
        return expectSaga(recoverySaga)
          .provide([
            [select(hdRootAddress), undefined],
            [select(securityLevel), DEFAULT_LEVEL],
            [
              call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL),
              { address: root }
            ],
            [call(importSeed, seed), kp],
            [call(checkForBackup, deviceAddress), false],
            [call(lookupAccount, { deviceAddress })],
            [
              call(alert, 'Recovery Successful!!!', {
                screen: 'recovery.seedSuccess',
                backButtonTitle: '',
                navigatorStyle: {
                  navBarHidden: true
                }
              })
            ]
          ])
          .put(startWorking('recovery'))
          .call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL)
          .call(importSeed, seed)
          .put(storeIdentity(kp))
          .put(seedConfirmed())
          .put(completeProcess('recovery'))
          .call([Navigation, Navigation.push], componentId, {
            component: {
              name: SCREENS.RECOVERY.RestoreSeedSuccess,
              options: {
                topBar: {
                  visible: false
                }
              }
            }
          })
          .dispatch(startSeedRecovery(seed, componentId))
          .silentRun()
      })
    })
  })

  describe('migrated identity', () => {
    describe('blank device', () => {
      it('is successful', () => {
        return expectSaga(recoverySaga)
          .provide([
            [select(hdRootAddress), undefined],
            [select(securityLevel), DEFAULT_LEVEL],
            [
              call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL),
              { address: root }
            ],
            [call(importSeed, seed), kp],
            [call(checkForBackup, deviceAddress), true],
            [
              call(alert, 'Recovery Successful!!!', {
                screen: 'recovery.seedSuccess',
                backButtonTitle: '',
                navigatorStyle: {
                  navBarHidden: true
                }
              })
            ]
          ])
          .put(startWorking('recovery'))
          .call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL)
          .call(importSeed, seed)
          .put(storeIdentity(kp))
          .put(seedConfirmed())
          .put(completeProcess('recovery'))
          .call([Navigation, Navigation.push], componentId, {
            component: {
              name: SCREENS.RECOVERY.RestoreSeedSuccess,
              options: {
                topBar: {
                  visible: false
                }
              }
            }
          })
          .dispatch(startSeedRecovery(seed, componentId))
          .silentRun()
      })
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
          [select(securityLevel), DEFAULT_LEVEL],
          [
            call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL),
            { address: root }
          ],
          [call(importSeed, seed), kp],
          [select(hdRootAddress), undefined],
          [call(lookupAccount, { deviceAddress }), identity],
          [call(createRecoveryAddress, 0), recoveryAddress],
          [
            call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }),
            publicEncKey
          ],
          [call(checkForBackup, deviceAddress), false],
          [call(lookupUportHash, address), ipfsProfile],
          [spawn(fetchAllSettings, { address }), undefined]
        ])
        .put(startWorking('recovery'))
        .call(importSeed, seed)
        .call(lookupAccount, { deviceAddress })
        .call(createRecoveryAddress, 0)
        .put(
          storeIdentity({
            ...identity,
            deviceAddress,
            recoveryAddress,
            publicEncKey,
            hdindex: 0,
            ipfsProfile,
            own: { name: 'uPort User' },
            publicKey: publicKey,
            securityLevel: DEFAULT_LEVEL
          })
        )
        .put(seedConfirmed())
        .put(completeProcess('recovery'))
        .call([Navigation, Navigation.push], componentId, {
          component: {
            name: SCREENS.RECOVERY.RestoreSeedSuccess,
            options: {
              topBar: {
                visible: false
              }
            }
          }
        })
        .dispatch(startSeedRecovery(seed, componentId))
        .silentRun()
    })
  })

  describe('restored state missing seed', () => {
    it('is successful', () => {
      return expectSaga(recoverySaga)
        .provide([
          [select(securityLevel), DEFAULT_LEVEL],
          [
            call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL),
            { address: root }
          ],
          [select(hdRootAddress), deviceAddress]
          // [
          //   call(Navigation.showModal, {
          //     component: {},
          //   }),
          // ],
        ])
        .put(startWorking('recovery'))
        .call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL)
        .not.call(checkForBackup, deviceAddress)
        .not.call(lookupAccount, { deviceAddress })
        .not.put(storeIdentity(kp))
        .put(seedConfirmed())
        .put(completeProcess('recovery'))
        .call([Navigation, Navigation.push], componentId, {
          component: {
            name: SCREENS.RECOVERY.RestoreSeedSuccess,
            options: {
              topBar: {
                visible: false
              }
            }
          }
        })
        .dispatch(startSeedRecovery(seed, componentId))
        .silentRun()
    })

    it('working but incorrect seed', () => {
      return expectSaga(recoverySaga)
        .provide([
          [select(securityLevel), DEFAULT_LEVEL],
          [
            call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL),
            { address: root }
          ],
          [select(hdRootAddress), '0xother']
        ])
        .put(startWorking('recovery'))
        .call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL)
        .put(
          failProcess(
            'recovery',
            'Seed does not match the Identity stored on your Phone'
          )
        )
        .dispatch(startSeedRecovery(seed))
        .silentRun()
    })
  })

  describe('errors', () => {
    it('invalid seed fails', () => {
      return expectSaga(recoverySaga)
        .provide([
          [select(securityLevel), DEFAULT_LEVEL],
          [call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL), undefined]
        ])
        .put(startWorking('recovery'))
        .call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL)
        .put(failProcess('recovery', 'Invalid seed'))
        .dispatch(startSeedRecovery(seed))
        .silentRun()
    })

    it('random exception', () => {
      return expectSaga(recoverySaga)
        .provide([
          [select(securityLevel), DEFAULT_LEVEL],
          [
            call(RNUportHDSigner.importSeed, seed, DEFAULT_LEVEL),
            { address: root }
          ],
          [call(importSeed, seed), kp],
          [select(hdRootAddress), undefined],
          [call(checkForBackup, deviceAddress), false],
          [
            call(lookupAccount, { deviceAddress }),
            throwError(new Error('Bad Connection'))
          ]
        ])
        .put(startWorking('recovery'))
        .call(importSeed, seed)
        .call(lookupAccount, { deviceAddress })
        .not.call(createRecoveryAddress, 0)
        .put(failProcess('recovery', 'Error recovering identity'))
        .dispatch(startSeedRecovery(seed))
        .silentRun()
    })
  })
})
