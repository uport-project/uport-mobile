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
import { delay } from 'redux-saga'
import { all, call, put, select, takeEvery } from 'redux-saga/effects'
import {
  addMigrationTarget,
  completedMigrationStep,
  failedMigrationStep,
  startedMigrationStep,
} from 'uPortMobile/lib/actions/migrationActions'
import { completeProcess, failProcess, startWorking, stopWorking } from 'uPortMobile/lib/actions/processStatusActions'
import { LOADED_DB } from 'uPortMobile/lib/constants/GlobalActionTypes'
import {
  MigrationStatus,
  MigrationStep,
  MigrationTarget,
  RUN_MIGRATIONS,
  TargetAction,
  targetRecipes,
  migrationScreens,
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import { canSignFor } from 'uPortMobile/lib/sagas/keychain'
import { isHD } from 'uPortMobile/lib/selectors/chains'
import { currentAddress, validPrimaryIdentities } from 'uPortMobile/lib/selectors/identities'
import { migrationStepStatus, pendingMigrations } from 'uPortMobile/lib/selectors/migrations'
import { Navigation } from 'react-native-navigation'

import MigrateLegacy from './migrations/MigrateLegacy'
import { Alert } from 'react-native'
import { switchIdentity } from '../actions/uportActions'

export function* checkIfAbleToSign(): any {
  const address = yield select(currentAddress)
  if (!address) return false
  return yield call(canSignFor, address)
}

export function* alert(title: string, message: string) {
  yield call(delay, 500)
  yield call([Alert, Alert.alert], title, message)
}

export function* primaryAddress() {
  const address = yield select(currentAddress)
  if (!address) return
  if (address.match(/did:ethr:0x[0-9a-fA-F]{40}/)) {
    return address
  } else {
    const others = yield select(validPrimaryIdentities)
    if (others.length > 0) {
      yield put(switchIdentity(others[0]))
      return others[0]
    }
    return address
  }
}

export function* checkup(): any {
  const address = yield call(primaryAddress)
  if (!address) return
  if (!address.match(/did:ethr:0x[0-9a-fA-F]{40}/)) {
    yield put(addMigrationTarget(MigrationTarget.Legacy))
  } else {
    if (!(yield call(checkIfAbleToSign))) {
      const hd = yield select(isHD, address)
      if (hd) {
        yield put(addMigrationTarget(MigrationTarget.RecoverSeed))
      } else {
        yield put(addMigrationTarget(MigrationTarget.Legacy))
      }
    }
  }
  const pending = yield select(pendingMigrations)
  if (pending.length > 0) {
    const target = pending[0]
    yield call(delay, 1000)
    if (migrationScreens[target]) {
      yield call(Navigation.showModal, {
        component: {
          name: migrationScreens[target],
        },
      })
    } else {
      if (yield call(runMigrations, { type: RUN_MIGRATIONS, target })) {
        // TODO this alert is only for the Legacy migration. If you add more like this in the future add logic to change this text
        yield call(
          alert,
          'Your Identity has been upgraded',
          'You had an old test net identity. Thank you for being an early uPort user. We have now upgraded your identity to live on the Ethereum Mainnet.',
        )
      }
    }
  }
}

export function* runMigrations({ target }: TargetAction): any {
  yield put(startWorking(target))
  const steps = targetRecipes[target] || []
  let status
  for (const step of steps) {
    yield call(performStep, step)
    status = yield select(migrationStepStatus, step)
    if (status !== MigrationStatus.Completed) break
  }
  if (status === MigrationStatus.Completed) {
    yield put(completeProcess(target))
    return true
  } else {
    yield put(failProcess(target))
    return false
  }
}

export function* runImplementationStep(step: MigrationStep): any {
  switch (step) {
    case MigrationStep.MigrateLegacy:
      return yield call(MigrateLegacy)
  }
}

export function* performStep(step: MigrationStep): any {
  const status = yield select(migrationStepStatus, step)
  if (status === MigrationStatus.Completed) return
  yield put(startedMigrationStep(step))
  yield put(startWorking(step))
  try {
    const success = yield call(runImplementationStep, step)
    if (success) {
      yield put(stopWorking(step))
      yield put(completedMigrationStep(step))
    } else {
      yield put(failedMigrationStep(step))
    }
  } catch (error) {
    // console.log(step, error)
    yield put(failedMigrationStep(step))
    yield put(failProcess(step, error.message))
  }
}

function* migrationsSaga() {
  yield all([takeEvery(LOADED_DB, checkup), takeEvery(RUN_MIGRATIONS, runMigrations)])
}

export default migrationsSaga
