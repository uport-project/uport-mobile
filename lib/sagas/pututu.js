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
import { takeEvery, call, put, select, all } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { HANDLE_ENCRYPTED_MESSAGE, CHECK_FOR_NOTIFICATIONS, POLL_FOR_NOTIFICATIONS } from 'uPortMobile/lib/constants/SnsRegistrationActionTypes'
import { currentAddress, pututuToken } from 'uPortMobile/lib/selectors/identities'
import { handleURL, handleMessage } from 'uPortMobile/lib/actions/requestActions'
import { storePututuToken } from 'uPortMobile/lib/actions/uportActions'
import { waitUntilConnected } from './networkState'
import { offline } from 'uPortMobile/lib/selectors/processStatus'
import { ASYNC_ENC_ALGORITHM, decryptMessage, decryptLegacy } from 'uPortMobile/lib/sagas/encryption'
import { createPututuAuthToken, verifyToken } from 'uPortMobile/lib/sagas/jwt'
import { addRecoveryAddress } from '../actions/uportActions';

const PUTUTU_URL = 'https://api.uport.me/pututu'
const MESSAGE_ENDPOINT = PUTUTU_URL + '/message/'

export function * fetchAndHandleEncryptedMessage ({id}) {
  const fetched = yield call(fetchMessageData, id)
  if (fetched) {
    yield call(handleEncryptedMessage, fetched)
  } else {
    console.log(`message: ${id} was not found`)
  }
}

export function * handleEncryptedMessage ({id, message, recipient, sender}, popup) {
  console.log({id, message, recipient, sender}, popup)
  try {
    yield call(clearMessageData, id)
    const currAddr = yield select(currentAddress)
    let address
    if (recipient.match('^did:')) {
      if (currAddr.match('^did:')) {
        address = recipient
      } else {
        address = recipient.split(':')[2]
      }
    } else {
      address = recipient
    }
    const encrypted = JSON.parse(message)
    popup = popup !== undefined ? popup : AppState.currentState === 'active'
    if (encrypted.version === ASYNC_ENC_ALGORITHM) {
      const decrypted = yield call(decryptMessage, encrypted, address)
      if (decrypted) {
        const decryptedObject = JSON.parse(decrypted)
        yield put(handleMessage(decryptedObject.message, {popup}))
      } else {
        console.log('COULD NOT DECRYPT MESSAGE')
      }
    } else {
      const decrypted = yield call(decryptLegacy, encrypted, address)
      if (decrypted) {
        const message = JSON.parse(decrypted)
        yield put(handleURL(message.url, {postback: true, popup, clientId: sender}))
      } else {
        console.log('COULD NOT DECRYPT MESSAGE')
      }
    }
  } catch (error) {
    console.log(`error in handleEncryptedMessage()`)
    console.log(error)
  }
}

export function * checkAndHandleExistingMessages () {
  try {
    console.log('pututu poll')
    const off = yield select(offline)
    if (off) {
      // console.log('offline')
      return
    }
    if (!(yield select(currentAddress))) {
      return
    }

    // console.log('checkAndHandleExistingMessages()')
    const allMessages = yield call(fetchMessageData, '')
    if (allMessages) {
      for (const msg of allMessages) {
        console.log('pututu poll handleEncryptedMessage')
        yield call(handleEncryptedMessage, msg)
      }
    }
  } catch (e) {
    console.error(e)
    return false
  }
}

export function * pollForMessages () {
  while (true) {
    if (AppState.currentState === 'active') {
      yield call(checkAndHandleExistingMessages)
    }
    yield call(delay, 11000)
  }
}

export function * fetchMessageData (id) {
  const response = yield call(makeRequest, 'GET', MESSAGE_ENDPOINT + id)
  if (response.status === 200) {
    const responseJson = yield call(response.json.bind(response))
    return responseJson.data
  }
}

export function * clearMessageData (id) {
  yield call(makeRequest, 'DELETE', MESSAGE_ENDPOINT + id)
}

export function * makeRequest (method, url) {
  const address = yield select(currentAddress)
  yield call(waitUntilConnected)
  const token = yield call(getOrCreatePututuAuthToken, address)
  return yield call(fetch, url, {
    method,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
}

export function * getOrCreatePututuAuthToken (address) {
  let token = yield select(pututuToken, address)
  try {
    yield call(verifyToken, token)
  } catch (error) {
    token = yield call(createPututuAuthToken, address)
    yield put(storePututuToken(address, token))
  }
  return token
}

function * pututuSaga () {
  yield all([
    takeEvery(HANDLE_ENCRYPTED_MESSAGE, fetchAndHandleEncryptedMessage),
    takeEvery(CHECK_FOR_NOTIFICATIONS, checkAndHandleExistingMessages),
    takeEvery(POLL_FOR_NOTIFICATIONS, pollForMessages)
  ])
}

export default pututuSaga
