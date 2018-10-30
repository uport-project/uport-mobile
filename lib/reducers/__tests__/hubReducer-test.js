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

import reducer from 'uPortMobile/lib/reducers/hubReducer.js'
import { storeHubHead, queueEvent, takeQueuedEvent, clearQueue } from 'uPortMobile/lib/actions/hubActions.js'
import { startSeedRecovery } from 'uPortMobile/lib/actions/recoveryActions.js'
import { toJs, hashMap, queue } from 'mori'

const empty = hashMap('head', null, 'events', queue())
const doNotQueue = hashMap('head', null, 'events', queue(), 'doNotQueue', true)
const withData = hashMap('head', 'bcdefg', 'events', queue({type: 'HELLO'}))
const withQueue = hashMap('head', 'bcdefg', 'events', queue({type: 'HELLO1'}, {type: 'HELLO2'}, {type: 'HELLO3'}))
const event = {type: 'BOOM', name: 'Quirp'}

it('sets head', () => {
  expect(toJs(reducer(undefined, storeHubHead('abcde')))).toMatchSnapshot()
  expect(toJs(reducer(empty, storeHubHead('abcde')))).toMatchSnapshot()
  expect(toJs(reducer(withData, storeHubHead('abcde')))).toMatchSnapshot()
  expect(toJs(reducer(doNotQueue, storeHubHead('abcde')))).toMatchSnapshot()
})

it('queues event', () => {
  expect(toJs(reducer(undefined, queueEvent(event)))).toMatchSnapshot()
  expect(toJs(reducer(empty, queueEvent(event)))).toMatchSnapshot()
  expect(toJs(reducer(withData, queueEvent(event)))).toMatchSnapshot()
  expect(toJs(reducer(withQueue, queueEvent(event)))).toMatchSnapshot()
})

it('takes queued event', () => {
  expect(toJs(reducer(undefined, takeQueuedEvent()))).toMatchSnapshot()
  expect(toJs(reducer(empty, takeQueuedEvent()))).toMatchSnapshot()
  expect(toJs(reducer(withData, takeQueuedEvent()))).toMatchSnapshot()
  expect(toJs(reducer(withQueue, takeQueuedEvent()))).toMatchSnapshot()
})

it('clears queue', () => {
  expect(toJs(reducer(undefined, clearQueue(event)))).toMatchSnapshot()
  expect(toJs(reducer(empty, clearQueue(event)))).toMatchSnapshot()
  expect(toJs(reducer(withData, clearQueue(event)))).toMatchSnapshot()
  expect(toJs(reducer(withQueue, clearQueue(event)))).toMatchSnapshot()
})

it('marks as doNotQueue', () => {
  expect(toJs(reducer(undefined, startSeedRecovery()))).toMatchSnapshot()
  expect(toJs(reducer(empty, startSeedRecovery()))).toMatchSnapshot()
  expect(toJs(reducer(withQueue, startSeedRecovery()))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(reducer(empty, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(reducer(withData, {type: 'UNSUPPORTED'})).toEqual(withData)
})
