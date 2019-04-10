import MigrationScreen from '../components/Migrations/MigrationScreen'

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

export const ADD_MIGRATION_TARGET = 'ADD_MIGRATION_TARGET'
export const RUN_MIGRATIONS = 'RUN_MIGRATIONS'
export const STARTED_MIGRATION_STEP = 'STARTED_MIGRATION_STEP'
export const COMPLETED_MIGRATION_STEP = 'COMPLETED_MIGRATION_STEP'
export const FAILED_MIGRATION_STEP = 'FAILED_MIGRATION_STEP'

import SCREENS from 'uPortMobile/lib/screens/Screens'

export enum MigrationTarget {
  Legacy = 'Legacy',
  MissingKeys = 'MissingKeys',
  RecoverSeed = 'RecoverSeed',
}

export enum MigrationStep {
  MigrateLegacy = 'MigrateLegacy',
  EnterSeed = 'EnterSeed',
}

export enum MigrationStatus {
  NotStarted,
  Started,
  Completed,
  Error,
}

export interface Recipes {
  [index: string]: MigrationStep[]
}

export const targetRecipes: Recipes = {
  Legacy: [MigrationStep.MigrateLegacy],
  RecoverSeed: [MigrationStep.EnterSeed],
}

export interface MigrationScreens {
  [index: string]: string
}

export const migrationScreens: MigrationScreens = {
  RecoverSeed: SCREENS.RECOVERY.RestoreSeedInstructions,
}

export interface TargetAction {
  type: 'ADD_MIGRATION_TARGET' | 'RUN_MIGRATIONS'
  target: MigrationTarget
  _backup?: boolean
}

export interface StepAction {
  type: 'STARTED_MIGRATION_STEP' | 'COMPLETED_MIGRATION_STEP' | 'FAILED_MIGRATION_STEP'
  step: MigrationStep
  _backup?: boolean
}
