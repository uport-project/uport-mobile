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
import { createIdentityKeyPair, canSignFor, hasWorkingSeed, addressFor, encryptionPublicKey, DEFAULT_LEVEL } from 'uPortMobile/lib/sagas/keychain'
import { createToken } from 'uPortMobile/lib/sagas/jwt'

import { 
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import {
  saveMessage
} from 'uPortMobile/lib/actions/processStatusActions'
import { resetHub } from 'uPortMobile/lib/actions/hubActions'
import {
  subAccounts,
  currentAddress,
  migrateableIdentities,
  legacyRoot,
  ownClaimsMap
} from 'uPortMobile/lib/selectors/identities'
import { hasAttestations } from 'uPortMobile/lib/selectors/attestations'
import {
  updateIdentity, storeAttestation, storeIdentity
} from 'uPortMobile/lib/actions/uportActions'
import { handleURL } from 'uPortMobile/lib/actions/requestActions';
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet';
import { networkSettings } from 'uPortMobile/lib/selectors/chains';
import { resetHDWallet } from 'uPortMobile/lib/actions/HDWalletActions';

const step = MigrationStep.MigrateLegacy

function * migrate () : any {
  const oldRoot = yield select(currentAddress)
  const accounts = yield select(subAccounts, oldRoot)
  const own = (yield select(ownClaimsMap)) || {}    
  let newRoot
  if (yield call(hasWorkingSeed)) {    
    const account = yield call(addressFor, 0, 0)
    const encPublicKey = yield call(encryptionPublicKey, {idIndex: 0, actIndex: 0})
    newRoot = `did:ethr:${account.address}`
    yield put(storeIdentity({
      address: newRoot,
      deviceAddress: account.address,
      hexaddress: account.address,
      signerType: 'KeyPair',
      recoveryType: 'seed',
      hdindex: 0,
      network: 'mainnet',
      securityLevel: DEFAULT_LEVEL,
      publicKey: account.publicKey,
      encPublicKey,
      own
    }))
  } else {
    const hdroot = yield select(hdRootAddress)
    if (hdroot) {
      yield put(resetHDWallet())
    }
    const newId = yield call(createIdentityKeyPair)
    newRoot = newId.address
    yield put(updateIdentity(newRoot, {own}))
  }
  if (yield call(canSignFor, oldRoot)) {
    yield put(updateIdentity(oldRoot, {parent: newRoot}))
  } else {
    yield put(updateIdentity(oldRoot, {
      disabled: true,
      error: `Legacy Test Net Identity has been Disabled`
    }))  
  }

  for (let account of accounts) {
    const available = yield call(canSignFor, account.address)
    if (available) {
      yield put(updateIdentity(account.address, {
        parent: newRoot,
      }))  
    } else {
      yield put(updateIdentity(account.address, {
        disabled: true,
        error: `Legacy Identity has been Disabled. Keys are no longer available.`
      }))
    }
  }
  yield put(resetHub())
  yield put(saveMessage(step, 'New mainnet identity is created'))

  return true
}

export default migrate
