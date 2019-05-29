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
import recoveryReducer from 'uPortMobile/lib/reducers/recoveryReducer.js'
import {
  saveRecoverySeed,
  hideRecoverySeed,
  selectRecoveryWord
} from 'uPortMobile/lib/actions/recoveryActions'
import { switchIdentity } from 'uPortMobile/lib/actions/uportActions'

import { toJs, toClj, hashMap } from 'mori'
const empty = hashMap()
const withSeed = toClj({seed: 'SECRET SIDE', wordNo: 0})

const reducer = (state, action) => toJs(recoveryReducer(state, action))

it('saves Recovery Seed', () => {
  expect(reducer(null, saveRecoverySeed('HELLO THIS IS SECRET'))).toMatchSnapshot()
  expect(reducer(withSeed, saveRecoverySeed('HELLO THIS IS SECRET'))).toMatchSnapshot()
})

it('clears Recovery Seed', () => {
  expect(reducer(null, hideRecoverySeed())).toMatchSnapshot()
  expect(reducer(withSeed, hideRecoverySeed())).toMatchSnapshot()
})

it('select Recovery word', () => {
  expect(reducer(null, selectRecoveryWord(3))).toMatchSnapshot()
  expect(reducer(withSeed, selectRecoveryWord(3))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(recoveryReducer(undefined, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(recoveryReducer(empty, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(recoveryReducer(withSeed, {type: 'UNSUPPORTED'})).toEqual(withSeed)
})

it('clears itself if main identity is switched', () => {
  expect(reducer(null, switchIdentity())).toEqual({})
  expect(reducer(withSeed, switchIdentity())).toEqual({})
})
