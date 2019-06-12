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
import { eventChannel, delay } from 'redux-saga'
import { call, take, put } from 'redux-saga/effects'

import { NetInfo } from 'react-native'
import { goOffline, goOnline } from 'uPortMobile/lib/actions/networkingActions'
// import * as _ from 'mori'

export function * connected () {
  return yield call(NetInfo.isConnected.fetch)
}

export function * monitorConnection () {
  // console.log('Monitoring Network <<<<<<<<------')
  const networkStateChannel = yield eventChannel(emitter => {
    NetInfo.isConnected.addEventListener('connectionChange', emitter)
    return () => {
      // console.log('closing')
      NetInfo.isConnected.removeEventListener('connectionChange', emitter)
    }
  })
  while (true) {
    const isConnected = yield take(networkStateChannel)
    // console.log(`are we connected? ${isConnected}`)
    if (isConnected) {
      yield put(goOnline())
    } else {
      yield put(goOffline())
    }
  }
}

// Executes given function f onoy if we are connected to the internet, but don't queue
export function * onlyConnected (f) {
  const isConnected = yield connected()
  if (isConnected) {
    return yield call(f)
  } else {
    console.log('not connected ignoring call')
  }
}

export function * waitUntilConnected () {
  while (true) {
    const isConnected = yield connected()
    // console.log('we are connected? ' + isConnected)
    if (isConnected) return
    yield call(delay, 10000)
  }
}

function * networkState () {
  yield monitorConnection()
}

export default networkState
