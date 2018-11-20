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
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { select, call } from 'redux-saga/effects'

import migrationsSaga, { performStep, runImplementationStep } from '../migrationsSaga'
import IdentityManagerChangeOwner from '../migrations/IdentityManagerChangeOwner'

import { 
  RUN_MIGRATIONS,
  RUN_MIGRATION_STEP, 
  MigrationStep, 
  MigrationTarget, 
  MigrationStatus,
  TargetAction, 
  StepAction
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import { loadedDB } from 'uPortMobile/lib/actions/globalActions'
import { 
  runMigrations,
  addMigrationTarget,
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

describe('checkup', () => {
  describe('hd wallet', () => {
    it('does not Add Migration Target', () => {
      return expectSaga(migrationsSaga)
          .provide([
            [select(isFullyHD), true]
          ])
          .not.put(addMigrationTarget(MigrationTarget.PreHD))
          .dispatch(loadedDB())
          .silentRun()
    })  
  })

  describe('pre hd', () => {
    it('adds a Migration Target', () => {
      return expectSaga(migrationsSaga)
          .provide([
            [select(isFullyHD), false]
          ])
          .put(addMigrationTarget(MigrationTarget.PreHD))
          .dispatch(loadedDB())
          .silentRun()
    })  
  })
})

describe('runMigrations', () => {
  describe('no targets', () => {
    it('should not run any steps', () => {
      return expectSaga(migrationsSaga)
        .provide([
          [select(migrationTargets), []]
        ])
        .not.call(performStep)
        .dispatch(runMigrations(MigrationTarget.PreHD))
        .silentRun()
    })
  })

  describe('with targets', () => {
    it('should run all steps', () => {
      return expectSaga(migrationsSaga)
        .provide([
          [select(migrationTargets), [MigrationTarget.PreHD]],
          [select(migrationStatus, MigrationStep.IdentityManagerChangeOwner), MigrationStatus.Completed],
          [select(migrationStatus, MigrationStep.UpdatePreHDRootToHD), MigrationStatus.Completed],
          [select(migrationStatus, MigrationStep.UportRegistryDDORefresh), MigrationStatus.Completed],
          [matchers.call.fn(performStep), undefined]
        ])
        .call(performStep, MigrationStep.IdentityManagerChangeOwner)
        .call(performStep, MigrationStep.UpdatePreHDRootToHD)
        .call(performStep, MigrationStep.UportRegistryDDORefresh)
        .dispatch(runMigrations(MigrationTarget.PreHD))
        .silentRun()
    })
  })

  it('should stop running unless a step was completed', () => {
    return expectSaga(migrationsSaga)
      .provide([
        [select(migrationTargets), [MigrationTarget.PreHD]],
        [select(migrationStatus, MigrationStep.IdentityManagerChangeOwner), MigrationStatus.Completed],
        [select(migrationStatus, MigrationStep.UpdatePreHDRootToHD), MigrationStatus.Error],
        [matchers.call.fn(performStep), undefined]
      ])
      .call(performStep, MigrationStep.IdentityManagerChangeOwner)
      .call(performStep, MigrationStep.UpdatePreHDRootToHD)
      .not.call(performStep, MigrationStep.UportRegistryDDORefresh)
      .dispatch(runMigrations(MigrationTarget.PreHD))
      .silentRun()
  })

})

describe('performStep', () => {
  const step = MigrationStep.IdentityManagerChangeOwner
  describe('completed', () => {
    it('should not do anything', () => {
      return expectSaga(performStep, step)
        .provide([
          [select(migrationStatus, step), MigrationStatus.Completed]
        ])
        .not.put(startedMigrationStep(step))
        .not.put(startWorking(step))
        .not.call(runImplementationStep, step)
        .not.put(completeProcess(step))
        .not.put(completedMigrationStep(step))
        .run()
    })
  })

  for (let status of [MigrationStatus.NotStarted, MigrationStatus.Started, MigrationStatus.Error]) {
    describe(MigrationStatus[status], () => {
      it('should go through all steps', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStatus, step), status],
            [call(runImplementationStep, step), true]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .put(completedMigrationStep(step))
          .put(completeProcess(step))
          .run()
      })

      it('should handle failure', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStatus, step), status],
            [call(runImplementationStep, step), false]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .put(failedMigrationStep(step))
          .run()
      })

      it('should handle errors thrown', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStatus, step), status],
            [call(runImplementationStep, step), throwError(new Error('Something bad happend'))]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .put(failedMigrationStep(step))
          .put(failProcess(step, 'Something bad happend'))
          .run()
      })
    })
  }
})

describe('runImplementationStep', () => {
  it('should select and run actual migration', () => {
    return expectSaga(runImplementationStep, MigrationStep.IdentityManagerChangeOwner)
      .provide([
        [call(IdentityManagerChangeOwner), true]
      ])
      .call(IdentityManagerChangeOwner)
      .returns(true)
      .run()
  })
})