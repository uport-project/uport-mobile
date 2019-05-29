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
  showRecoverySeed,
  hideRecoverySeed,
  saveRecoverySeed,
  selectRecoveryWord,
  startSeedRecovery
 } from 'uPortMobile/lib/actions/recoveryActions'

it('creates a SHOW_RECOVERY_SEED action', () => {
  expect(showRecoverySeed()).toMatchSnapshot()
})

it('creates a SAVE_RECOVERY_SEED action', () => {
  expect(saveRecoverySeed('secret seed')).toMatchSnapshot()
})

it('creates a HIDE_RECOVERY_SEED action', () => {
  expect(hideRecoverySeed()).toMatchSnapshot()
})

it('creates a SELECT_RECOVERY_SEED_WORD action', () => {
  expect(selectRecoveryWord(8)).toMatchSnapshot()
})

it('creates a START_SEED_RECOVERY action', () => {
  expect(startSeedRecovery('some secret phase', 123)).toMatchSnapshot()
})
