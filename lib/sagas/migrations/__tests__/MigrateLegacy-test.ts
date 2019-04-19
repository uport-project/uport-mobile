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
import { select, call } from 'redux-saga/effects'
import { migrate } from '../MigrateLegacy'
import { createAttestationToken } from 'uPortMobile/lib/sagas/jwt'
import { MigrationStep } from 'uPortMobile/lib/constants/MigrationActionTypes'
import { saveMessage } from 'uPortMobile/lib/actions/processStatusActions'
import { subAccounts, currentAddress, ownClaimsMap, hasMainnetAccounts } from 'uPortMobile/lib/selectors/identities'
import { updateIdentity, storeIdentity, storeConnection, storeExternalUport } from 'uPortMobile/lib/actions/uportActions'
import {
  createIdentityKeyPair,
  canSignFor,
  hasWorkingSeed,
  addressFor,
  encryptionPublicKey,
  DEFAULT_LEVEL,
} from '../../keychain'
import { networkSettings } from 'uPortMobile/lib/selectors/chains'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import { hasAttestations } from 'uPortMobile/lib/selectors/attestations';
import { resetHDWallet } from 'uPortMobile/lib/actions/HDWalletActions'
import { handleURL } from 'uPortMobile/lib/actions/requestActions';
import { dataBackup } from 'uPortMobile/lib/selectors/settings';
import { handleStartSwitchingSettingsChange } from '../../hubSaga';
import { setDataBackup } from 'uPortMobile/lib/actions/settingsActions';

const step = MigrationStep.MigrateLegacy

