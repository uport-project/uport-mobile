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
import { all, takeEvery, call, select, put } from 'redux-saga/effects'
import { 
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import {
  saveMessage
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

const step = MigrationStep.CleanUpAfterMissingSeed

function * migrate () : any {
  const root = yield select(hdRootAddress)
  const seeds = yield call(listSeedAddresses)
  if (seeds.includes(root)) {
    yield put(saveMessage(step, 'HD Cleanup Not Needed'))
    return true
  }
  const identity = yield select(currentAddress)
  const accounts = yield select(subAccounts)

  // console.log('affected accounts', accounts)
  for (let account of accounts) {
    if (account.hdindex) {
      yield put(updateIdentity(account.address, {
        parent: root,
        disabled: true,
        error: `Migrated due to missing HD seed ${root} on ${new Date().toDateString()}`
      }))
      yield put(saveMessage(step, `Disabled account ${account.address} due to missing seed`))
    }
  }
  yield put(resetHDWallet())
  yield put(saveMessage(step, 'HD Cleanup Performed'))

  return true
}

export default migrate
