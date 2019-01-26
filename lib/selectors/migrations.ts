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
  MigrationStep, 
  MigrationTarget, 
  MigrationStatus,
  Recipes,
  targetRecipes
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  MigrationState
} from 'uPortMobile/lib/reducers/migrationsReducer'

import { createSelector } from 'reselect'

export interface globalState {
  migrations: MigrationState
}

const migrations = (state: globalState): MigrationState => state.migrations
const currentStep = (state: globalState, step: MigrationStep) => step
const currentTarget = (state: globalState, target: MigrationTarget) => target

export const migrationTargets = createSelector(
  [migrations],
  state => state.targets
)

export const migrationStepStatus = createSelector(
  [migrations, currentStep],
  (state, step: MigrationStep) => state.steps[step] || MigrationStatus.NotStarted
)

const targetCompleted = (state: MigrationState, target: MigrationTarget) => (targetRecipes[target] || []).every(step => state.steps[step] === MigrationStatus.Completed)

export const migrationCompleted = createSelector(
  [migrations, currentTarget],
  targetCompleted
)

export const pendingMigrations = createSelector(
  [migrations],
  state => state.targets.filter(target => !targetCompleted(state, target))
)

export const pendingMigration = createSelector(
  [pendingMigrations, currentTarget],
  (migrations, target) => migrations.find(t => t === target)
)