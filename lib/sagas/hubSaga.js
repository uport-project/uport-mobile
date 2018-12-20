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
import { AppState } from 'react-native'
import { takeEvery, call, put, select, all, spawn } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { CATCHUP_HUB } from 'uPortMobile/lib/constants/HubActionTypes'
import { storeHubHead, catchupHub, queueEvent, takeQueuedEvent, importSnapshot, resetHub } from 'uPortMobile/lib/actions/hubActions'
import { START_SWITCHING_DATABACKUP } from 'uPortMobile/lib/constants/SettingsActionTypes'
import { setDataBackup } from 'uPortMobile/lib/actions/settingsActions'
import * as uportActions from 'uPortMobile/lib/actions/uportActions'
import * as hdwalletActions from 'uPortMobile/lib/actions/HDWalletActions'
import * as eventLogActions from 'uPortMobile/lib/actions/eventLogActions'
import * as settingsActions from 'uPortMobile/lib/actions/settingsActions'
import * as vcActions from 'uPortMobile/lib/actions/vcActions'

import {
  saveMessage, startWorking, completeProcess, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import { waitUntilConnected } from './networkState'
import { createToken, verifyToken } from 'uPortMobile/lib/sagas/jwt'
import { encryptEvent, decryptEvent } from 'uPortMobile/lib/sagas/encryption'
import { currentAddress, hasPublishedDID } from 'uPortMobile/lib/selectors/identities'
import {
  hubHead,
  nextEvent,
  hubCanQueue,
  snapshot
} from 'uPortMobile/lib/selectors/hubs'
import {
  migrationTargets
} from 'uPortMobile/lib/selectors/migrations'
import { dataBackup } from 'uPortMobile/lib/selectors/settings'

const POLL_FREQUENCY = 60000
const SERVER = 'https://api.uport.space/caleuche'
export const backupUrl = SERVER + '/v1/event'
export const restoreUrl = SERVER + '/v1/event'
export const deleteUrl = SERVER + '/event'

function backedUpEvents (actions) {
  if (typeof actions !== 'object') return []
  return Object.values(actions).map(action => action()).filter(event => event._backup).map(event => event.type)
}

export const EVENTS = backedUpEvents(uportActions).concat(
  backedUpEvents(hdwalletActions),
  backedUpEvents(eventLogActions),
  backedUpEvents(vcActions),
  backedUpEvents(settingsActions))

// Listen to events and queue them

export function * addToQueue (event) {
  if (event._hash) return
  const isBackupTurnedOn = yield select(dataBackup)
  if (!isBackupTurnedOn) return
  const canQueue = yield select(hubCanQueue)
  if (!canQueue) return
  // console.log(`addToQueue`, event.type)
  yield put(queueEvent(event))
  const next = yield select(nextEvent)
  if (event === next) {
    yield call(sendQueuedEvents)
  }
}
export function * sendEvent (event) {
  try {
    // console.log(`sendEvent`, event.type)
    yield put(startWorking('sync'))
    const address = yield select(currentAddress)
    yield call(waitUntilConnected)
    const previous = yield select(hubHead)
    const encrypted = yield call(encryptEvent, event, address)
    const token = yield call(createToken, address, {previous, event: encrypted}, 'Sign event')
    // console.log(token)
    const response = yield call(fetch, backupUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({event_token: token})
    })
    const responseJson = yield call(response.json.bind(response))
    // console.log('sync', response.status)
    // console.log(responseJson)
    if (response.status === 200) {
      yield put(storeHubHead(responseJson.data.id))
      yield put(takeQueuedEvent())
      yield put(completeProcess('sync'))
      return true
    } else {
      if (response.status === 409) {
        yield put(saveMessage('sync', 'Out of sync with identity hub'))
        yield call(performCatchup)
      } else {
        yield put(failProcess('sync', `problem syncing: ${response.status} - ${responseJson.message}`))
      }
      return false
    }
  } catch (error) {
    // console.log('sendEvent', error)
    yield put(queueEvent(event))
    yield put(failProcess('sync', error.message))
    return false
  }
}

