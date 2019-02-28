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
import { select, call } from 'redux-saga/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import nock from 'nock'
import { waitUntilConnected } from '../networkState'
import { publicEncKey, currentAddress, pututuToken } from 'uPortMobile/lib/selectors/identities'
import { handleURL, handleMessage } from 'uPortMobile/lib/actions/requestActions'
import { updateBadgeCount } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { storePututuToken } from 'uPortMobile/lib/actions/uportActions'
import { offline } from 'uPortMobile/lib/selectors/processStatus'

import pututuSaga, {
  fetchAndHandleEncryptedMessage, makeRequest, clearMessageData,
  handleEncryptedMessage, fetchMessageData, getOrCreatePututuAuthToken, pollForMessages,
  checkAndHandleExistingMessages} from '../pututu'
import { decryptMessage, decryptLegacy } from 'uPortMobile/lib/sagas/encryption'
import { createPututuAuthToken, verifyToken } from 'uPortMobile/lib/sagas/jwt'

const PUTUTU_URL = 'https://api.uport.me/pututu'
const API_PATH = '/message/'
const MESSAGE_ENDPOINT = PUTUTU_URL + API_PATH

const testData = [
  {
    'id': '01953f926d122906eef73bf71a206137d2f7d7896c35f12cc0f9c291e70b5ce3',
    'sender': '2oeXufHGDpU51bfKBsZDdu7Je9weJ3r7sVG',
    'recipient': '2ooGueTmPCkNBtzUYZSimzPRLNpqHWhCtj3',
    'message': '{"ciphertext": "xdP3d9e9sQhTB4FP/Omf3N68GRSb5u/vHlkhFUTcj+58UjQ6aBJc/DLjG3ArNS/UPpO+XnKB/Dc8tXram6Xc6OD5Qpnyfn/txoqPudc0XkM=", "ephemPublicKey": "oGZhZ0cvwgLKslgiPEQpBkRoE+CbWEdi738efvQBsH0=", "nonce": "/20Dn2PowBiZu5kw42pO7F/wiKvkecM3", "version": "x25519-xsalsa20-poly1305"}',
    'created': '2017-09-21T08:10:54.322Z'
  },
  {
    'id': '555ecb3f84c97014076d94c2d137078795fb8744d9dab902bab7a253ba10a847',
    'sender': '2oeXufHGDpU51bfKBsZDdu7Je9weJ3r7sVG',
    'recipient': '2ooGueTmPCkNBtzUYZSimzPRLNpqHWhCtj3',
    'message': '{"from":"FVYw0qlV3w5otw9js/mgmWMLBnOUDlR1AcHwlj97DAg=","nonce":"1xdoW0pUuXKgEwNcFupagSd9d/QRtLUJ","ciphertext":"On0Wif6o7FV58tD10oTlidnt6omcg8IJRvdXU67x20P6Ul79VSV9bDEDEJlJESmo6UkAIP97NIZbC5JNR6srWf0cJUY5TiTF6D8hl5sFNEMw8LDiMyXK0qKp5MC3ZiEh0TN0A3fs42EiRIHnAnO+hrwbhO89ImfQrxqShd4KzV7pfjNKBqfXR8VYuVygQBp+aPd9nos1jAJsn9MS+IanL1OxQCvhIXSsLFEAPoXMt+UQ6OtF27XO5erWY7gStj/Q1g+s+Z+rZbYvii/hztdJZb5Nl/+pvoFq"}',
    'created': '2017-09-21T08:11:22.038Z'
  }
]

describe('fetchAndHandleEncryptedMessage', () => {
  it('fetches message from server and passes it along for processing', () => {
    return expectSaga(fetchAndHandleEncryptedMessage, {id: testData[0].id})
      .provide([
        [matchers.call.fn(fetchMessageData, testData[0].id), testData[0]],
        [call(handleEncryptedMessage, testData[0]), undefined]
      ])
      .call(handleEncryptedMessage, testData[0])
      .run()
  })

  it('attempts to fetches message from server and doesn\'t do anything if not found', () => {
    return expectSaga(fetchAndHandleEncryptedMessage, {id: testData[0].id})
      .provide([
        [matchers.call.fn(fetchMessageData, testData[0].id), undefined],
      ])
      .run()
  })
})

