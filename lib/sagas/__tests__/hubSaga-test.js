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
import { takeEvery, call, put, select, all, spawn } from 'redux-saga/effects'
import { CATCHUP_HUB } from 'uPortMobile/lib/constants/HubActionTypes'
import { storeHubHead, catchupHub, queueEvent, takeQueuedEvent, importSnapshot } from 'uPortMobile/lib/actions/hubActions'
import {
  saveMessage, startWorking, completeProcess, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import { createToken, createTokenWithRoot } from 'uPortMobile/lib/sagas/jwt'
import { encryptEvent, decryptEvent } from 'uPortMobile/lib/sagas/encryption'
import { currentAddress, hasPublishedDID } from 'uPortMobile/lib/selectors/identities'
import { connected, waitUntilConnected } from '../networkState'
import {
  hubHead,
  nextEvent,
  hubCanQueue,
  snapshot
} from 'uPortMobile/lib/selectors/hubs'
import { dataBackup } from 'uPortMobile/lib/selectors/settings'

jest.mock('../jwt', () => {
  return {
    createToken: () => Promise.resolve(),
    createTokenWithRoot: () => Promise.resolve()
  }
})
global.fetch = jest.fn(() => undefined)

import hubSaga, { addToQueue, sendEvent, performCatchup, sendQueuedEvents, backupUrl, restoreUrl, maybeSnapShot, pollForEvents, checkForBackup } from '../hubSaga'
import { decryptMessage } from '../encryption'
import { STORE_IDENTITY } from '../../constants/UportActionTypes';

const networkAddress = '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
const address = `did:ethr:${networkAddress}`

const event = {
  type: 'ADD_OWN_CLAIMS',
  address,
  claims: {
    name: 'Bob'
  }
}
const encrypted = 'nF85Zi/TFkQYqiAPcTxOBoHmkkT3x6z5acAnmWAH9Ye1y9+4s+sBSyin5LS3uwKqTcIv0I86rvAWJfvYLZtICvZmUQiVz82lXohxgezoaJi8k2dqZ6cwF2ThOBrQlkWW4EsH0xtjRw==.O1dv2W1OY9LBMmZQ04kWqjGXKTUd9Rsc'
const previous = 'previous-hash'
const next = 'next-hash'

describe('addToQueue()', () => {
  describe('event types to be backed up', () => {
    describe('no one else in queue', () => {
      it('queues it up', () => {
        return expectSaga(hubSaga)
          .provide([
            [select(hubCanQueue), true],
            [select(dataBackup), true],
            [select(nextEvent), event],
            [call(sendQueuedEvents)]])
          .put(queueEvent(event))
          .call(sendQueuedEvents)
          .dispatch(event)
          .silentRun()
      })
    })

    describe('queue in process', () => {
      it('queues it up', () => {
        return expectSaga(hubSaga)
          .provide([
            [select(hubCanQueue), true],
            [select(dataBackup), true],
            [select(nextEvent), {type: 'OTHER'}]])
          .put(queueEvent(event))
          .not.call(sendQueuedEvents)
          .dispatch(event)
          .silentRun()
      })  
    })

    describe('restored event', () => {
      it('should not be queued', () => {
        return expectSaga(hubSaga)
          .not.put(queueEvent(event))
          .dispatch({ ...event, _hash: true })
          .silentRun()
      })
    })

    it('ignore events if backup is not allowed', () => {
      return expectSaga(hubSaga)
        .provide([
          [select(dataBackup), false]
        ])
        .not.put(queueEvent(event))
        .dispatch(event)
        .silentRun()
    })

    it('ignore events if we are not allowed to queue yet (eg during recovery)', () => {
      return expectSaga(hubSaga)
        .provide([
          [select(dataBackup), true],
          [select(hubCanQueue), false]
        ])
        .not.put(queueEvent(event))
        .dispatch(event)
        .silentRun()
    })
  })
})

describe('sendEvent', () => {
  const eventToken = 'JWT-PUSH'
  const request = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({event_token: eventToken})
  }

  describe('new hub state', () => {
    it('call server successfully, remove from queue  and update head', () => {
      const res = { status: 'success', data: {id: next} }
      const response = { json: () => res, status: 200 }
      return expectSaga(sendEvent, event)
        .provide([
          [call(waitUntilConnected), undefined],
          [select(currentAddress), address],
          [select(hasPublishedDID, address), true],
          [select(hubHead), undefined],
          [call(encryptEvent, event, address), encrypted],
          [call(createToken, address, {previous: undefined, event: encrypted}, 'Sign event'), eventToken],
          [call(fetch, backupUrl, request), response]
        ])
        .dispatch(event)
        .put(storeHubHead(next))
        .put(takeQueuedEvent())
        .call(fetch, backupUrl, request)
        .returns(true)
        .silentRun()
    })
  })

  describe('existing hub state', () => {
    it('call server successfully with event, remove from queue and update head', () => {
      const res = { status: 'success', data: {id: next} }
      const response = { json: () => res, status: 200 }
      return expectSaga(sendEvent, event, true)
        .provide([
          [call(waitUntilConnected), undefined],
          [select(hasPublishedDID, address), true],
          [select(currentAddress), address],
          [select(hubHead), previous],
          [call(encryptEvent, event, address), encrypted],
          [call(createToken, address, {previous, event: encrypted}, 'Sign event'), eventToken],
          [call(fetch, backupUrl, request), response]
        ])
        .call(fetch, backupUrl, request)
        .put(storeHubHead(next))
        .put(takeQueuedEvent())
        .returns(true)
        .run()
    })
  })

  it('Call server and not up to date', () => {
    const res = { status: 'error' }
    const response = { json: () => res, status: 409 }
    return expectSaga(sendEvent, event)
      .provide([
        [call(waitUntilConnected), undefined],
        [select(hasPublishedDID, address), true],
        [select(currentAddress), address],
        [select(hubHead), previous],
        [call(encryptEvent, event, address), encrypted],
        [call(createToken, address, {previous, event: encrypted}, 'Sign event'), eventToken],
        [call(fetch, backupUrl, request), response],
        [call(performCatchup), undefined]
      ])
      .call(fetch, backupUrl, request)
      .call(performCatchup)
      .returns(false)
      .run()
  })

  it('http error', () => {
    const res = { message: 'internal error' }
    const response = { json: () => res, status: 500 }
    return expectSaga(sendEvent, event)
      .provide([
        [call(waitUntilConnected), undefined],
        [select(hasPublishedDID, address), true],
        [select(currentAddress), address],
        [select(hubHead), previous],
        [call(encryptEvent, event, address), encrypted],
        [call(createToken, address, {previous, event: encrypted}, 'Sign event'), eventToken],
        [call(fetch, backupUrl, request), response]
      ])
      .call(fetch, backupUrl, request)
      .put(failProcess('sync', 'problem syncing: 500 - internal error'))
      .returns(false)
      .run()
  })

  it('non http error', () => {
    return expectSaga(sendEvent, event)
      .provide([
        [call(waitUntilConnected), undefined],
        [select(hasPublishedDID, address), true],
        [select(currentAddress), address],
        [select(hubHead), previous],
        [call(encryptEvent, event, address), encrypted],
        [call(createToken, address, {previous, event: encrypted}, 'Sign event'), eventToken],
        [call(fetch, backupUrl, request), throwError(new Error('Bad Connection'))]
      ])
      .call(fetch, backupUrl, request)
      .put(failProcess('sync', 'Bad Connection'))
      .returns(false)
      .run()
  })
})

