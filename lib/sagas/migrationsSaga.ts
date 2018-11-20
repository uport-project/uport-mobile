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
  RUN_MIGRATIONS,
  RUN_MIGRATION_STEP, 
  MigrationStep, 
  MigrationTarget,
  MigrationStatus,
  TargetAction, 
  StepAction
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import {
  LOADED_DB
} from 'uPortMobile/lib/constants/GlobalActionTypes'
import { 
  addMigrationTarget,
  runMigrationStep,
  startedMigrationStep,
  completedMigrationStep,
  failedMigrationStep
} from 'uPortMobile/lib/actions/migrationActions'
import {
  startWorking,
  saveMessage,
  completeProcess,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import { migrationStatus, migrationTargets } from 'uPortMobile/lib/selectors/migrations'
import { isFullyHD } from 'uPortMobile/lib/selectors/chains'

import IdentityManagerChangeOwner from './migrations/IdentityManagerChangeOwner'
import UpdatePreHDRootToHD from './migrations/UpdatePreHDRootToHD'
import UportRegistryDDORefresh from './migrations/UportRegistryDDORefresh'

export function * checkup () : any {
  const hd = yield select(isFullyHD)
  if (!hd) {
    yield put(addMigrationTarget(MigrationTarget.PreHD))
  }
}

interface Recipes {
  [index: string]: MigrationStep[]
}

const targetRecipes : Recipes = {
  PreHD: [MigrationStep.IdentityManagerChangeOwner, MigrationStep.UpdatePreHDRootToHD, MigrationStep.UportRegistryDDORefresh]
}

const implementations = {
  IdentityManagerChangeOwner,
  UpdatePreHDRootToHD,
  UportRegistryDDORefresh
}

export function * runMigrations ({target} : TargetAction) : any {
  const targets = yield select(migrationTargets)
  if (targets.includes(target)) {
    const steps = targetRecipes[target]||[]
    for (let step of steps) {
      yield call(performStep, step)
      const status = yield select(migrationStatus, step)
      if (status !== MigrationStatus.Completed) break
    }  
  }
}

export function * runImplementationStep (step: MigrationStep) : any {
  const migration = implementations[step]
  if (migration) {
    return yield call(migration)
  }
}

export function * performStep (step: MigrationStep) : any {
  const status = yield select(migrationStatus, step)
  if (status === MigrationStatus.Completed) return
  yield put(startedMigrationStep(step))
  yield put(startWorking(step))
  try {
    if (yield call(runImplementationStep, step)) {
      yield put(completeProcess(step))
      yield put(completedMigrationStep(step))  
    } else {
      yield put(failedMigrationStep(step))  
    }
  } catch (error) {
    yield put(failedMigrationStep(step))
    yield put(failProcess(step, error.message))
  }
}

export function * runStep ({step} : StepAction) : any {
  yield call(performStep, step)
}

function * migrationsSaga () {
  yield all([
    takeEvery(LOADED_DB, checkup),
    takeEvery(RUN_MIGRATIONS, runMigrations),
    takeEvery(RUN_MIGRATION_STEP, runStep),
  ])
}

export default migrationsSaga
