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
export const RUN_MIGRATION_STEP = 'RUN_MIGRATION_STEP'
export const STARTED_MIGRATION_STEP = 'STARTED_MIGRATION_STEP'
export const COMPLETED_MIGRATION_STEP = 'COMPLETED_MIGRATION_STEP'
export const FAILED_MIGRATION_STEP = 'FAILED_MIGRATION_STEP'


export enum MigrationTarget {
  PreHD = "PreHD"
}

export enum MigrationStep {
  IdentityManagerChangeOwner = 'IdentityManagerChangeOwner',
  UpdatePreHDRootToHD = 'UpdatePreHDRootToHD',
  UportRegistryDDORefresh = 'UportRegistryDDORefresh'
}

export enum MigrationStatus {
  NotStarted,
  Started,
  Completed,
  Error
}

export interface TargetAction {
  type: 'ADD_MIGRATION_TARGET' | 'RUN_MIGRATIONS',
  target: MigrationTarget
}

export interface StepAction {
  type: 'RUN_MIGRATION_STEP' | 'STARTED_MIGRATION_STEP' | 'COMPLETED_MIGRATION_STEP' | 'FAILED_MIGRATION_STEP',
  step: MigrationStep
}