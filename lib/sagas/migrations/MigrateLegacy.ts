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
import { call, select, put } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {
  createIdentityKeyPair,
  canSignFor,
  hasWorkingSeed,
  addressFor,
  encryptionPublicKey,
  DEFAULT_LEVEL,
} from 'uPortMobile/lib/sagas/keychain'
import { MigrationStep } from 'uPortMobile/lib/constants/MigrationActionTypes'
import { saveMessage } from 'uPortMobile/lib/actions/processStatusActions'
import { resetHub } from 'uPortMobile/lib/actions/hubActions'
import { subAccounts, currentAddress, ownClaimsMap } from 'uPortMobile/lib/selectors/identities'
import { updateIdentity, storeIdentity } from 'uPortMobile/lib/actions/uportActions'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import { resetHDWallet } from 'uPortMobile/lib/actions/HDWalletActions'
import { track } from 'uPortMobile/lib/actions/metricActions'

import { Alert } from 'react-native'

const step = MigrationStep.MigrateLegacy

function alertPromise(): any {
  return new Promise((resolve, reject) => {
    Alert.alert(
      'New Identity',
      // tslint:disable-next-line:max-line-length
      'Your current identity is a legacy testnet identity and is no longer supported. Create a new identity to continue. By creating a new identity all of your uPort data including credentials will be lost and cannot be recovered.',
      [
        {
          text: 'Create New Identity',
          onPress: () => resolve('confirmed'),
        },
        { text: 'Cancel', onPress: () => reject('cancelled') },
      ],
      { cancelable: true },
    )
  })
}

export function* alertBeforeMigration(): any {
  try {
    yield call(delay, 500)
    yield call(alertPromise)
    yield call(migrate)
  } catch (error) {
    yield put(track('Legacy migration cancelled'))
  }
}

export function* migrate(): any {
  const oldRoot = yield select(currentAddress)
  const accounts = yield select(subAccounts, oldRoot)
  const own = (yield select(ownClaimsMap)) || {}
  let newRoot
  if (yield call(hasWorkingSeed)) {
    const account = yield call(addressFor, 0, 0)
    const encPublicKey = yield call(encryptionPublicKey, { idIndex: 0, actIndex: 0 })
    newRoot = `did:ethr:${account.address}`
    yield put(
      storeIdentity({
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
        own,
      }),
    )
  } else {
    const hdroot = yield select(hdRootAddress)
    if (hdroot) {
      yield put(resetHDWallet())
    }
    const newId = yield call(createIdentityKeyPair)
    newRoot = newId.address
    yield put(updateIdentity(newRoot, { own }))
  }
  if (yield call(canSignFor, oldRoot)) {
    yield put(updateIdentity(oldRoot, { parent: newRoot }))
  } else {
    yield put(
      updateIdentity(oldRoot, {
        disabled: true,
        error: `Legacy Test Net Identity has been Disabled`,
      }),
    )
  }

  for (const account of accounts) {
    const available = yield call(canSignFor, account.address)
    if (available) {
      yield put(
        updateIdentity(account.address, {
          parent: newRoot,
        }),
      )
    } else {
      yield put(
        updateIdentity(account.address, {
          disabled: true,
          error: `Legacy Identity has been Disabled. Keys are no longer available.`,
        }),
      )
    }
  }
  yield put(resetHub())
  yield put(saveMessage(step, 'New mainnet identity is created'))

  return true
}

export default alertBeforeMigration
