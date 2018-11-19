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
import { 
  ADD_MIGRATION_TARGET, 
  STARTED_MIGRATION_STEP, 
  COMPLETED_MIGRATION_STEP,
  FAILED_MIGRATION_STEP,
  TargetAction,
  StepAction,
  MigrationStep, 
  MigrationTarget, 
  MigrationStatus } from '../constants/MigrationActionTypes'
// Need to Define the initialState.

interface MigrationStepState {
  [index: string]: MigrationStatus
}

export interface MigrationState {
  targets: MigrationTarget[],
  steps: MigrationStepState
}

const initialState : MigrationState = {
  targets: [],
  steps: {}
}

interface GenericAction {
  type: string
}

type Action = GenericAction | TargetAction | StepAction

function reduceTarget(state: MigrationState, action: TargetAction) : MigrationState {
  if (state.targets.includes(action.target)) {
    return state
  } else {
    return {...state, targets: [action.target, ...state.targets]}
  }
}

function reduceSetMigrationStep(state: MigrationState, step: MigrationStep, status: MigrationStatus) : MigrationState {
  const steps = {...state.steps}
  steps[MigrationStep[step]] = status
  return {...state, steps}
}

function migrationsReducer (state = initialState, action: Action) : MigrationState {
  switch (action.type) {
    case ADD_MIGRATION_TARGET:
    return reduceTarget(state, <TargetAction>action)
    case STARTED_MIGRATION_STEP:
    return reduceSetMigrationStep(state, (<StepAction>action).step, MigrationStatus.Started)
    case COMPLETED_MIGRATION_STEP:
    return reduceSetMigrationStep(state, (<StepAction>action).step, MigrationStatus.Completed)
    case FAILED_MIGRATION_STEP:
    return reduceSetMigrationStep(state, (<StepAction>action).step, MigrationStatus.Error)
    default:
    return state
  }
}

export default migrationsReducer
