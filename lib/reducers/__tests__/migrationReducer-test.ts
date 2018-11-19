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

import { addMigrationTarget, startedMigrationStep, completedMigrationStep, failedMigrationStep } from 'uPortMobile/lib/actions/migrationActions'
import { MigrationStep, MigrationTarget, MigrationStatus } from 'uPortMobile/lib/constants/MigrationActionTypes'
import reducer, { MigrationState } from '../migrationsReducer'


const initialState : MigrationState = {
  targets: [],
  steps: {}
}

const populated : MigrationState = {
  targets: [MigrationTarget.PreHD],
  steps: {}
}
populated.steps[MigrationStep[MigrationStep.IdentityManagerChangeOwner]] = MigrationStatus.Started

describe('addMigrationTarget', () => {
  it('adds a target', () => {
    expect(reducer(initialState, addMigrationTarget(MigrationTarget.PreHD))).toMatchSnapshot()
  })

  it('does not add an existing target', () => {
    expect(reducer(populated, addMigrationTarget(MigrationTarget.PreHD))).toEqual(populated)
  })
})

describe('startedMigrationStep', () => {
  it('starts a step', () => {
    expect(reducer(initialState, startedMigrationStep(MigrationStep.IdentityManagerChangeOwner))).toMatchSnapshot()
  })

  it('does not a step if already started', () => {
    expect(reducer(populated, startedMigrationStep(MigrationStep.IdentityManagerChangeOwner))).toEqual(populated)
  })

  it('should start an additional step', () => {
    expect(reducer(populated, startedMigrationStep(MigrationStep.UpdatePreHDRootToHD))).toMatchSnapshot()
  })
})

describe('completedMigrationStep', () => {
  it('completes a step', () => {
    expect(reducer(initialState, completedMigrationStep(MigrationStep.IdentityManagerChangeOwner))).toMatchSnapshot()
  })

  it('completes a step if already started', () => {
    expect(reducer(populated, completedMigrationStep(MigrationStep.IdentityManagerChangeOwner)).steps[MigrationStep.IdentityManagerChangeOwner]).toEqual(MigrationStatus.Completed)
  })

  it('should complete an additional step', () => {
    expect(reducer(populated, completedMigrationStep(MigrationStep.UpdatePreHDRootToHD))).toMatchSnapshot()
  })
})

describe('failedMigrationStep', () => {
  it('fails a step', () => {
    expect(reducer(initialState, failedMigrationStep(MigrationStep.IdentityManagerChangeOwner))).toMatchSnapshot()
  })

  it('fails a step if already started', () => {
    expect(reducer(populated, failedMigrationStep(MigrationStep.IdentityManagerChangeOwner)).steps[MigrationStep.IdentityManagerChangeOwner]).toEqual(MigrationStatus.Error)
  })

  it('should fail an additional step', () => {
    expect(reducer(populated, failedMigrationStep(MigrationStep.UpdatePreHDRootToHD))).toMatchSnapshot()
  })
})
