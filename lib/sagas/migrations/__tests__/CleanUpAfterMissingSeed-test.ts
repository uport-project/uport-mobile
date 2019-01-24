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

import migrate from '../CleanUpAfterMissingSeed'

import {
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  saveMessage,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'


import {
  listSeedAddresses
} from 'uPortMobile/lib/sagas/keychain'
import {
  hdRootAddress
} from 'uPortMobile/lib/selectors/hdWallet'
import {
  subAccounts,
  currentAddress
} from 'uPortMobile/lib/selectors/identities'
import {
  resetHDWallet  
} from 'uPortMobile/lib/actions/HDWalletActions'
import {
  updateIdentity
} from 'uPortMobile/lib/actions/uportActions'

const MockDate = require('mockdate')
const NOW = 1485321133000
MockDate.set(NOW)

const step = MigrationStep.CleanUpAfterMissingSeed

describe('CleanUpAfterMissingSeed', () => {
  const rootAddress = '0xroot'
  const hdRoot = '0xhdRoot'

  describe('migrate()', () => {
    describe('Working hdwallet', () => {
      it('should not do anything', () => {
        return expectSaga(migrate)
          .provide([
            [select(hdRootAddress), hdRoot],
            [call(listSeedAddresses), [rootAddress, hdRoot]]
          ])
          .put(saveMessage(step, 'HD Cleanup Not Needed'))
          .returns(true)
          .run()
      })
    })

    describe('missing hdwallet', () => {
      describe('without sub accounts', () => {
        it('should clean it up', () => {
          return expectSaga(migrate)
            .provide([
              [select(hdRootAddress), hdRoot],
              [call(listSeedAddresses), [rootAddress]],
              [select(currentAddress), rootAddress],
              [select(subAccounts), []]
            ])
            .put(resetHDWallet())
            .put(saveMessage(step, 'HD Cleanup Performed'))
            .returns(true)
            .run()
        })
      })
      describe('with sub accounts', () => {
        it('should clean it up', () => {
          const hdaccount1 = {
            parent: rootAddress,
            address: 'account1',
            hdindex: 1
          }
          const hdaccount2 = {
            parent: rootAddress,
            address: 'account2',
            hdindex: 2
          }
          const nonhdaccount = {
            parent: rootAddress,
            address: 'account3'
          }
          const accounts = [
            hdaccount1,
            hdaccount2,
            nonhdaccount
          ]
          return expectSaga(migrate)
            .provide([
              [select(hdRootAddress), hdRoot],
              [call(listSeedAddresses), [rootAddress]],
              [select(currentAddress), rootAddress],
              [select(subAccounts), accounts]
            ])
            .put(updateIdentity('account1', {parent: hdRoot, disabled: true, error: `Migrated due to missing HD seed ${hdRoot} on ${new Date().toDateString()}`}))
            .put(saveMessage(step, `Disabled account ${hdaccount1.address} due to missing seed`))
            .put(updateIdentity('account2', {parent: hdRoot, disabled: true, error: `Migrated due to missing HD seed ${hdRoot} on ${new Date().toDateString()}`}))
            .put(saveMessage(step, `Disabled account ${hdaccount2.address} due to missing seed`))
            .not.put(updateIdentity('account3', {parent: hdRoot, disabled: true, error: `Migrated due to missing HD seed ${hdRoot} on ${new Date().toDateString()}`}))
            .not.put(saveMessage(step, `Disabled account ${nonhdaccount.address} due to missing seed`))
            .put(resetHDWallet())
            .put(saveMessage(step, 'HD Cleanup Performed'))
            .returns(true)
            .run()
        })
      })
     
    })

  })
})

