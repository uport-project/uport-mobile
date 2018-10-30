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
import { takeEvery, call, select, put, all, take, spawn } from 'redux-saga/effects'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import {
  SHOW_RECOVERY_SEED, START_SEED_RECOVERY
} from 'uPortMobile/lib/constants/RecoveryActionTypes'
import { NativeModules } from 'react-native'

import { saveRecoverySeed } from 'uPortMobile/lib/actions/recoveryActions'
import { storeIdentity, removeIdentity } from 'uPortMobile/lib/actions/uportActions'
import {
  saveMessage, startWorking, completeProcess, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import {
  seedConfirmed, resetHDWallet
} from 'uPortMobile/lib/actions/HDWalletActions'
import {
  fetchCurrentCountry
} from 'uPortMobile/lib/actions/onboardingActions'

import { performCatchup } from 'uPortMobile/lib/sagas/hubSaga'

import authorize from 'uPortMobile/lib/helpers/authorize'
import { importSeed, createRecoveryAddress, encryptionPublicKey, DEFAULT_LEVEL } from './keychain'
import { fetchAllSettings } from './blockchain'
import { lookupAccount } from './unnu'
import { lookupUportHash } from './persona'
import { defaultNetwork } from 'uPortMobile/lib/utilities/networks'
// import { toJs } from 'mori'

function * showSeed () {
  try {
    const authorized = yield call(authorize, 'Show your current recovery seed?')
    if (authorized) {
      const root = yield select(hdRootAddress)
      if (root) {
        const seed = yield call(NativeModules.NativeHDSignerModule.showSeed, root, 'Show your current recovery seed?')
        if (seed) {
          yield put(saveRecoverySeed(seed))
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export function * performSeedRecovery ({phrase}) {
  try {
    yield put(startWorking('recovery'))
    const kp = yield call(importSeed, phrase)
    if (!kp) {
      yield put(failProcess('recovery', 'Invalid seed'))
      yield put(resetHDWallet())
      yield put(removeIdentity('new'))
      return false
    }
    const deviceAddress = kp.deviceAddress
    let address = kp.address
    const legacy = yield call(lookupAccount, {deviceAddress})
    if (legacy) {
      const ipfsProfile = yield call(lookupUportHash, legacy.address)
      const recoveryAddress = yield call(createRecoveryAddress, 0)
      address = legacy.address
      yield put(storeIdentity({
        ...kp,
        ...legacy,
        ipfsProfile,
        recoveryAddress,
        network: 'rinkeby',
        securityLevel: DEFAULT_LEVEL})
      )
    } else {
      yield put(storeIdentity({...kp, securityLevel: DEFAULT_LEVEL}))
    }
    yield put(seedConfirmed())
    yield put(fetchCurrentCountry())
    yield spawn(fetchAllSettings, { address })
    yield put(completeProcess('recovery'))
    yield spawn(performCatchup)
    return true
  } catch (error) {
    yield put(failProcess('recovery', 'Error recovering identity'))
    yield put(resetHDWallet())
    yield put(removeIdentity('new'))
    return false
  }
}

function * recoverySaga () {
  yield all([
    takeEvery(SHOW_RECOVERY_SEED, showSeed),
    takeEvery(START_SEED_RECOVERY, performSeedRecovery)
  ])
}

export default recoverySaga
