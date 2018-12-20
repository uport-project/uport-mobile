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
  migrationStepStatus, migrationTargets, globalState, migrationCompleted, pendingMigrations
} from 'uPortMobile/lib/selectors/migrations'

import { MigrationStep, MigrationTarget, MigrationStatus } from 'uPortMobile/lib/constants/MigrationActionTypes'
import { MigrationState } from 'uPortMobile/lib/reducers/migrationsReducer'

const empty: globalState = {
  migrations: {
    targets: [],
    steps: {}
  }
} 

const populated: globalState = {
  migrations: {
    targets: [MigrationTarget.PreHD],
    steps: {}
  }
}
populated.migrations.steps[MigrationStep[MigrationStep.IdentityManagerChangeOwner]] = MigrationStatus.Started

const completed: globalState = {
  migrations: {
    targets: [MigrationTarget.PreHD],
    steps: {}
  }
}
completed.migrations.steps[MigrationStep[MigrationStep.CleanUpAfterMissingSeed]] = MigrationStatus.Completed
completed.migrations.steps[MigrationStep[MigrationStep.IdentityManagerChangeOwner]] = MigrationStatus.Completed
completed.migrations.steps[MigrationStep[MigrationStep.UpdatePreHDRootToHD]] = MigrationStatus.Completed
completed.migrations.steps[MigrationStep[MigrationStep.UportRegistryDDORefresh]] = MigrationStatus.Completed

describe('migrationTargets', () => {
  describe('empty', () => {
    it('should return an empty list', () => {
      expect(migrationTargets(empty)).toEqual([])
    })  
  })

  describe('populated', () => {
    it('should return a list with targets', () => {
      expect(migrationTargets(populated)).toEqual([MigrationTarget.PreHD])
    })  
  })
})


describe('migrationStepStatus', () => {
  describe('empty', () => {
    it('should return NotStarted', () => {
      expect(migrationStepStatus(empty, MigrationStep.IdentityManagerChangeOwner)).toEqual(MigrationStatus.NotStarted)
    })
  })

  describe('started', () => {
    it('should return Started', () => {
      expect(migrationStepStatus(populated, MigrationStep.IdentityManagerChangeOwner)).toEqual(MigrationStatus.Started)
    })
  })
})

describe('migrationCompleted', () => {
  describe('empty', () => {
    it('should not be completed', () => {
      expect(migrationCompleted(empty, MigrationTarget.PreHD)).toBeFalsy()
    })
  })

  describe('populated', () => {
    it('should not be completed', () => {
      expect(migrationCompleted(populated, MigrationTarget.PreHD)).toBeFalsy()
    })
  })

  describe('completed', () => {
    it('should be completed', () => {
      expect(migrationCompleted(completed, MigrationTarget.PreHD)).toBeTruthy()
    })
  })
})

describe('pendingMigrations', () => {
  describe('empty', () => {
    it('should not be completed', () => {
      expect(pendingMigrations(empty)).toEqual([])
    })
  })

  describe('populated', () => {
    it('should not be completed', () => {
      expect(pendingMigrations(populated)).toEqual([MigrationTarget.PreHD])
    })
  })

  describe('completed', () => {
    it('should be completed', () => {
      expect(pendingMigrations(completed)).toEqual([])
    })
  })
})
