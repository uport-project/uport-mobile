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
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { delay } from 'redux-saga'
import { takeEvery, call, put, select, all, cps } from 'redux-saga/effects'
import { AppState } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

import { massageIdentity, massage, resetStorage, persistedReducers, allStores, FORCE_CLEAN_STATE } from '../stateSaver'
import { toJs, toClj } from 'mori'

const simpleIdentity = {
  address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
  own: {
    name: 'Alice',
    phone: '555-555-5555',
    connections: {
      knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'],
      worksWith: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01','0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02']
    }
  },
  activities: {
    '11': {
      id: 11,
      type: 'transaction',
      client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'
    },
    '10': {
      id: 10,
      type: 'transaction',
      client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'
    }
  }
}

const uportState = {
  byAddress: {
    '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a': simpleIdentity
  },
  currentIdentity: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
}

it('sets massages identity correctly', () => {
  // console.log(massageIdentity(toClj(simpleIdentity)))
  expect(massageIdentity(toClj(simpleIdentity))).toMatchSnapshot()
})

it('sets massages full saved state correctly', () => {
  // console.log(massage(toClj(uportState)))
  expect(massage(toClj(uportState))).toMatchSnapshot()
})

it('removes all persisted reducers', () => {
  return expectSaga(resetStorage)
    .provide([
      [call(delay, 1000)],
      [cps(AsyncStorage.multiRemove, allStores)]
    ])
    .call(delay, 1000)
    .cps(AsyncStorage.multiRemove, allStores)
    .run()
})

it('should always have FORCE_CLEAN_STATE be off when committing', () => {
  expect(FORCE_CLEAN_STATE).toBeFalsy()
})
