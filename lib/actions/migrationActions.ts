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

import { ADD_MIGRATION_TARGET, STARTED_MIGRATION_STEP, COMPLETED_MIGRATION_STEP, FAILED_MIGRATION_STEP, RUN_MIGRATIONS, RUN_MIGRATION_STEP, MigrationStep, MigrationTarget, TargetAction, StepAction } from 'uPortMobile/lib/constants/MigrationActionTypes'

const _backup = true

export function addMigrationTarget(target: MigrationTarget) : TargetAction {
  return {
    type: ADD_MIGRATION_TARGET,
    target,
    _backup
  }
}

export function runMigrations(target: MigrationTarget) : TargetAction {
  return {
    type: RUN_MIGRATIONS,
    target
  }
}

export function runMigrationStep(step: MigrationStep) : StepAction {
  return {
    type: RUN_MIGRATION_STEP,
    step
  }
}

export function startedMigrationStep(step: MigrationStep) : StepAction {
  return {
    type: STARTED_MIGRATION_STEP,
    step,
    _backup
  }
}

export function completedMigrationStep(step: MigrationStep) : StepAction {
  return {
    type: COMPLETED_MIGRATION_STEP,
    step,
    _backup
  }
}

export function failedMigrationStep(step: MigrationStep) : StepAction {
  return {
    type: FAILED_MIGRATION_STEP,
    step,
    _backup
  }
}