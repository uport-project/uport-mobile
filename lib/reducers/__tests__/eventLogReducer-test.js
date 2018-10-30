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
import {storeLastBlockForLogs, storeEvents} from 'uPortMobile/lib/actions/eventLogActions.js'
import baseReducer from 'uPortMobile/lib/reducers/eventLogReducer.js'
import { toClj, toJs, hashMap } from 'mori'

const reducer = (state, action) => toJs(baseReducer(state, action))

const empty = hashMap()

const withEvents = toClj({
  '0x010102': {
    block: 10000,
    events: [{type: 'test'}]
  },
  '0x010101': {
    block: 10000,
    events: [{type: 'test'}]
  }
})

it('creates a STORE_LAST_BLOCK_FOR_LOGS action', () => {
  expect(reducer(null, storeLastBlockForLogs('0x010102', 12313))).toMatchSnapshot()
  expect(reducer(withEvents, storeLastBlockForLogs('0x010102', 12313))).toMatchSnapshot()
})

it('creates a STORE_EVENTS action', () => {
  expect(reducer(null, storeEvents('0x010102', [{type: 'something'}]))).toMatchSnapshot()
  expect(reducer(withEvents, storeEvents('0x010102', [{type: 'something'}]))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(baseReducer(undefined, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(baseReducer(empty, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(baseReducer(withEvents, {type: 'UNSUPPORTED'})).toEqual(withEvents)
})
