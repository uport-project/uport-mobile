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
import { delay } from 'redux-saga'
import {
  RUN_MIGRATIONS,
  MigrationStep,
  MigrationTarget,
  MigrationStatus,
  TargetAction,
  StepAction,
  Recipes,
  targetRecipes,
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import { LOADED_DB } from 'uPortMobile/lib/constants/GlobalActionTypes'
import {
  addMigrationTarget,
  startedMigrationStep,
  completedMigrationStep,
  failedMigrationStep,
} from 'uPortMobile/lib/actions/migrationActions'
import {
  startWorking,
  stopWorking,
  saveMessage,
  completeProcess,
  failProcess,
} from 'uPortMobile/lib/actions/processStatusActions'

import {
  migrationStepStatus,
  migrationTargets,
  pendingMigrations,
  migrationCompleted,
} from 'uPortMobile/lib/selectors/migrations'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import { isFullyHD, networkSettings } from 'uPortMobile/lib/selectors/chains'
import { hdRootAddress, seedAddresses } from 'uPortMobile/lib/selectors/hdWallet'

import IdentityManagerChangeOwner from './migrations/IdentityManagerChangeOwner'
import UpdatePreHDRootToHD from './migrations/UpdatePreHDRootToHD'
import UportRegistryDDORefresh from './migrations/UportRegistryDDORefresh'
import CleanUpAfterMissingSeed from './migrations/CleanUpAfterMissingSeed'

import { NavigationActions } from 'uPortMobile/lib/utilities/NavigationActions'
import { resetKey, listSeedAddresses } from 'uPortMobile/lib/sagas/keychain'

export function* checkup(): any {
  const fullHD = yield select(isFullyHD)
  const hd = yield select(hdRootAddress)
  const addresses = yield call(listSeedAddresses)
  if (!fullHD || !addresses.includes(hd)) {
    yield put(addMigrationTarget(MigrationTarget.PreHD))
  }
  const pending = yield select(pendingMigrations)
  if (pending.length > 0) {
    const target = pending[0]
    yield call(delay, 2000)
    yield call(NavigationActions.push, {
      screen: `migrations.${target}`,
      animationType: 'slide-up',
    })
  }
}

const implementations = {
  IdentityManagerChangeOwner,
  UpdatePreHDRootToHD,
  UportRegistryDDORefresh,
  CleanUpAfterMissingSeed,
}

export function* runMigrations({ target }: TargetAction): any {
  const targets = yield select(migrationTargets)
  if (targets.includes(target)) {
    yield put(startWorking(target))
    const steps = targetRecipes[target] || []
    for (let step of steps) {
      yield call(performStep, step)
      const status = yield select(migrationStepStatus, step)
      if (status !== MigrationStatus.Completed) break
    }
    yield put(completeProcess(target))
  }
}

export function* runImplementationStep(step: MigrationStep): any {
  const migration = implementations[step]
  if (migration) {
    return yield call(migration)
  }
}

export function* performStep(step: MigrationStep): any {
  const status = yield select(migrationStepStatus, step)
  if (status === MigrationStatus.Completed) return
  yield put(startedMigrationStep(step))
  yield put(startWorking(step))
  try {
    const success = yield call(runImplementationStep, step)
    // console.log(step, `success: ${success}`)
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
