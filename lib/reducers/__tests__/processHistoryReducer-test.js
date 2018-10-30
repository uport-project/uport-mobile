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
  saveMessage, saveError, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import baseReducer from 'uPortMobile/lib/reducers/processHistoryReducer.js'
import { toJs, list } from 'mori'
import MockDate from 'mockdate'
const NOW = 1485321133000
MockDate.set(NOW)

const reducer = (state, action) => toJs(baseReducer(state, action))

const empty = list()

const withHistory = list(
  { section: 'unnu',
    message: 'Woohoo'
  },
  { section: 'unnu',
    error: 'nooooh'
  },
  {
    section: 'sensui',
    message: 'funded'
  }
)

it('sets timestamp on event', () => {
  expect(reducer(empty, saveMessage('unnu', 'Looking good'))[0]._time).toEqual(NOW)
})

it('sets message for section', () => {
  expect(reducer(empty, saveMessage('unnu', 'Looking good'))).toMatchSnapshot()
  expect(reducer(withHistory, saveMessage('unnu', 'Looking good'))).toMatchSnapshot()
  expect(reducer(withHistory, saveMessage('sensui', 'Looking good'))).toMatchSnapshot()
})

it('sets error for section', () => {
  expect(reducer(empty, saveError('unnu', 'Dang it broke'))).toMatchSnapshot()
  expect(reducer(withHistory, saveError('unnu', 'Dang it broke'))).toMatchSnapshot()
  expect(reducer(withHistory, saveError('sensui', 'Dang it broke'))).toMatchSnapshot()
})

it('sets error for section', () => {
  expect(reducer(empty, failProcess('unnu', 'Dang it broke'))).toMatchSnapshot()
  expect(reducer(withHistory, failProcess('unnu', 'Dang it broke'))).toMatchSnapshot()
  expect(reducer(withHistory, failProcess('sensui', 'Dang it broke'))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(baseReducer(undefined, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(baseReducer(empty, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(baseReducer(withHistory, {type: 'UNSUPPORTED'})).toEqual(withHistory)
})
