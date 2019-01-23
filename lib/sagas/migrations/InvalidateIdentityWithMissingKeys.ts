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
import { createIdentityKeyPair, canSignFor } from 'uPortMobile/lib/sagas/keychain'
import { createToken } from 'uPortMobile/lib/sagas/jwt'

import { 
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import {
  saveMessage
} from 'uPortMobile/lib/actions/processStatusActions'
import {
  subAccounts,
  currentAddress,
  migrateableIdentities,
  legacyRoot,
  ownClaimsMap
} from 'uPortMobile/lib/selectors/identities'
import { hasAttestations } from 'uPortMobile/lib/selectors/attestations'
import {
  updateIdentity, storeAttestation
} from 'uPortMobile/lib/actions/uportActions'
import { handleURL } from 'uPortMobile/lib/actions/requestActions';

const step = MigrationStep.InvalidateIdentityWithMissingKeys

function * migrate () : any {
  let root = yield select(currentAddress)
  if (yield call(canSignFor, root)) {
    yield put(saveMessage(step, 'We can sign, migration not needed'))
    return true
  }
  const accounts = yield select(subAccounts, root)
  const oldRoot = root    
  const own = (yield select(ownClaimsMap)) || {}    
  const identity = yield call(createIdentityKeyPair)
  root = identity.address
  yield put(updateIdentity(identity.address, {own}))
  yield put(updateIdentity(oldRoot, {
    parent: root,
    disabled: true,
    error: `Legacy Identity has been Disabled. Keys are no longer available.`
  }))

  for (let account of accounts) {
    const available = yield call(canSignFor, account.address)
    if (available) {
      yield put(updateIdentity(account.address, {
        parent: root,
      }))  
    } else {
      yield put(updateIdentity(account.address, {
        disabled: true,
        error: `Legacy Identity has been Disabled. Keys are no longer available.`
      }))
    }
  }
  yield put(saveMessage(step, 'Legacy Cleanup Performed'))

  return true
}

export default migrate