export function * performCatchup () {
  // console.log('performCatchup')
  try {
    yield call(waitUntilConnected)
    yield put(startWorking('sync'))
    yield put(saveMessage('sync', 'Checking for changes on identity hub'))
    const previous = yield select(hubHead)
    const address = yield select(currentAddress)
    // console.log({previous, address})
    const token = yield call(createToken, address, {previous}, 'Sign event')
    // console.log(`token`, token)
    // console.log(restoreUrl, {
    //   method: 'GET',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   }
    // })
    const response = yield call(fetch, restoreUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    yield put(saveMessage('sync', 'Restoring your data from identity hub'))
    const responseJson = yield call(response.json.bind(response))
    // console.log('catchup', response.status)
    // console.log(responseJson)
    if (response.status === 200) {
      for (let item of responseJson.data.events) {
        const event = yield call(decryptEvent, item.event, address)
        const action = {...event, _hash: item.hash}
        // console.log(action)
        yield put(action)
        yield put(storeHubHead(item.hash))
      }
      yield put(completeProcess('sync'))
      if (responseJson.data.total > responseJson.data.events.length) {
        return yield call(performCatchup)
      } else {
        return yield call(sendQueuedEvents)
      }
    } else {
      yield put(failProcess('sync', `problem syncing: ${response.status} - ${responseJson.message}`))
      return false
    }
  } catch (error) {
    // console.log('performCatchup', error)
    yield put(failProcess('sync', error.message))
    return false
  }
}

export function * sendQueuedEvents () {
  const event = yield select(nextEvent)
  if (event) {
    const sent = yield call(sendEvent, event)
    if (sent) {
      return yield call(sendQueuedEvents)
    }
  }
  return true
}

// For a user who has an existing identity to automatically create a snapshot of the current uport state
export function * maybeSnapShot (force = false) {
  const isBackupTurnedOn = yield select(dataBackup)
  if (!force && !isBackupTurnedOn) return false
  const previous = yield select(hubHead)
  const event = yield select(nextEvent)
  const canQueue = yield select(hubCanQueue)
  if (!canQueue) return false

  if (previous) {
    yield spawn(pollForEvents)
    return false
  }
  if (!event && !previous) {
    // console.log('CREATE SNAPSHOT')
    const state = yield select(snapshot)
    yield call(sendEvent, importSnapshot(state))
    return true
  }
  // console.log('DO NOT CREATE SNAPSHOT')
  return false
}

export function * deleteData () {
  try {
    yield call(waitUntilConnected)
    yield put(startWorking('deleteBackup'))
    yield put(saveMessage('deleteBackup', 'Deleting data from identity hub'))
    yield call(delay, 2000)
    const address = yield select(currentAddress)
    const token = yield call(createToken, address, {}, 'Sign event')
    const response = yield call(fetch, deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    // console.log(response.status)
    const responseJson = yield call(response.json.bind(response))
    // console.log(responseJson)
    if (response.status === 200) {
      yield put(resetHub())
      yield put(completeProcess('deleteBackup'))
      return true
    } else {
      console.log(response)
      yield put(failProcess('deleteBackup', 'There was a problem deleting data'))
      return false
    }
  } catch (error) {
    yield put(failProcess('deleteBackup', error.message))
    return false
  }
}

export function * handleStartSwitchingSettingsChange (action) {
  let result
  if (action.isOn) {
    result = yield call(maybeSnapShot, true)
  } else {
    result = yield call(deleteData)
  }
  if (result) {
    yield put(setDataBackup(action.isOn))
  }
}

export function * pollForEvents () {
  while (true) {
    const isBackupTurnedOn = yield select(dataBackup)
    if (!isBackupTurnedOn) return true
    const migrations = yield select(migrationTargets)
    if (migrations.length > 0) return true
    const address = yield select(currentAddress)
    if (!address) return true
    if (AppState.currentState === 'active') {
      console.log('POLL FOR EVENTS')
      yield call(performCatchup)
    }
    yield call(delay, POLL_FREQUENCY)
  }
}

export function * testSigningCode () {
  yield call(delay, 3000)
  const TOTAL = 10000
  let failures = []
  const address = yield select(currentAddress)
  console.log('---------------------------------------------')
  console.log(`Running Signing Tests for ${address}`)
  try {
    for (let i = 0; i < TOTAL; i++) {
      const token = yield call(createToken, address, {n: i}, 'Sign event')
      try {
        yield call(verifyToken, token)
      } catch (error) {
        console.log(`${error.message} [${i}]`, token)
        failures.push([token, error.message])
      }
    }
  } catch (error) {
    console.log(error)
  }
  console.log('---------------------------------------------')
  console.log(`Failures: ${failures.length} out of ${TOTAL}`)
  console.log(`Invalid percentage: ${failures.length * 100 / TOTAL}`)
  console.log('---------------------------------------------')

  console.log(failures)
}

function * hubSaga () {
  yield all([
    // testSigningCode(), // UNCOMMENT this to test signing code
    takeEvery(EVENTS, addToQueue),
    takeEvery(CATCHUP_HUB, performCatchup),
    takeEvery(START_SWITCHING_DATABACKUP, handleStartSwitchingSettingsChange)
  ])
}

export default hubSaga