describe('performCatchup', () => {
  const bearerToken = 'JWT-PUSH'
  const request = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    }
  }

  it('call server successfully and update head', () => {
    const res = { status: 'success', data: { events: [{event: encrypted, hash: next}], total: 1 } }
    const response = { json: () => res, status: 200 }
    return expectSaga(performCatchup)
      .provide([
        [call(waitUntilConnected), undefined],
        [select(currentAddress), address],
        [select(hubHead), previous],
        [call(createToken, address, {previous}, 'Sign event'), bearerToken],
        [call(fetch, restoreUrl, request), response],
        [call(decryptEvent, encrypted, address), event],
        [call(sendQueuedEvents), true]
      ])
      .put({...event, _hash: next})
      .put(storeHubHead(next))
      .call(fetch, restoreUrl, request)
      .not.call(performCatchup)
      .call(sendQueuedEvents)
      .returns(true)
      .run()
  })

  it('call server successfully and handles pagination', () => {
    const res = {status: 'success', data: { events: [{event: encrypted, hash: next}], total: 2 }}
    const response = { json: () => res, status: 200 }
    return expectSaga(performCatchup)
      .provide([
        [call(waitUntilConnected), undefined],
        [select(currentAddress), address],
        [select(hubHead), previous],
        [call(createToken, address, {previous}, 'Sign event'), bearerToken],
        [call(fetch, restoreUrl, request), response],
        [call(decryptEvent, encrypted, address), event],
        [call(performCatchup), true]
      ])
      .put({...event, _hash: next})
      .put(storeHubHead(next))
      .call(fetch, restoreUrl, request)
      .call(performCatchup)
      .not.call(sendQueuedEvents)
      .returns(true)
      .run()
  })

  it('http error', () => {
    const res = { message: 'internal error' }
    const response = { json: () => res, status: 500 }
    return expectSaga(performCatchup)
      .provide([
        [call(waitUntilConnected), undefined],
        [select(currentAddress), address],
        [select(hubHead), previous],
        [call(createToken, address, {previous}, 'Sign event'), bearerToken],
        [call(fetch, restoreUrl, request), response]
      ])
      .call(fetch, restoreUrl, request)
      .put(failProcess('sync', 'problem syncing: 500 - internal error'))
      .returns(false)
      .run()
  })

  it('non http error', () => {
    return expectSaga(performCatchup)
      .provide([
        [call(waitUntilConnected), undefined],
        [select(currentAddress), address],
        [select(hubHead), previous],
        [call(createToken, address, {previous}, 'Sign event'), bearerToken],
        [call(fetch, restoreUrl, request), throwError(new Error('Bad Connection'))]
      ])
      .call(fetch, restoreUrl, request)
      .put(failProcess('sync', 'Bad Connection'))
      .returns(false)
      .run()
  })
})

