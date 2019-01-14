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
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { select, call } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import migrate, { identityManagerInstance, isOwner, signFunctionCall, addOwnerIM, addOwnerRC, waitForEvents } from '../IdentityManagerChangeOwner'

import {
  selectOrCreateSeed
} from 'uPortMobile/lib/sagas/keychain'

import {
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  saveMessage,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import {
  networkSettings,
  isFullyHD,
  web3ForNetwork
} from 'uPortMobile/lib/selectors/chains'

import {
  hdRootAddress
} from 'uPortMobile/lib/selectors/hdWallet'

const step = MigrationStep.IdentityManagerChangeOwner

describe('IdentityManagerChangeOwner', () => {
  const network = 'rinkeby'
  const hexaddress = '0xidentity'
  const address = 'IdentityMNID'
  const controllerAddress = '0x00521965e7bd230323c423d96c657db5b79d099f'
  const controllerMNID = '2ocuXMaz4pJPtzkbqeaAeJUvGRdVGm2MJth'
  const deviceAddress = '0xoldDevice'
  const newOwner = '0xNewRoot'
  const tx = '0xtxhash'

  describe('migrate()', () => {
    describe('already fully HD', () => {
      it('should not do anything', () => {
        return expectSaga(migrate)
          .provide([
            [select(isFullyHD), true]
          ])
          .returns(true)
          .run()
      })
    })

    for (let signerType of ['IdentityManager', 'MetaIdentityManager']) {
      describe(signerType, () => {
        const settings = {
          signerType,
          network,
          address,
          hexaddress,
          deviceAddress,
          controllerAddress
        }
        const identityManager = 'identityManagerInstance'

        describe('addOwner transaction had gone through but app did not register this', () => {
          it('should not do anything', () => {
            return expectSaga(migrate)
              .provide([
                [select(isFullyHD), false],
                [call(selectOrCreateSeed), newOwner],
                [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), true],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager]
              ])
              .call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType})
              .returns(true)
              .run()
          })
        })

        describe('happy path', () => {
          it('should call create addOwner transaction', () => {
            return expectSaga(migrate)
              .provide([
                [select(isFullyHD), false],
                [call(selectOrCreateSeed), newOwner],
                [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), false],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager],
                [call(addOwnerIM, settings, newOwner), true]
              ])
              .call(selectOrCreateSeed)
              .put(saveMessage(step, `New Seed Created ${newOwner}`))
              .call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType})
              .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
              .call(addOwnerIM, settings, newOwner)
              .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
              .put(saveMessage(step, `Owner status of ${address} successfully changed to ${newOwner}`))
              .returns(true)
              .run()
          })
        })

        describe('transaction did not go through', () => {
          for (let attempt = 0; attempt < 2; attempt++) {
            describe(`attempt: ${attempt + 1}`, () => {
              it('should retry', () => {
                return expectSaga(migrate, attempt)
                .provide([
                  [call(selectOrCreateSeed), newOwner],
                  [select(isFullyHD), false],
                  [select(networkSettings), settings],
                  [call(identityManagerInstance, settings), identityManager],
                  [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), false],
                  [call(addOwnerIM, settings, newOwner), false],
                  [call(migrate, attempt + 1), false]
                ])
                .call(selectOrCreateSeed)
                .call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType})
                .put(saveMessage(step, `New Seed Created ${newOwner}`))
                .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
                .call(addOwnerIM, settings, newOwner)
                .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
                .call(migrate, attempt + 1)
                .returns(false)
                .run()
              })
            })
          }

          describe('4th attempt', () => {
            it('should fail process', () => {
              return expectSaga(migrate, 3)
                .provide([
                  [call(selectOrCreateSeed), newOwner],
                  [select(isFullyHD), false],
                  [select(networkSettings), settings],
                  [call(identityManagerInstance, settings), identityManager],
                  [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), false],
                  [call(addOwnerIM, settings, newOwner), false]
                ])
                .call(selectOrCreateSeed)
                .call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType})
                .put(saveMessage(step, `New Seed Created ${newOwner}`))
                .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
                .call(addOwnerIM, settings, newOwner)
                .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
                .put(failProcess(step, `Transaction Failed to add ${newOwner} as owner of ${settings.address}`))
                .not.call(migrate, 4)
                .returns(false)
                .run()
            })
          })
        })

        describe('error thrown', () => {
          it('should fail process', () => {
            return expectSaga(migrate)
              .provide([
                [call(selectOrCreateSeed), newOwner],
                [select(isFullyHD), false],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager],
                [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), false],
                [call(addOwnerIM, settings, newOwner), throwError(new Error('Signing Did not Work'))]
              ])
              .call(selectOrCreateSeed)
              .put(saveMessage(step, `New Seed Created ${newOwner}`))
              .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
              .call(addOwnerIM, settings, newOwner)
              .put(failProcess(step, 'Signing Did not Work'))
              .returns(false)
              .run()
          })
        })
      })
    }

    for (let signerType of ['proxy', null, undefined]) {
      describe(`signerType = ${signerType}`, () => {
        const settings = {
          signerType,
          network,
          address,
          hexaddress,
          deviceAddress,
          controllerAddress
        }
        const identityManager = 'identityManagerInstance'

        describe('addOwner transaction had gone through but app did not register this', () => {
          it('should not do anything', () => {
            return expectSaga(migrate)
              .provide([
                [select(isFullyHD), false],
                [call(selectOrCreateSeed), newOwner],
                [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), true],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager]
              ])
              .call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType})
              .returns(true)
              .run()
          })
        })

        describe('happy path', () => {
          it('should call create addOwner transaction', () => {
            return expectSaga(migrate)
              .provide([
                [select(isFullyHD), false],
                [call(selectOrCreateSeed), newOwner],
                [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), false],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager],
                [call(addOwnerRC, settings, identityManager, newOwner), true]
              ])
              .call(selectOrCreateSeed)
              .put(saveMessage(step, `New Seed Created ${newOwner}`))
              .call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType})
              .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
              .call(addOwnerRC, settings, identityManager, newOwner)
              .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
              .put(saveMessage(step, `Owner status of ${address} successfully changed to ${newOwner}`))
              .returns(true)
              .run()
          })
        })

        describe('transaction did not go through', () => {
          for (let attempt = 0; attempt < 2; attempt++) {
            describe(`attempt: ${attempt + 1}`, () => {
              it('should retry', () => {
                return expectSaga(migrate, attempt)
                .provide([
                  [call(selectOrCreateSeed), newOwner],
                  [select(isFullyHD), false],
                  [select(networkSettings), settings],
                  [call(identityManagerInstance, settings), identityManager],
                  [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), false],
                  [call(addOwnerRC, settings, identityManager, newOwner), false],
                  [call(migrate, attempt + 1), false]
                ])
                .call(selectOrCreateSeed)
                .call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType})
                .put(saveMessage(step, `New Seed Created ${newOwner}`))
                .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
                .call(addOwnerRC, settings, identityManager, newOwner)
                .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
                .call(migrate, attempt + 1)
                .returns(false)
                .run()
              })
            })
          }

          describe('4th attempt', () => {
            it('should fail process', () => {
              return expectSaga(migrate, 3)
                .provide([
                  [call(selectOrCreateSeed), newOwner],
                  [select(isFullyHD), false],
                  [select(networkSettings), settings],
                  [call(identityManagerInstance, settings), identityManager],
                  [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), false],
                  [call(addOwnerRC, settings, identityManager, newOwner), false]
                ])
                .call(selectOrCreateSeed)
                .call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType})
                .put(saveMessage(step, `New Seed Created ${newOwner}`))
                .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
                .call(addOwnerRC, settings, identityManager, newOwner)
                .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
                .put(failProcess(step, `Transaction Failed to add ${newOwner} as owner of ${settings.address}`))
                .not.call(migrate, 4)
                .returns(false)
                .run()
            })
          })
        })

        describe('error thrown', () => {
          it('should fail process', () => {
            return expectSaga(migrate)
              .provide([
                [call(selectOrCreateSeed), newOwner],
                [select(isFullyHD), false],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager],
                [call(isOwner, {identityManager, identity: hexaddress, newOwner, signerType}), false],
                [call(addOwnerRC, settings, identityManager, newOwner), throwError(new Error('Signing Did not Work'))]
              ])
              .call(selectOrCreateSeed)
              .put(saveMessage(step, `New Seed Created ${newOwner}`))
              .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
              .call(addOwnerRC, settings, identityManager, newOwner)
              .put(failProcess(step, 'Signing Did not Work'))
              .returns(false)
              .run()
          })
        })
      })
    }
  })

  describe('addOwnerIM()', () => {
    describe('MetaIdentityManager', () => {
      const settings = {
        signerType: 'MetaIdentityManager',
        network,
        address,
        hexaddress,
        deviceAddress,
        controllerAddress
      }

      it('should create tx', () => {
        return expectSaga(addOwnerIM, settings, newOwner)
          .provide([
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Add new Device Address as owner',
              signerType: 'devicemeta',
              target: address,
              fn: `addOwner(address ${deviceAddress}, address ${hexaddress}, address ${newOwner})`
            }), tx],
            [call(waitForEvents, settings, tx), [{_eventName: 'LogOwnerAdded', identity: hexaddress, owner: newOwner}]]
          ])
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Add new Device Address as owner',
            signerType: 'devicemeta',
            target: address,
            fn: `addOwner(address ${deviceAddress}, address ${hexaddress}, address ${newOwner})`
          })
          .call(waitForEvents, settings, tx)
          .returns(true)
          .run()
      })

      it('should handle no logs', () => {
        return expectSaga(addOwnerIM, settings, newOwner)
          .provide([
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Add new Device Address as owner',
              signerType: 'devicemeta',
              target: address,
              fn: `addOwner(address ${deviceAddress}, address ${hexaddress}, address ${newOwner})`
            }), tx],
            [call(waitForEvents, settings, tx), []]
          ])
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Add new Device Address as owner',
            signerType: 'devicemeta',
            target: address,
            fn: `addOwner(address ${deviceAddress}, address ${hexaddress}, address ${newOwner})`
          })
          .call(waitForEvents, settings, tx)
          .returns(false)
          .run()
      })

    })

    describe('IdentityManager', () => {
      const settings = {
        signerType: 'IdentityManager',
        network,
        address,
        hexaddress,
        deviceAddress,
        controllerAddress
      }
      it('should create tx', () => {
        return expectSaga(addOwnerIM, settings, newOwner)
          .provide([
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Add new Device Address as owner',
              signerType: 'device',
              target: address,
              fn: `addOwner(address ${hexaddress}, address ${newOwner})`
            }), tx],
            [call(waitForEvents, settings, tx), [{_eventName: 'LogOwnerAdded', identity: hexaddress, owner: newOwner}]]
          ])
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Add new Device Address as owner',
            signerType: 'device',
            target: address,
            fn: `addOwner(address ${hexaddress}, address ${newOwner})`
          })
          .call(waitForEvents, settings, tx)
          .returns(true)
          .run()
      })

      it('should handle no logs', () => {
        return expectSaga(addOwnerIM, settings, newOwner)
          .provide([
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Add new Device Address as owner',
              signerType: 'device',
              target: address,
              fn: `addOwner(address ${hexaddress}, address ${newOwner})`
            }), tx],
            [call(waitForEvents, settings, tx), []]
          ])
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Add new Device Address as owner',
            signerType: 'device',
            target: address,
            fn: `addOwner(address ${hexaddress}, address ${newOwner})`
          })
          .call(waitForEvents, settings, tx)
          .returns(false)
          .run()
      })
    })
  })

  describe('addOwnerRC()', () => {
    const settings = {
      signerType: 'proxy',
      network,
      address,
      hexaddress,
      deviceAddress,
      controllerAddress
    }
    const identityManager = {
      shortTimeLock: { 'call': () => true }
    }
    const fn = `signUserKeyChange(address ${newOwner})`
    const fn2 = `changeUserKey()`
    const tx2 = 'tx2'
    describe('RecoverableController', () => {
      it('should create tx', () => {
        return expectSaga(addOwnerRC, settings, identityManager, newOwner)
          .provide([
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Propose new Device Address as owner',
              signerType: 'device',
              target: address,
              fn
            }), tx],
            [call(waitForEvents, settings, tx), [{_eventName: 'RecoveryEvent', action: 'signUserKeyChange', initiatedBy: deviceAddress}]],
            [call([identityManager.shortTimeLock, identityManager.shortTimeLock.call]), 60],
            [call(delay, 60000)],
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Accept new Device Address as owner',
              signerType: 'device',
              target: address,
              fn: fn2
            }), tx2],
            [call(waitForEvents, settings, tx2), [{_eventName: 'RecoveryEvent', action: 'changeUserKey', initiatedBy: deviceAddress}]]
          ])
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Propose new Device Address as owner',
            signerType: 'device',
            target: address,
            fn
          })
          .call(waitForEvents, settings, tx)
          .call(delay, 60000)
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Accept new Device Address as owner',
            signerType: 'device',
            target: address,
            fn: fn2
          })
          .call(waitForEvents, settings, tx2)
          .returns(true)
          .run()
      })

      it('fail if signUserKey transaction is missing logs', () => {
        return expectSaga(addOwnerRC, settings, identityManager, newOwner)
          .provide([
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Propose new Device Address as owner',
              signerType: 'device',
              target: address,
              fn
            }), tx],
            [call(waitForEvents, settings, tx), []]
          ])
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Propose new Device Address as owner',
            signerType: 'device',
            target: address,
            fn
          })
          .call(waitForEvents, settings, tx)
          .returns(false)
          .run()
      })

      it('fail if changeUserKey transaction is missing logs', () => {
        return expectSaga(addOwnerRC, settings, identityManager, newOwner)
          .provide([
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Propose new Device Address as owner',
              signerType: 'device',
              target: address,
              fn
            }), tx],
            [call(waitForEvents, settings, tx), [{_eventName: 'RecoveryEvent', action: 'signUserKeyChange', initiatedBy: deviceAddress}]],
            [call([identityManager.shortTimeLock, identityManager.shortTimeLock.call]), 60],
            [call(delay, 60000)],
            [call(signFunctionCall, {
              contract: controllerMNID,
              label: 'Accept new Device Address as owner',
              signerType: 'device',
              target: address,
              fn: fn2
            }), tx2],
            [call(waitForEvents, settings, tx2), []]
          ])
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Propose new Device Address as owner',
            signerType: 'device',
            target: address,
            fn
          })
          .call(waitForEvents, settings, tx)
          .call(delay, 60000)
          .call(signFunctionCall, {
            contract: controllerMNID,
            label: 'Accept new Device Address as owner',
            signerType: 'device',
            target: address,
            fn: fn2
          })
          .call(waitForEvents, settings, tx2)
          .returns(false)
          .run()
      })
    })
  })
})
