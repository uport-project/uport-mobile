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
import { delay } from 'redux-saga'
import { select, call } from 'redux-saga/effects'
import migrationsSaga, { performStep, runImplementationStep, checkIfAbleToSign, runMigrations, alert } from '../migrationsSaga'
import MigrateLegacy from '../migrations/MigrateLegacy'
import { canSignFor, hasWorkingSeed } from 'uPortMobile/lib/sagas/keychain'
import {
  MigrationStep,
  MigrationTarget,
  MigrationStatus
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import { loadedDB } from 'uPortMobile/lib/actions/globalActions'
import {
  runMigrations as runMigrationAction,
  addMigrationTarget,
  startedMigrationStep,
  completedMigrationStep,
  failedMigrationStep
} from 'uPortMobile/lib/actions/migrationActions'
import {
  startWorking,
  stopWorking,
  saveMessage,
  completeProcess,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import { NavigationActions } from 'uPortMobile/lib/utilities/NavigationActions'

import { migrationStepStatus, migrationTargets, pendingMigrations, migrationCompleted } from 'uPortMobile/lib/selectors/migrations'
import { isFullyHD, isHD } from 'uPortMobile/lib/selectors/chains'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import { migrateableIdentities, currentAddress, hasMainnetAccounts, otherIdentities } from 'uPortMobile/lib/selectors/identities'
import { Alert } from 'react-native';

describe('checkup', () => {
  const root = '2ozYQa2fucphC7u8RLaADFnZeCPUZ3MTzMT'

  describe('no identity', () => {
    it('does not add migration target', () => {
      return expectSaga(migrationsSaga)
        .provide([
          [select(currentAddress), undefined]
        ])
        .not.put(addMigrationTarget(MigrationTarget.Legacy))
        .dispatch(loadedDB())
        .silentRun()

    })
  })

  describe('ethr did', () => {
    const root = 'did:ethr:0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
    it('does not Add Migration Target', () => {
      return expectSaga(migrationsSaga)
        .provide([
          [select(currentAddress), root],
          [call(canSignFor, root), true],
          [select(pendingMigrations), []],
          [select(migrateableIdentities), []]
        ])
        .not.put(addMigrationTarget(MigrationTarget.Legacy))
        .dispatch(loadedDB())
        .silentRun()
    })

    describe('unable to sign', () => {
      describe('missing seed', () => {
        it('adds Migration Target', () => {
          return expectSaga(migrationsSaga)
            .provide([
              [select(currentAddress), root],
              [select(hdRootAddress), root],
              [call(hasWorkingSeed), false],
              [call(canSignFor, root), false],
              [select(isHD, root), true],
              [select(pendingMigrations), []],
              [select(migrateableIdentities), []]
            ])
            .put(addMigrationTarget(MigrationTarget.RecoverSeed))
            .dispatch(loadedDB())
            .silentRun()
        })
      })
    })
  })

  describe('Legacy Identity', () => {
    describe('has Full HD Wallet', () => {
      describe('has attestations', () => {
        it('should not do anything', () => {
          return expectSaga(migrationsSaga)
            .provide([
              [select(currentAddress), root],
              [select(otherIdentities), []],
              [call(canSignFor, root), true],
              [select(isFullyHD), true],
              [select(hasMainnetAccounts), false],
              [select(pendingMigrations), []],
              [select(migrateableIdentities), [{ address: '0x' }]]
            ])
            .put(addMigrationTarget(MigrationTarget.Legacy))
            .dispatch(loadedDB())
            .silentRun()
        })
      })

      describe('has mainnet accounts', () => {
        it('should not do anything', () => {
          return expectSaga(migrationsSaga)
            .provide([
              // TODO add selector for mainnet
              [select(currentAddress), root],
              [select(otherIdentities), []],
              [call(canSignFor, root), true],
              [select(isFullyHD), true],
              [select(hasMainnetAccounts), true],
              [select(pendingMigrations), []],
              [select(migrateableIdentities), [{ address: '0x' }]]
            ])
            .put(addMigrationTarget(MigrationTarget.Legacy))
            .dispatch(loadedDB())
            .silentRun()
        })
      })

      describe('without attestations or mainnet accounts', () => {
        it('should migrate to Ethr DID', () => {
          return expectSaga(migrationsSaga)
            .provide([
              [select(currentAddress), root],
              [select(otherIdentities), []],
              [call(canSignFor, root), true],
              [select(isFullyHD), true],
              [select(hasMainnetAccounts), false],
              [select(pendingMigrations), []],
              [select(migrateableIdentities), [{ address: '0x' }]]
            ])
            .put(addMigrationTarget(MigrationTarget.Legacy))
            .dispatch(loadedDB())
            .silentRun()
        })
      })
    })

    describe('Pre HD wallet', () => {
      describe('able to sign', () => {
        describe('has attestations', () => {
          it('adds Legacy Migration Target', () => {
            return expectSaga(migrationsSaga)
              .provide([
                [select(currentAddress), root],
                [select(isFullyHD), false],
                [select(otherIdentities), []],
                [call(canSignFor, root), true],
                [select(hasMainnetAccounts), false],
                [select(pendingMigrations), []],
                [select(migrateableIdentities), [{ address: '0x' }]]
              ])
              .put(addMigrationTarget(MigrationTarget.Legacy))
              .dispatch(loadedDB())
              .silentRun()
          })
        })

        describe('without attestations', () => {
          it('adds Legacy Migration Target', () => {
            return expectSaga(migrationsSaga)
              .provide([
                [select(currentAddress), root],
                [call(canSignFor, root), true],
                [select(otherIdentities), []],
                [select(isFullyHD), false],
                [select(hasMainnetAccounts), false],
                [select(pendingMigrations), []],
                [select(migrateableIdentities), [{ address: '0x' }]]
              ])
              .put(addMigrationTarget(MigrationTarget.Legacy))
              .dispatch(loadedDB())
              .silentRun()
          })
        })
      })

      describe('unable to sign', () => {
        describe('has attestations', () => {
          return expectSaga(migrationsSaga)
            .provide([
              [select(currentAddress), root],
              [call(canSignFor, root), false],
              [select(otherIdentities), []],
              [select(hasMainnetAccounts), false],
              [select(pendingMigrations), []],
              [select(hdRootAddress), undefined],
              [call(hasWorkingSeed), false],
              [select(isHD, root), false],
              [select(migrateableIdentities), [{ address: '0x' }]]
            ])
            .put(addMigrationTarget(MigrationTarget.Legacy))
            .dispatch(loadedDB())
            .silentRun()

        })

        describe('without attestations', () => {
          return expectSaga(migrationsSaga)
            .provide([
              [select(currentAddress), root],
              [select(otherIdentities), []],
              [call(canSignFor, root), false],
              [select(isFullyHD), false],
              [select(hasMainnetAccounts), false],
              [select(pendingMigrations), []],
              [select(hdRootAddress), undefined],
              [call(hasWorkingSeed), false],
              [select(isHD, root), false],
              [select(migrateableIdentities), [{ address: '0x' }]]
            ])
            .put(addMigrationTarget(MigrationTarget.Legacy))
            .dispatch(loadedDB())
            .silentRun()
        })
      })
    })
  })

  describe('Legacy', () => {
    describe('Trigger Migration Screen', () => {
      describe('pending migrations contains at least one migration', () => {
        it('runs migration and shows alert', () => {
          return expectSaga(migrationsSaga)
            .provide([
              [select(currentAddress), root],
              [call(checkIfAbleToSign), true],
              [select(isFullyHD), false],
              [select(otherIdentities), []],
              [select(hasMainnetAccounts), false],
              [select(pendingMigrations), [MigrationTarget.Legacy]],
              [call(delay, 1000), undefined],
              [call(runMigrations, runMigrationAction(MigrationTarget.Legacy)), true]
            ])
            .put(addMigrationTarget(MigrationTarget.Legacy))
            .call(delay, 1000)
            .call(runMigrations, runMigrationAction(MigrationTarget.Legacy))
            .call(alert,
              'Your Identity has been upgraded',
              'You had an old test net identity. Thank you for being an early uPort user. We have now upgraded your identity to live on the Ethereum Mainnet.'
            )
            .dispatch(loadedDB())
            .silentRun()
        })
      })
    })
  })
})

describe('runMigrations', () => {
  describe('with targets', () => {
    it('should run all steps', () => {
      return expectSaga(runMigrations, runMigrationAction(MigrationTarget.Legacy))
        .provide([
          [select(migrationTargets), [MigrationTarget.Legacy]],
          [select(migrationStepStatus, MigrationStep.MigrateLegacy), MigrationStatus.Completed],
          [select(migrationCompleted, MigrationTarget.Legacy), true],
          [matchers.call.fn(performStep), undefined]
        ])
        .put(startWorking(MigrationTarget.Legacy))
        .call(performStep, MigrationStep.MigrateLegacy)
        .put(completeProcess(MigrationTarget.Legacy))
        .returns(true)
        .silentRun()
    })
  })

  it('should stop running unless a step was completed', () => {
    return expectSaga(runMigrations, runMigrationAction(MigrationTarget.Legacy))
      .provide([
        [select(migrationTargets), [MigrationTarget.Legacy]],
        [select(migrationStepStatus, MigrationStep.MigrateLegacy), undefined],
        [select(migrationCompleted, MigrationTarget.Legacy), false],
        [matchers.call.fn(performStep), undefined]
      ])
      .call(performStep, MigrationStep.MigrateLegacy)
      .put(failProcess(MigrationTarget.Legacy))
      .returns(false)
      .dispatch(runMigrationAction(MigrationTarget.Legacy))
      .silentRun()
  })
})

describe('performStep', () => {
  const step = MigrationStep.MigrateLegacy
  describe('completed', () => {
    it('should not do anything', () => {
      return expectSaga(performStep, step)
        .provide([
          [select(migrationStepStatus, step), MigrationStatus.Completed]
        ])
        .not.put(startedMigrationStep(step))
        .not.put(startWorking(step))
        .not.call(runImplementationStep, step)
        .not.put(stopWorking(step))
        .not.put(completedMigrationStep(step))
        .run()
    })
  })

  for (let status of [MigrationStatus.NotStarted, MigrationStatus.Started, MigrationStatus.Error]) {
    describe(MigrationStatus[status], () => {
      it('should go through all steps', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStepStatus, step), status],
            [call(runImplementationStep, step), true]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .call(runImplementationStep, step)
          .put(completedMigrationStep(step))
          .put(stopWorking(step))
          .run()
      })

      it('should handle failure', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStepStatus, step), status],
            [call(runImplementationStep, step), false]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .call(runImplementationStep, step)
          .put(failedMigrationStep(step))
          .not.put(completedMigrationStep(step))
          .not.put(stopWorking(step))
          .run()
      })

      it('should handle errors thrown', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStepStatus, step), status],
            [call(runImplementationStep, step), throwError(new Error('Something bad happend'))]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .call(runImplementationStep, step)
          .put(failedMigrationStep(step))
          .put(failProcess(step, 'Something bad happend'))
          .not.put(completedMigrationStep(step))
          .not.put(stopWorking(step))
          .run()
      })
    })
  }
})

describe('runImplementationStep', () => {
  it('should select and run actual migration', () => {
    return expectSaga(runImplementationStep, MigrationStep.MigrateLegacy)
      .provide([
        [call(MigrateLegacy), true]
      ])
      .call(MigrateLegacy)
      .returns(true)
      .run()
  })
})