describe('checkForBackup', () => {
  const bearerToken = 'JWT-PUSH'
  const request = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`
    }
  }

  it('call server successfully', () => {
    const res = {
      status: 'success',
      data: { events: [{ event: encrypted, hash: next }], total: 1 }
    }
    const response = { json: () => res, status: 200 }
    return expectSaga(checkForBackup, networkAddress)
      .provide([
        [call(waitUntilConnected), undefined],
        [call(createTokenWithRoot, networkAddress, { previous: null }, 'Sign event'), bearerToken],
        [call(fetch, restoreUrl, request), response]
      ])
      .call(fetch, restoreUrl, request)
      .returns(true)
      .run()
  })

  it('http error', () => {
    const res = { message: 'internal error' }
    const response = { json: () => res, status: 500 }
    return expectSaga(checkForBackup, networkAddress)
      .provide([
        [call(waitUntilConnected), undefined],
        [call(createTokenWithRoot, networkAddress, { previous: null }, 'Sign event'), bearerToken],
        [call(fetch, restoreUrl, request), response]
      ])
      .call(fetch, restoreUrl, request)
      .returns(false)
      .run()
  })

  it('non http error', () => {
    return expectSaga(checkForBackup, networkAddress)
      .provide([
        [call(waitUntilConnected), undefined],
        [call(createTokenWithRoot, networkAddress, { previous: null }, 'Sign event'), bearerToken],
        [
          call(fetch, restoreUrl, request),
          throwError(new Error('Bad Connection'))
        ]
      ])
      .call(fetch, restoreUrl, request)
      .put(failProcess('sync', 'Bad Connection'))
      .returns(false)
      .run()
  })
})

describe('sendQueuedEvents', () => {
  it('send event if available', () => {
    return expectSaga(sendQueuedEvents)
      .provide([
        [select(nextEvent), event],
        [call(sendEvent, event), true],
        [call(sendQueuedEvents), true]
      ])
      .call(sendEvent, event)
      .call(sendQueuedEvents)
      .returns(true)
      .run()
  })

  it('dont send event if none exist', () => {
    return expectSaga(sendQueuedEvents)
      .provide([
        [select(nextEvent), undefined]
      ])
      .not.call(sendEvent, event)
      .not.call(sendQueuedEvents)
      .returns(true)
      .run()
  })
})

describe('maybeSnapShot', () => {
  const uportSnapshot = {byAddress: {}}
  const snapshotEvent = importSnapshot(uportSnapshot)

  describe('no hubHead', () => {
    const head = undefined

    it('create snapshot if we are allowed to queue', () => {
      return expectSaga(maybeSnapShot)
        .provide([
          [select(dataBackup), true],
          [select(hubCanQueue), true],
          [select(hubHead), head],
          [select(nextEvent), undefined],
          [select(snapshot), uportSnapshot]
        ])
        .call(sendEvent, snapshotEvent)
        .returns(true)
        .run()
    })

    it('does not create snapshot if backup is turned off', () => {
      return expectSaga(maybeSnapShot)
        .provide([
          [select(dataBackup), false],
          [select(hubCanQueue), false],
          [select(nextEvent), undefined],
          [select(hubHead), head]
        ])
        .not.call(sendEvent, snapshotEvent)
        .returns(false)
        .run()
    })

    it('does not create snapshot if we are not allowed to queue yet', () => {
      return expectSaga(maybeSnapShot)
        .provide([
          [select(dataBackup), true],
          [select(hubCanQueue), false],
          [select(nextEvent), undefined],
          [select(hubHead), head]
        ])
        .not.call(sendEvent, snapshotEvent)
        .returns(false)
        .run()
    })
  })

  it('does not create snapshot if we have already have events queued', () => {
    return expectSaga(maybeSnapShot)
      .provide([
        [select(dataBackup), true],
        [select(hubCanQueue), true],
        [select(nextEvent), event],
        [select(hubHead), undefined]
      ])
      .not.call(sendEvent, snapshotEvent)
      .returns(false)
      .run()
  })

  describe('existing hubHead', () => {
    const head = previous
    it('polls for events', () => {
      return expectSaga(maybeSnapShot)
        .provide([
          [select(dataBackup), true],
          [select(hubCanQueue), true],
          [select(nextEvent), undefined],
          [select(hubHead), head],
          [spawn(pollForEvents), undefined]
        ])
        .spawn(pollForEvents)
        .not.call(sendEvent, snapshotEvent)
        .returns(false)
        .run()
    })
  })
})
