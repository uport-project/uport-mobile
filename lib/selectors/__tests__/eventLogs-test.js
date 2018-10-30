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
import eventLogReducer from 'uPortMobile/lib/reducers/eventLogReducer'
import { 
  eventBlock,
  eventLog
} from 'uPortMobile/lib/selectors/eventLogs'
import { hashMap, toJs, toClj, assocIn, vector } from 'mori'
import BN from 'bn.js'

const empty = hashMap()

const populated = toClj({
  '0x010102': {
    block: '2710',
    events: [{type: 'test'}]
  },
  '0x010101': {
    block: '2711',
    events: [{type: 'test2'}]
  }
})

const withNoEvents = {events: empty}
const withEvents = {events: populated}

it('returns eventBlock', () => {
  expect(eventBlock(withNoEvents, '0x010102')).toBeUndefined()
  expect(eventBlock(withNoEvents, '0x010101')).toBeUndefined()
  expect(eventBlock(withEvents, '0x010102')).toEqual(new BN('2710', 16))
  expect(eventBlock(withEvents, '0x010101')).toEqual(new BN('2711', 16))
})

it('returns eventLog', () => {
  expect(eventLog(withNoEvents, '0x010102')).toEqual([])
  expect(eventLog(withNoEvents, '0x010101')).toEqual([])
  expect(eventLog(withEvents, '0x010102')).toEqual([{type: 'test'}])
  expect(eventLog(withEvents, '0x010101')).toEqual([{type: 'test2'}])
})
