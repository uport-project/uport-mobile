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

import migrate from '../InvalidateIdentityWithMissingKeys'

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
import { createIdentityKeyPair, canSignFor } from '../../keychain';
import { createToken } from 'uPortMobile/lib/sagas/jwt'
import { handleURL } from 'uPortMobile/lib/actions/requestActions';
import { hasAttestations } from 'uPortMobile/lib/selectors/attestations';

const step = MigrationStep.InvalidateIdentityWithMissingKeys

describe('InvalidateIdentityWithMissingKeys', () => {
  const legacyDID = '0xroot'
  const own = {name: 'Roberto Herrera', description: 'Swell and Sovereign Guy'}
  describe('migrate()', () => {
    describe('Nothing Migratable', () => {
      it('should not do anything', () => {
        return expectSaga(migrate)
          .provide([
            [select(currentAddress), legacyDID],
            [call(canSignFor, legacyDID), true]
          ])
          .put(saveMessage(step, 'We can sign, migration not needed'))
          .returns(true)
          .run()
      })
    })

    describe('Migrateable', () => {
      const newDID = 'did:ethr:0x'
      const newId = {address: newDID}
      describe('without sub accounts', () => {

        // TODO If seed is working but root isn't create new IdentityKeyPair based on seed


        it('should clean up', () => {
          return expectSaga(migrate)
            .provide([
              [select(currentAddress), legacyDID],
              [call(canSignFor, legacyDID), false],
              [call(createIdentityKeyPair), newId],
              [select(ownClaimsMap), own],
              [select(subAccounts, legacyDID), []]
            ])
            .call(createIdentityKeyPair)
            .put(updateIdentity(newDID, {own}))              
            .put(updateIdentity(legacyDID, {
              parent: newDID,
              disabled: true,
              error: `Legacy Identity has been Disabled. Keys are no longer available.`
            }))
            .put(saveMessage(step, 'Legacy Cleanup Performed'))
            .returns(true)
            .run()
        })
      })

      describe('with sub accounts', () => {
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
        describe('able to sign for accounts', () => {
          it('should clean it up', () => {
            return expectSaga(migrate)
              .provide([
                [select(currentAddress), legacyDID],
                [call(canSignFor, legacyDID), false],
                [call(createIdentityKeyPair), newId],
                [select(ownClaimsMap), own],
                [select(subAccounts, legacyDID), accounts],
                [call(canSignFor, 'account1'), true],
                [call(canSignFor, 'account2'), true],
                [call(canSignFor, 'account3'), true],
              ])
              .call(createIdentityKeyPair)
              .put(updateIdentity(newDID, {own}))
              .put(updateIdentity(legacyDID, {
                parent: newDID,
                disabled: true,
                error: `Legacy Identity has been Disabled. Keys are no longer available.`
              }))
              .put(updateIdentity('account1', {parent: newDID}))
              .put(updateIdentity('account2', {parent: newDID}))
              .put(updateIdentity('account3', {parent: newDID}))
              .put(saveMessage(step, 'Legacy Cleanup Performed'))
              .returns(true)
              .run()
          })  
        })

        describe('unable to sign for accounts', () => {
          it('should clean it up', () => {
            return expectSaga(migrate)
              .provide([
                [select(currentAddress), legacyDID],
                [call(canSignFor, legacyDID), false],
                [call(createIdentityKeyPair), newId],
                [select(ownClaimsMap), own],
                [select(subAccounts, legacyDID), accounts],
                [call(canSignFor, 'account1'), false],
                [call(canSignFor, 'account2'), false],
                [call(canSignFor, 'account3'), true],
              ])
              .call(createIdentityKeyPair)
              .put(updateIdentity(newDID, {own}))
              .put(updateIdentity(legacyDID, {
                parent: newDID,
                disabled: true,
                error: `Legacy Identity has been Disabled. Keys are no longer available.`
              }))
              .put(updateIdentity('account1', {
                disabled: true,
                error: `Legacy Identity has been Disabled. Keys are no longer available.`
              }))
              .put(updateIdentity('account2', {
                disabled: true,
                error: `Legacy Identity has been Disabled. Keys are no longer available.`
              }))
              .put(updateIdentity('account3', {parent: newDID}))
              .put(saveMessage(step, 'Legacy Cleanup Performed'))
              .returns(true)
              .run()
          })  
        })

      })
    })
  })
})

