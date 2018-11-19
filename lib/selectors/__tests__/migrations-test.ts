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
  migrationStatus, migrationTargets, globalState
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


describe('migrationStatus', () => {
  describe('empty', () => {
    it('should return NotStarted', () => {
      expect(migrationStatus(empty, MigrationStep.IdentityManagerChangeOwner)).toEqual(MigrationStatus.NotStarted)
    })
  })

  describe('started', () => {
    it('should return Started', () => {
      expect(migrationStatus(populated, MigrationStep.IdentityManagerChangeOwner)).toEqual(MigrationStatus.Started)
    })
  })

})