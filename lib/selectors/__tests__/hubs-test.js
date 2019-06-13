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
  hubHead,
  nextEvent,
  hubQueue,
  hubQueueLength,
  hubCanQueue,
  snapshot
} from 'uPortMobile/lib/selectors/hubs'
import { hashMap, toClj } from 'mori'

const empty = { hub: { events: [] } }
const doNotQueue = { hub: { events: [], doNotQueue: true } }
const event = { type: 'BOOM', name: 'Quirp' }
const withQueued = { hub: { head: 'bcdefg', events: [event, {type: 'HELLO'}] } }
const withData = { head: 'bcdefg', events: [event] }

const withRealIdentity = {hub: empty, uport: hashMap('currentIdentity', 'did:ethr:0x')}
const withNewIdentity = {hub: empty, uport: hashMap('currentIdentity', 'new')}
const withOutIdentity = {hub: empty, uport: hashMap()}

it('returns eventBlock', () => {
  expect(hubHead(empty)).toBeUndefined()
  expect(hubHead(withQueued)).toEqual('bcdefg')
})

it('returns eventBlock', () => {
  expect(nextEvent(empty)).toBeUndefined()
  expect(nextEvent(withQueued)).toEqual(event)
})

it('returns hubQueue', () => {
  expect(hubQueue(empty)).toEqual([])
  expect(hubQueue(withQueued)).toEqual([event, {type: 'HELLO'}])
})

it('returns hubQueueLength', () => {
  expect(hubQueueLength(empty)).toEqual(0)
  expect(hubQueueLength(withQueued)).toEqual(2)
})

it('returns hubCanQueue', () => {
  expect(hubCanQueue(withRealIdentity)).toBeTruthy()
  expect(hubCanQueue(empty)).toBeFalsy()
  expect(hubCanQueue(doNotQueue)).toBeFalsy()
  expect(hubCanQueue(withNewIdentity)).toBeFalsy()
  expect(hubCanQueue(withOutIdentity)).toBeFalsy()
})

const data = {
  hdwallet: toClj({
    root: '0x1234',
    identities: [3, 2, 1],
    seedConfirmed: true,
    accountRiskSent: true
  }),
  uport: toClj({
    byAddress: {
      '0x1234': { hdindex: 0},
      '0x2345': { hdindex: 1, parent: '0x1234'},
      '0x3456': { hdindex: 2, parent: '0x1234'}
    }
  }),
  hub: withData
}

it('returns the snapshot of current uport state', () => {
  expect(snapshot(data)).toMatchSnapshot()
})
