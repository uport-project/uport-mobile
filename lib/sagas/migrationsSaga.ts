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
import { addMigrationTarget, completedMigrationStep, failedMigrationStep, startedMigrationStep } from 'uPortMobile/lib/actions/migrationActions'
import { completeProcess, failProcess, startWorking, stopWorking } from 'uPortMobile/lib/actions/processStatusActions'
import { LOADED_DB } from 'uPortMobile/lib/constants/GlobalActionTypes'
import { MigrationStatus, MigrationStep, MigrationTarget, RUN_MIGRATIONS, TargetAction, targetRecipes } from 'uPortMobile/lib/constants/MigrationActionTypes'
import { canSignFor, hasWorkingSeed } from 'uPortMobile/lib/sagas/keychain'
import { isFullyHD, isHD } from 'uPortMobile/lib/selectors/chains'
import { currentAddress, migrateableIdentities, hasMainnetAccounts, currentIdentityJS } from 'uPortMobile/lib/selectors/identities'
import { migrationStepStatus, migrationTargets, pendingMigrations } from 'uPortMobile/lib/selectors/migrations'
import { NavigationActions } from 'uPortMobile/lib/utilities/NavigationActions'
import { hasAttestations } from '../selectors/attestations'
import CleanUpAfterMissingSeed from './migrations/CleanUpAfterMissingSeed'
import IdentityManagerChangeOwner from './migrations/IdentityManagerChangeOwner'
import MigrateLegacy from './migrations/MigrateLegacy'
import UpdatePreHDRootToHD from './migrations/UpdatePreHDRootToHD'
import UportRegistryDDORefresh from './migrations/UportRegistryDDORefresh'
import { hdRootAddress } from '../selectors/hdWallet';
import { Alert } from 'react-native';

export function * checkIfAbleToSign () : any {
  const address = yield select(currentAddress)
  if (!address) return false
  return yield call(canSignFor, address)
}

export function * checkForLegacy () : any {
  const migrateable = yield select(migrateableIdentities)
  return (migrateable.length > 0)
}

export function * alert(title: string, message: string) {
  yield call(delay, 500)
  yield call([Alert, Alert.alert], title, message)
}
export function * checkup () : any {
  // console.log('id', (yield select(currentIdentityJS)))
  if (yield call(checkIfAbleToSign)) {
    if (yield call(checkForLegacy)) {
      // We define highValue as having mainnet accounts and attestations
      const highValue = (yield select(hasAttestations)) || (yield select(hasMainnetAccounts))
      if (highValue) {
        const fullHD = yield select(isFullyHD)
        if (!fullHD) yield put(addMigrationTarget(MigrationTarget.PreHD))
      } else {
        yield put(addMigrationTarget(MigrationTarget.Legacy))
      }
    }  
  } else {
    const address = yield select(currentAddress)
    const hd = yield select(isHD, address)
    if (hd) {
      yield put(addMigrationTarget(MigrationTarget.RecoverSeed))
    } else {
      yield put(addMigrationTarget(MigrationTarget.Legacy))
    }
  }
  const pending = yield select(pendingMigrations)
  // console.log('pending migrations', pending)
  if (pending.length > 0 ) {
    const target = pending[0]
    switch (target) {
      case MigrationTarget.PreHD:
        yield call(delay, 1000)
        yield call(NavigationActions.push, {
          screen: `migrations.${target}`,
          animationType: 'slide-up'
        })  
        break
      case MigrationTarget.Legacy:
        if (yield call(runMigrations, { type: RUN_MIGRATIONS, target})) {
          yield call(alert,
            'Your Identity has been upgraded', 
            'You had an old test net identity. Thank you for being an early uPort user. We have now upgraded your identity to live on the Ethereum Mainnet.'
            )
        }
        break
      case MigrationTarget.RecoverSeed:
        yield call(delay, 500)
        yield call(NavigationActions.push, {
          screen: 'recovery.seedInstructions',
          animationType: 'slide-up',
          passProps: {
            migrate: true
          }
        })
        break
    }
  }
}

export function * runMigrations ({target} : TargetAction) : any {
  yield put(startWorking(target))
  const steps = targetRecipes[target]||[]
  let status
  for (let step of steps) {
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

export function * runImplementationStep (step: MigrationStep) : any {
  switch (step) {
    case MigrationStep.IdentityManagerChangeOwner:
      return yield call(IdentityManagerChangeOwner)
    case MigrationStep.UpdatePreHDRootToHD:
      return yield call(UpdatePreHDRootToHD)
    case MigrationStep.UportRegistryDDORefresh:
      return yield call(UportRegistryDDORefresh)
    case MigrationStep.CleanUpAfterMissingSeed:
      return yield call(CleanUpAfterMissingSeed)
    case MigrationStep.MigrateLegacy:
      return yield call(MigrateLegacy)
  }
}

export function * performStep (step: MigrationStep) : any {
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

function * migrationsSaga () {
  yield all([
    takeEvery(LOADED_DB, checkup),
    takeEvery(RUN_MIGRATIONS, runMigrations)
  ])
}

export default migrationsSaga
