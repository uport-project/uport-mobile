// This file is part of the uPort Mobile App.

// The uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// The uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with The uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.

// (C) Copyright 2016-2018 ConsenSys AG

import { addMigrationTarget, runMigrations, runMigrationStep, startedMigrationStep, completedMigrationStep, failedMigrationStep } from '../migrationActions'
import { MigrationStep, MigrationTarget } from 'uPortMobile/lib/constants/MigrationActionTypes'

it('creates a ADD_MIGRATION_TARGET action', () => {
  expect(addMigrationTarget(MigrationTarget.PreHD)).toMatchSnapshot()
})

it('creates a RUN_MIGRATIONS action', () => {
  expect(runMigrations(MigrationTarget.PreHD)).toMatchSnapshot()
})

it('creates a RUN_MIGRATION_STEP action', () => {
  expect(runMigrationStep(MigrationStep.IdentityManagerChangeOwner)).toMatchSnapshot()
})

it('creates a STARTED_MIGRATION_STEP action', () => {
  expect(startedMigrationStep(MigrationStep.IdentityManagerChangeOwner)).toMatchSnapshot()
})

it('creates a COMPLETED_MIGRATION_STEP action', () => {
  expect(completedMigrationStep(MigrationStep.IdentityManagerChangeOwner)).toMatchSnapshot()
})

it('creates a FAILED_MIGRATION_STEP action', () => {
  expect(failedMigrationStep(MigrationStep.IdentityManagerChangeOwner)).toMatchSnapshot()
})