describe('handleEncryptedMessage', () => {
  const JWT = JSON.stringify({message: 'JWT'})
  it('decrypts message, handles URL and clears it from server', () => {
    return expectSaga(handleEncryptedMessage, testData[0])
      .provide([
        [select(currentAddress), testData[0].recipient],
        [call(decryptMessage, JSON.parse(testData[0].message), testData[0].recipient), JWT],
        [call(clearMessageData, testData[0].id)]
      ])
      .put(handleMessage('JWT', {popup: false}))
      .call(clearMessageData, testData[0].id)
      .run()
  })

  it('decrypts message, handles URL with popup and clears it from server', () => {
    return expectSaga(handleEncryptedMessage, testData[0], true)
      .provide([
        [select(currentAddress), testData[0].recipient],
        [call(decryptMessage, JSON.parse(testData[0].message), testData[0].recipient), JWT],
        [call(clearMessageData, testData[0].id)]
      ])
      .put(handleMessage('JWT', {popup: true}))
      .call(clearMessageData, testData[0].id)
      .run()
  })

  describe('legacy message', () => {
    it('decrypts message, handles URL and clears it from server', () => {
      const url = 'me.uport:me'
      return expectSaga(handleEncryptedMessage, testData[1])
        .provide([
          [select(currentAddress), testData[0].recipient],
          [call(decryptLegacy, JSON.parse(testData[1].message), testData[1].recipient), `{"url":"${url}"}`],
          [call(clearMessageData, testData[1].id)]
        ])
        .put(handleURL(url, {postback: true, popup: false, clientId: testData[1].sender}))
        .call(clearMessageData, testData[1].id)
        .run()
    })
  
    it('decrypts message, handles URL with popup and clears it from server', () => {
      const url = 'me.uport:me'
      return expectSaga(handleEncryptedMessage, testData[1], true)
        .provide([
          [select(currentAddress), testData[0].recipient],
          [call(decryptLegacy, JSON.parse(testData[1].message), testData[1].recipient), `{"url":"${url}"}`],
          [call(clearMessageData, testData[1].id)]
        ])
        .put(handleURL(url, {postback: true, popup: true, clientId: testData[1].sender}))
        .call(clearMessageData, testData[1].id)
        .run()
    })  
  })
})

describe('checkAndHandleExistingMessages', () => {
  it('fetches messages and handles them', () => {
    return expectSaga(checkAndHandleExistingMessages)
      .provide([
        [select(offline), false],
        [select(currentAddress), '0x'],
        [matchers.call.fn(fetchMessageData), testData],
        [matchers.call.fn(handleEncryptedMessage), undefined]
      ])
      .call(fetchMessageData, '')
      .call(handleEncryptedMessage, testData[0], false)
      .call(handleEncryptedMessage, testData[1], false)
      .run()
  })

  it('does not fetch if offline', () => {
    return expectSaga(checkAndHandleExistingMessages)
      .provide([
        [select(offline), true]
      ])
      .not.call(fetchMessageData, '')
      .run()
  })

  it('does not fetch without an address', () => {
    return expectSaga(checkAndHandleExistingMessages)
      .provide([
        [select(currentAddress), undefined],
        [select(offline), false]
      ])
      .not.call(fetchMessageData, '')
      .run()
  })

})

describe('fetchMessageData', () => {
  it('makes a request and interprets response', () => {
    const res = { status: "success", data: testData[0] }
    const response = { json: () => res, status: 200 }
    const id = testData[0].id
    return expectSaga(fetchMessageData, id)
      .provide([
        [matchers.call.fn(makeRequest), response]
      ])
      .call(makeRequest, 'GET', MESSAGE_ENDPOINT + id)
      .returns(res.data)
      .run()
  })

  it('makes a request and can`t find message', () => {
    const res = { status: 'fail', data: 'Message not found' }
    const response = { json: () => res, status: 404 }
    const id = testData[0].id
    return expectSaga(fetchMessageData, id)
      .provide([
        [matchers.call.fn(makeRequest), response]
      ])
      .call(makeRequest, 'GET', MESSAGE_ENDPOINT + id)
      .returns(undefined)
      .run()
  })

})

describe('clearMessageData', () => {
  it('makes a request to clear data from pututu', () => {
    const id = testData[0].id
    return expectSaga(clearMessageData, id)
      .provide([
        [matchers.call.fn(makeRequest), undefined]
      ])
      .call(makeRequest, 'DELETE', MESSAGE_ENDPOINT + id)
      .run()
  })
})

describe('makeRequest', () => {
  it('gets a pututu token and makes a request to pututu', () => {
    const token = 'myPututuToken'
    const method = 'GET'
    const url = 'me.uport:me'
    const requestData = {
      method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    fetch = jest.fn(() => undefined)
    return expectSaga(makeRequest, method, url)
      .provide([
        [select(currentAddress), '0x1234'],
        [call(waitUntilConnected)],
        [matchers.call.fn(getOrCreatePututuAuthToken), token]
      ])
      .call(fetch, url, requestData)
      .run()
  })
})

describe('getOrCreatePututuAuthToken', () => {
  const storedToken = 'storedToken'
  const newToken = 'newToken'
  const address = '0x1234'
  it('selects stored token and returns it', () => {
    return expectSaga(getOrCreatePututuAuthToken, address)
      .provide([
        [select(pututuToken, address), storedToken],
        [matchers.call.fn(verifyToken), undefined]
      ])
      .returns(storedToken)
      .run()
  })

  it('creates a new token when the stored one is invalid', () => {
    const error = new Error('expired JWT token')
    return expectSaga(getOrCreatePututuAuthToken, address)
      .provide([
        [select(pututuToken, address), storedToken],
        [matchers.call.fn(verifyToken), throwError(error)],
        [matchers.call.fn(createPututuAuthToken, address), newToken]
      ])
      .put(storePututuToken(address, newToken))
      .returns(newToken)
      .run()
  })
})