describe('MigrateLegacy', () => {
  const hdroot = '0x01234root'
  const own = { name: 'Roberto Herrera', description: 'Swell and Sovereign Guy' }
  const oldId = {
    controllerAddress: '0xd35c4800b1f121185f32e43f886e96a6d32a6021',
    deviceAddress: '0xf8560d31daa5d9e033d082945395ffc65abbc3df',
    network: 'rinkeby',
    recoveryAddress: '0xf974a3dee42a1f8638948513793d6ce77da5d1da',
    address: '2oxo6Sb56dcQgHunK1WLNjo9xcTV4gGbP9k',
    recoveryType: 'seed',
    nonce: 2,
    fuelToken:
      // tslint:disable-next-line:max-line-length
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiJuaXNhYmEudXBvcnQubWUiLCJpYXQiOjE1MDI0NTQ3NTcsImV4cCI6MTUwMjQ1NTA1Nywic3ViIjoiMHhmODU2MGQzMWRhYTVkOWUwMzNkMDgyOTQ1Mzk1ZmZjNjVhYmJjM2RmIiwiYXVkIjpbIm5pc2FiYS51cG9ydC5tZSIsInVubnUudXBvcnQubWUiLCJzZW5zdWkudXBvcnQubWUiXSwicGhvbmVOdW1iZXIiOiIrMTMxMDQwNDE1ODYifQ.udCvdFvRe-PuiknpEllkdgLre_GSn5UjVHwolYZzVl3KvT2sTrylcsy5LQyUdyyWjUsBjlAkfm9GzZgYPITmnw',
    hexaddress: '0xda7d527872a94acf363b9b43caae1bdd6ff577c5',
  }
  const legacyDID = oldId.address
  const newDID = `did:ethr:${hdroot}`
  const publicKey = 'signingpublickey'
  const encPublicKey = 'encryptionPublicKey'
  const hdaccount1 = {
    parent: legacyDID,
    address: 'account1',
    hdindex: 1,
  }
  const hdaccount2 = {
    parent: legacyDID,
    address: 'account2',
    hdindex: 2,
  }
  const nonhdaccount = {
    parent: legacyDID,
    address: 'account3',
  }
  const accounts = [hdaccount1, hdaccount2, nonhdaccount]

  describe('migrate()', () => {
    describe('can no longer sign for root', () => {
      describe('working seed', () => {
        describe('non HD root ID', () => {
          it('should replace root Identity using hdroot as device key', () => {
            return expectSaga(migrate)
              .provide([
                [select(dataBackup), false],
                [call(canSignFor, legacyDID), false],
                [call(hasWorkingSeed), true],
                [select(currentAddress), legacyDID],
                [select(networkSettings), oldId],
                [call(addressFor, 0, 0), { address: hdroot, publicKey }],
                [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
                [select(ownClaimsMap), own],
                [select(hasAttestations), false],
                [select(hasMainnetAccounts), false],
                [select(subAccounts, legacyDID), []],
              ])
              .put(
                storeIdentity({
                  address: `did:ethr:${hdroot}`,
                  network: 'mainnet',
                  deviceAddress: hdroot,
                  hexaddress: hdroot,
                  recoveryType: 'seed',
                  signerType: 'KeyPair',
                  hdindex: 0,
                  encPublicKey,
                  publicKey,
                  own,
                  securityLevel: DEFAULT_LEVEL,
                }),
              )
              .put(
                updateIdentity(legacyDID, {
                  disabled: true,
                  error: `Legacy Test Net Identity has been Disabled`,
                }),
              )
              .put(saveMessage(step, 'New mainnet identity is created'))
              .returns(true)
              .run()
          })

          describe('with sub accounts', () => {
            describe('able to sign for accounts', () => {
              it('should clean it up', () => {
                return expectSaga(migrate)
                  .provide([
                    [select(dataBackup), false],
                    [call(canSignFor, legacyDID), false],
                    [call(hasWorkingSeed), true],
                    [select(currentAddress), legacyDID],
                    [select(networkSettings), oldId],
                    [call(addressFor, 0, 0), { address: hdroot, publicKey }],
                    [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
                    [select(ownClaimsMap), own],
                    [select(hasAttestations), false],
                    [select(hasMainnetAccounts), false],
                    [select(subAccounts, legacyDID), accounts],
                    [call(canSignFor, 'account1'), true],
                    [call(canSignFor, 'account2'), true],
                    [call(canSignFor, 'account3'), true],
                  ])
                  .put(
                    storeIdentity({
                      address: newDID,
                      network: 'mainnet',
                      deviceAddress: hdroot,
                      hexaddress: hdroot,
                      recoveryType: 'seed',
                      signerType: 'KeyPair',
                      hdindex: 0,
                      encPublicKey,
                      publicKey,
                      own,
                      securityLevel: DEFAULT_LEVEL,
                    }),
                  )
                  .put(
                    updateIdentity(legacyDID, {
                      disabled: true,
                      error: `Legacy Test Net Identity has been Disabled`,
                    }),
                  )
                  .put(saveMessage(step, 'New mainnet identity is created'))
                  .returns(true)
                  .run()
              })
            })

            describe('unable to sign for accounts', () => {
              it('should clean it up', () => {
                return expectSaga(migrate)
                  .provide([
                    [select(dataBackup), false],
                    [call(canSignFor, legacyDID), false],
                    [call(hasWorkingSeed), true],
                    [select(currentAddress), legacyDID],
                    [select(networkSettings), oldId],
                    [call(addressFor, 0, 0), { address: hdroot, publicKey }],
                    [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
                    [select(ownClaimsMap), own],
                    [select(hasAttestations), false],
                    [select(hasMainnetAccounts), false],
                    [select(subAccounts, legacyDID), accounts],
                    [call(canSignFor, 'account1'), false],
                    [call(canSignFor, 'account2'), false],
                    [call(canSignFor, 'account3'), true],
                  ])
                  .put(
                    storeIdentity({
                      address: `did:ethr:${hdroot}`,
                      network: 'mainnet',
                      deviceAddress: hdroot,
                      hexaddress: hdroot,
                      recoveryType: 'seed',
                      signerType: 'KeyPair',
                      hdindex: 0,
                      encPublicKey,
                      publicKey,
                      own,
                      securityLevel: DEFAULT_LEVEL,
                    }),
                  )
                  .put(
                    updateIdentity(legacyDID, {
                      disabled: true,
                      error: `Legacy Test Net Identity has been Disabled`,
                    }),
                  )
                  .put(
                    updateIdentity('account1', {
                      disabled: true,
                      error: `Legacy Identity has been Disabled. Keys are no longer available.`,
                    }),
                  )
                  .put(
                    updateIdentity('account2', {
                      disabled: true,
                      error: `Legacy Identity has been Disabled. Keys are no longer available.`,
                    }),
                  )
                  .put(saveMessage(step, 'New mainnet identity is created'))
                  .returns(true)
                  .run()
              })
            })
          })
        })
      })
      describe('non existing seed', () => {
        describe('HD root ID', () => {
          it('should replace root Identity using hdroot as device key', () => {
            return expectSaga(migrate)
              .provide([
                [select(dataBackup), false],
                [select(currentAddress), legacyDID],
                [call(canSignFor, legacyDID), false],
                [call(hasWorkingSeed), false],
                [select(hdRootAddress), hdroot],
                [select(networkSettings), oldId],
                [select(hasAttestations), false],
                [select(hasMainnetAccounts), false],
                [call(createIdentityKeyPair), { address: newDID }],
                [select(ownClaimsMap), own],
                [select(subAccounts, legacyDID), []],
              ])
              .put(resetHDWallet())
              .call(createIdentityKeyPair)
              .put(updateIdentity(newDID, { own }))
              .put(
                updateIdentity(legacyDID, {
                  disabled: true,
                  error: `Legacy Test Net Identity has been Disabled`,
                }),
              )
              .put(saveMessage(step, 'New mainnet identity is created'))
              .returns(true)
              .run()
          })
        })
        describe('NON HD root ID', () => {
          it('should replace root Identity using hdroot as device key', () => {
            return expectSaga(migrate)
              .provide([
                [select(dataBackup), false],
                [select(currentAddress), legacyDID],
                [call(canSignFor, legacyDID), false],
                [call(hasWorkingSeed), false],
                [select(hdRootAddress), undefined],
                [select(networkSettings), oldId],
                [select(hasAttestations), false],
                [select(hasMainnetAccounts), false],
                [call(createIdentityKeyPair), { address: newDID }],
                [select(ownClaimsMap), own],
                [select(subAccounts, legacyDID), []],
              ])
              .call(createIdentityKeyPair)
              .put(updateIdentity(newDID, { own }))
              .put(
                updateIdentity(legacyDID, {
                  disabled: true,
                  error: `Legacy Test Net Identity has been Disabled`,
                }),
              )
              .put(saveMessage(step, 'New mainnet identity is created'))
              .returns(true)
              .run()
          })

          describe('with sub accounts', () => {
            describe('able to sign for accounts', () => {
              it('should clean it up', () => {
                return expectSaga(migrate)
                  .provide([
                    [select(dataBackup), false],
                    [select(currentAddress), legacyDID],
                    [call(canSignFor, legacyDID), false],
                    [call(hasWorkingSeed), false],
                    [select(hdRootAddress), undefined],
                    [call(createIdentityKeyPair), { address: newDID }],
                    [select(ownClaimsMap), own],
                    [select(hasAttestations), false],
                    [select(hasMainnetAccounts), false],
                    [select(subAccounts, legacyDID), accounts],
                    [call(canSignFor, 'account1'), true],
                    [call(canSignFor, 'account2'), true],
                    [call(canSignFor, 'account3'), true],
                  ])
                  .call(createIdentityKeyPair)
                  .put(updateIdentity(newDID, { own }))
                  .put(
                    updateIdentity(legacyDID, {
                      disabled: true,
                      error: `Legacy Test Net Identity has been Disabled`,
                    }),
                  )
                  .put(saveMessage(step, 'New mainnet identity is created'))
                  .returns(true)
                  .run()
              })
            })

            describe('unable to sign for accounts', () => {
              it('should clean it up', () => {
                return expectSaga(migrate)
                  .provide([
                    [select(dataBackup), false],
                    [select(currentAddress), legacyDID],
                    [call(canSignFor, legacyDID), false],
                    [call(hasWorkingSeed), false],
                    [select(hdRootAddress), undefined],
                    [select(networkSettings), oldId],
                    [call(createIdentityKeyPair), { address: newDID }],
                    [select(ownClaimsMap), own],
                    [select(hasAttestations), false],
                    [select(hasMainnetAccounts), false],
                    [select(subAccounts, legacyDID), accounts],
                    [call(canSignFor, 'account1'), false],
                    [call(canSignFor, 'account2'), false],
                    [call(canSignFor, 'account3'), true],
                  ])
                  .call(createIdentityKeyPair)
                  .put(updateIdentity(newDID, { own }))
                  .put(
                    updateIdentity(legacyDID, {
                      disabled: true,
                      error: `Legacy Test Net Identity has been Disabled`,
                    }),
                  )
                  .put(
                    updateIdentity('account1', {
                      disabled: true,
                      error: `Legacy Identity has been Disabled. Keys are no longer available.`,
                    }),
                  )
                  .put(
                    updateIdentity('account2', {
                      disabled: true,
                      error: `Legacy Identity has been Disabled. Keys are no longer available.`,
                    }),
                  )
                  .put(saveMessage(step, 'New mainnet identity is created'))
                  .returns(true)
                  .run()
              })
            })
          })
        })
      })
    })
  })

  describe('can still sign for root', () => {
    describe('working seed', () => {
      describe('non HD root ID', () => {
        it('should replace root Identity using hdroot as device key', () => {
          return expectSaga(migrate)
            .provide([
              [select(dataBackup), false],
              [call(canSignFor, legacyDID), true],
              [call(hasWorkingSeed), true],
              [select(currentAddress), legacyDID],
              [select(networkSettings), oldId],
              [select(hasAttestations), false],
              [select(hasMainnetAccounts), false],
              [call(addressFor, 0, 0), { address: hdroot, publicKey }],
              [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
              [select(ownClaimsMap), own],
              [select(subAccounts, legacyDID), []],
            ])
            .put(
              storeIdentity({
                address: newDID,
                network: 'mainnet',
                deviceAddress: hdroot,
                hexaddress: hdroot,
                recoveryType: 'seed',
                signerType: 'KeyPair',
                hdindex: 0,
                encPublicKey,
                publicKey,
                own,
                securityLevel: DEFAULT_LEVEL,
              }),
            )
            .put(saveMessage(step, 'New mainnet identity is created'))
            .returns(true)
            .run()
        })

        describe('backed up', () => {
          it('should replace root Identity using hdroot as device key', () => {
            return expectSaga(migrate)
              .provide([
                [select(dataBackup), true],
                [call(canSignFor, legacyDID), true],
                [call(hasWorkingSeed), true],
                [select(currentAddress), legacyDID],
                [select(networkSettings), oldId],
                [select(hasAttestations), false],
                [select(hasMainnetAccounts), false],
                [call(addressFor, 0, 0), { address: hdroot, publicKey }],
                [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
                [select(ownClaimsMap), own],
                [select(subAccounts, legacyDID), []],
                [call(handleStartSwitchingSettingsChange, { isOn: false}), undefined],
                [call(handleStartSwitchingSettingsChange, { isOn: true}), undefined]
              ])
              .call(handleStartSwitchingSettingsChange, { isOn: false})
              .put(
                storeIdentity({
                  address: newDID,
                  network: 'mainnet',
                  deviceAddress: hdroot,
                  hexaddress: hdroot,
                  recoveryType: 'seed',
                  signerType: 'KeyPair',
                  hdindex: 0,
                  encPublicKey,
                  publicKey,
                  own,
                  securityLevel: DEFAULT_LEVEL,
                }),
              )
              .put(saveMessage(step, 'New mainnet identity is created'))
              .call(handleStartSwitchingSettingsChange, { isOn: true})
              .returns(true)
              .run()
          })  
        })

        describe('with mainnet accounts', () => {
          it('should replace root Identity using hdroot as device key', () => {
            const OWNS = 'OWNS'
            return expectSaga(migrate)
              .provide([
                [select(dataBackup), false],
                [call(createAttestationToken, legacyDID, `did:ethr:${hdroot}`, { owns: legacyDID }), OWNS],
                [call(canSignFor, legacyDID), true],
                [call(hasWorkingSeed), true],
                [select(currentAddress), legacyDID],
                [select(networkSettings), oldId],
                [select(hasAttestations), false],
                [select(hasMainnetAccounts), true],
                [call(addressFor, 0, 0), { address: hdroot, publicKey }],
                [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
                [select(ownClaimsMap), own],
                [select(subAccounts, legacyDID), []],
              ])
              .put(
                storeIdentity({
                  address: newDID,
                  network: 'mainnet',
                  deviceAddress: hdroot,
                  hexaddress: hdroot,
                  recoveryType: 'seed',
                  signerType: 'KeyPair',
                  hdindex: 0,
                  encPublicKey,
                  publicKey,
                  own,
                  securityLevel: DEFAULT_LEVEL,
                }),
              )
              .call(createAttestationToken, legacyDID, newDID, { owns: legacyDID })
              .put(handleURL(`me.uport:req/${OWNS}`, { popup: false }))
              .put(storeExternalUport(legacyDID, own))
              .put(storeConnection(newDID, 'knows', legacyDID))
              .put(saveMessage(step, 'New mainnet identity is created'))
              .returns(true)
              .run()
          })  
        })

        describe('with attestations', () => {
          it('should replace root Identity using hdroot as device key', () => {
            const OWNS = 'OWNS'
            return expectSaga(migrate)
              .provide([
                [select(dataBackup), false],
                [call(createAttestationToken, legacyDID, `did:ethr:${hdroot}`, { owns: legacyDID }), OWNS],
                [call(canSignFor, legacyDID), true],
                [call(hasWorkingSeed), true],
                [select(currentAddress), legacyDID],
                [select(networkSettings), oldId],
                [select(hasAttestations), true],
                [select(hasMainnetAccounts), false],
                [call(addressFor, 0, 0), { address: hdroot, publicKey }],
                [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
                [select(ownClaimsMap), own],
                [select(subAccounts, legacyDID), []],
              ])
              .put(
                storeIdentity({
                  address: newDID,
                  network: 'mainnet',
                  deviceAddress: hdroot,
                  hexaddress: hdroot,
                  recoveryType: 'seed',
                  signerType: 'KeyPair',
                  hdindex: 0,
                  encPublicKey,
                  publicKey,
                  own,
                  securityLevel: DEFAULT_LEVEL,
                }),
              )
              .call(createAttestationToken, legacyDID, newDID, { owns: legacyDID })
              .put(handleURL(`me.uport:req/${OWNS}`, { popup: false }))
              .put(storeExternalUport(legacyDID, own))
              .put(storeConnection(newDID, 'knows', legacyDID))
              .put(saveMessage(step, 'New mainnet identity is created'))
              .returns(true)
              .run()
          })

        })

        describe('with sub accounts', () => {
          describe('able to sign for accounts', () => {
            it('should clean it up', () => {
              return expectSaga(migrate)
                .provide([
                  [select(dataBackup), false],
                  [call(canSignFor, legacyDID), true],
                  [call(hasWorkingSeed), true],
                  [select(currentAddress), legacyDID],
                  [select(networkSettings), oldId],
                  [select(hasAttestations), false],
                  [select(hasMainnetAccounts), false],
                  [call(addressFor, 0, 0), { address: hdroot, publicKey }],
                  [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
                  [select(ownClaimsMap), own],
                  [select(subAccounts, legacyDID), accounts],
                  [call(canSignFor, 'account1'), true],
                  [call(canSignFor, 'account2'), true],
                  [call(canSignFor, 'account3'), true],
                ])
                .put(
                  storeIdentity({
                    address: `did:ethr:${hdroot}`,
                    network: 'mainnet',
                    deviceAddress: hdroot,
                    hexaddress: hdroot,
                    recoveryType: 'seed',
                    signerType: 'KeyPair',
                    hdindex: 0,
                    encPublicKey,
                    publicKey,
                    own,
                    securityLevel: DEFAULT_LEVEL,
                  }),
                )
                .put(saveMessage(step, 'New mainnet identity is created'))
                .returns(true)
                .run()
            })
          })

          describe('unable to sign for accounts', () => {
            it('should clean it up', () => {
              return expectSaga(migrate)
                .provide([
                  [select(dataBackup), false],
                  [call(canSignFor, legacyDID), true],
                  [call(hasWorkingSeed), true],
                  [select(currentAddress), legacyDID],
                  [select(networkSettings), oldId],
                  [select(hasAttestations), false],
                  [select(hasMainnetAccounts), false],
                  [call(addressFor, 0, 0), { address: hdroot, publicKey }],
                  [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), encPublicKey],
                  [select(ownClaimsMap), own],
                  [select(subAccounts, legacyDID), accounts],
                  [call(canSignFor, 'account1'), false],
                  [call(canSignFor, 'account2'), false],
                  [call(canSignFor, 'account3'), true],
                ])
                .put(
                  storeIdentity({
                    address: `did:ethr:${hdroot}`,
                    network: 'mainnet',
                    deviceAddress: hdroot,
                    hexaddress: hdroot,
                    recoveryType: 'seed',
                    signerType: 'KeyPair',
                    hdindex: 0,
                    encPublicKey,
                    publicKey,
                    own,
                    securityLevel: DEFAULT_LEVEL,
                  }),
                )
                .put(
                  updateIdentity('account1', {
                    disabled: true,
                    error: `Legacy Identity has been Disabled. Keys are no longer available.`,
                  }),
                )
                .put(
                  updateIdentity('account2', {
                    disabled: true,
                    error: `Legacy Identity has been Disabled. Keys are no longer available.`,
                  }),
                )
                .put(saveMessage(step, 'New mainnet identity is created'))
                .returns(true)
                .run()
            })
          })
        })
      })
    })
    describe('non existing seed', () => {
      describe('HD root ID', () => {
        it('should replace root Identity using hdroot as device key', () => {
          return expectSaga(migrate)
            .provide([
              [select(dataBackup), false],
              [select(currentAddress), legacyDID],
              [call(canSignFor, legacyDID), true],
              [call(hasWorkingSeed), false],
              [select(hdRootAddress), hdroot],
              [select(hasAttestations), false],
              [select(hasMainnetAccounts), false],
              [select(networkSettings), oldId],
              [call(createIdentityKeyPair), { address: newDID }],
              [select(ownClaimsMap), own],
              [select(subAccounts, legacyDID), []],
            ])
            .put(resetHDWallet())
            .call(createIdentityKeyPair)
            .put(updateIdentity(newDID, { own }))
            .put(saveMessage(step, 'New mainnet identity is created'))
            .returns(true)
            .run()
        })
      })
      describe('NON HD root ID', () => {
        it('should replace root Identity using hdroot as device key', () => {
          return expectSaga(migrate)
            .provide([
              [select(dataBackup), false],
              [select(currentAddress), legacyDID],
              [call(canSignFor, legacyDID), true],
              [call(hasWorkingSeed), false],
              [select(hdRootAddress), undefined],
              [select(networkSettings), oldId],
              [select(hasAttestations), false],
              [select(hasMainnetAccounts), false],
              [call(createIdentityKeyPair), { address: newDID }],
              [select(ownClaimsMap), own],
              [select(subAccounts, legacyDID), []],
            ])
            .call(createIdentityKeyPair)
            .put(updateIdentity(newDID, { own }))
            .put(saveMessage(step, 'New mainnet identity is created'))
            .returns(true)
            .run()
        })
      })
    })
  })
})
