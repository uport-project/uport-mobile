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

import migrate from '../MigrateLegacy'

import {
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  saveMessage,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'


import {
  subAccounts,
  currentAddress,
  migrateableIdentities,
  legacyRoot,
  ownClaimsMap
} from 'uPortMobile/lib/selectors/identities'

import {
  updateIdentity, storeAttestation
} from 'uPortMobile/lib/actions/uportActions'
import { createIdentityKeyPair } from '../../keychain';
import { createToken } from 'uPortMobile/lib/sagas/jwt'
import { handleURL } from 'uPortMobile/lib/actions/requestActions';
import { hasAttestations } from 'uPortMobile/lib/selectors/attestations';

const step = MigrationStep.MigrateLegacy

describe('MigrateLegacy', () => {
  const own = {name: 'Roberto Herrera', description: 'Swell and Sovereign Guy'}
  describe('migrate()', () => {
    describe('Nothing Migratable', () => {
      it('should not do anything', () => {
        return expectSaga(migrate)
          .provide([
            [select(migrateableIdentities), []]
          ])
          .put(saveMessage(step, 'Legacy Cleanup Not Needed'))
          .returns(true)
          .run()
      })
    })

    describe('Migrateable', () => {
      const legacyDID = '0xroot'
      const newDID = 'did:ethr:0x'
      const legacy = {address: legacyDID}
      const newId = {address: newDID}
      const JWT = 'JWT'
      describe('legacy root', () => {
        describe('without sub accounts', () => {
          it('should clean it up', () => {
            return expectSaga(migrate)
              .provide([
                [select(migrateableIdentities), [legacy]],
                [select(currentAddress), legacyDID],
                [select(legacyRoot), true],
                [call(createIdentityKeyPair), newId],
                [select(ownClaimsMap), own],
                [select(hasAttestations), false],
                [select(subAccounts, legacyDID), []]
              ])
              .call(createIdentityKeyPair)
              .put(updateIdentity(legacyDID, {parent: newDID}))
              .put(updateIdentity(newDID, {own}))              
              .put(saveMessage(step, 'Legacy Cleanup Performed'))
              .returns(true)
              .run()
          })
        })          

        describe('with attestations', () => {
          it('should add ownership token', () => {
            return expectSaga(migrate)
              .provide([
                [select(migrateableIdentities), [legacy]],
                [select(currentAddress), legacyDID],
                [select(legacyRoot), true],
                [call(createIdentityKeyPair), newId],
                [select(ownClaimsMap), own],
                [select(hasAttestations), true],
                [call(createToken, legacyDID, {sub: newDID, claim:{owns: legacyDID}}), JWT],
                [select(subAccounts, legacyDID), []]
              ])
              .call(createIdentityKeyPair)
              .put(updateIdentity(legacyDID, {parent: newDID}))
              .put(updateIdentity(newDID, {own}))              
              .call(createToken, legacyDID, {sub: newDID, claim:{owns: legacyDID}})
              .put(handleURL(`me.uport:req/JWT`, {popup: false}))
              .put(saveMessage(step, 'Legacy Cleanup Performed'))
              .returns(true)
              .run()
          })
        })          

        describe('with sub accounts', () => {
          it('should clean it up', () => {
            const hdaccount1 = {
              parent: legacyDID,
              address: 'account1',
              hdindex: 1
            }
            const hdaccount2 = {
              parent: legacyDID,
              address: 'account2',
              hdindex: 2
            }
            const nonhdaccount = {
              parent: legacyDID,
              address: 'account3'
            }
            const accounts = [
              hdaccount1,
              hdaccount2,
              nonhdaccount
            ]
            return expectSaga(migrate)
              .provide([
                  [select(migrateableIdentities), [legacy]],
                  [select(currentAddress), legacyDID],
                  [call(createIdentityKeyPair), newId],
                  [select(ownClaimsMap), own],
                  [select(hasAttestations), false],
                  [select(legacyRoot), true],
                  [select(subAccounts, legacyDID), accounts]
              ])
              .call(createIdentityKeyPair)
              .put(updateIdentity(legacyDID, {parent: newDID}))
              .put(updateIdentity(newDID, {own}))
              .put(updateIdentity('account1', {parent: newDID}))
              .put(updateIdentity('account2', {parent: newDID}))
              .put(updateIdentity('account3', {parent: newDID}))
              .put(saveMessage(step, 'Legacy Cleanup Performed'))
              .returns(true)
              .run()
          })
        })       
      })
      
      describe('non legacy root', () => {
        describe('without sub accounts', () => {
          it('should not do anything', () => {
            return expectSaga(migrate)
              .provide([
                [select(migrateableIdentities), [legacy]],
                [select(currentAddress), legacyDID],
                [select(legacyRoot), false],
                [select(subAccounts, legacyDID), []]
              ])
              .not.call(createIdentityKeyPair)
              .not.put(updateIdentity(legacyDID, {parent: newDID}))
              .put(saveMessage(step, 'Legacy Cleanup Performed'))
              .returns(true)
              .run()
          })
        })   

        describe('with sub accounts', () => {
          it('should clean it up', () => {
            const hdaccount1 = {
              parent: legacyDID,
              address: 'account1',
              hdindex: 1
            }
            const hdaccount2 = {
              parent: legacyDID,
              address: 'account2',
              hdindex: 2
            }
            const nonhdaccount = {
              parent: legacyDID,
              address: 'account3'
            }
            const accounts = [
              hdaccount1,
              hdaccount2,
              nonhdaccount
            ]
            return expectSaga(migrate)
              .provide([
                  [select(migrateableIdentities), [legacy]],
                  [select(currentAddress), legacyDID],
                  [call(createIdentityKeyPair), newId],
                  [select(legacyRoot), false],
                  [select(subAccounts, legacyDID), accounts]
              ])
              .not.call(createIdentityKeyPair)
              .not.put(updateIdentity(legacyDID, {parent: newDID}))
              .put(updateIdentity('account1', {parent: legacyDID}))
              .put(updateIdentity('account2', {parent: legacyDID}))
              .put(updateIdentity('account3', {parent: legacyDID}))
              .put(saveMessage(step, 'Legacy Cleanup Performed'))
              .returns(true)
              .run()
          })
        })
      })
    })
  })
})

