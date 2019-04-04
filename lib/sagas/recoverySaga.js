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
import { delay } from 'redux-saga'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import { SHOW_RECOVERY_SEED, START_SEED_RECOVERY } from 'uPortMobile/lib/constants/RecoveryActionTypes'
import { NativeModules, Alert } from 'react-native'
import { saveRecoverySeed } from 'uPortMobile/lib/actions/recoveryActions'
import { storeIdentity } from 'uPortMobile/lib/actions/uportActions'
import { startWorking, completeProcess, failProcess } from 'uPortMobile/lib/actions/processStatusActions'
import { seedConfirmed } from 'uPortMobile/lib/actions/HDWalletActions'
import { performCatchup } from 'uPortMobile/lib/sagas/hubSaga'
import authorize from 'uPortMobile/lib/helpers/authorize'
import { importSeed, createRecoveryAddress, DEFAULT_LEVEL } from './keychain'
import { lookupAccount } from './unnu'
import { lookupUportHash } from './persona'
import { delay } from 'redux-saga'
import { RNUportHDSigner } from 'react-native-uport-signer'
import { securityLevel } from '../selectors/chains'
import { Navigation } from 'react-native-navigation'
import SCREENS from '../screens/Screens'

function* showSeed() {
  try {
    const authorized = yield call(authorize, 'Show your current recovery seed?')
    if (authorized) {
      const root = yield select(hdRootAddress)
      if (root) {
        const seed = yield call(RNUportHDSigner.showSeed, root, 'Show your current recovery seed?')
        if (seed) {
          yield put(saveRecoverySeed(seed))
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}
export function* alert(title, message) {
  yield call(delay, 500)
  yield call([Alert, Alert.alert], title, message)
}

export function* performSeedRecovery({ phrase }) {
  try {
    yield put(startWorking('recovery'))
    const level = yield select(securityLevel)
    const kp = yield call(RNUportHDSigner.importSeed, phrase, level)
    //
    if (!kp) {
      yield put(failProcess('recovery', 'Invalid seed'))
      return false
    }
    const existingRoot = yield select(hdRootAddress)
    if (existingRoot) {
      if (kp.address !== existingRoot) {
        yield put(failProcess('recovery', 'Seed does not match the Identity stored on your Phone'))
        return false
      }
    } else {
      const id = yield call(importSeed, phrase)
      const deviceAddress = id.deviceAddress
      const legacy = yield call(lookupAccount, { deviceAddress })
      if (legacy) {
        const ipfsProfile = yield call(lookupUportHash, legacy.address)
        const recoveryAddress = yield call(createRecoveryAddress, 0)
        yield put(
          storeIdentity({
            ...id,
            ...legacy,
            ipfsProfile,
            recoveryAddress,
            network: 'rinkeby',
            securityLevel: DEFAULT_LEVEL,
          }),
        )
      } else {
        yield put(storeIdentity({ ...id, securityLevel: DEFAULT_LEVEL }))
      }
      yield spawn(performCatchup)
    }
    yield put(seedConfirmed())
    yield put(completeProcess('recovery'))
    yield call([Navigation, Navigation.push], {
      component: {
        name: SCREENS.RECOVERY.RestoreSeedSuccess,
        options: {
          topBar: {
            visible: false,
          },
        },
      },
    })
    return true
  } catch (error) {
    // console.log('recovery', error)
    yield put(failProcess('recovery', 'Error recovering identity'))
    return false
  }
}

function* recoverySaga() {
  yield all([takeEvery(SHOW_RECOVERY_SEED, showSeed), takeEvery(START_SEED_RECOVERY, performSeedRecovery)])
}

export default recoverySaga
