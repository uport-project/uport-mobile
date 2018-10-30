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
import { takeEvery, call, put, select, all } from 'redux-saga/effects'
import { saveError } from 'uPortMobile/lib/actions/processStatusActions'
import { networksByName } from 'uPortMobile/lib/utilities/networks'
import { waitUntilConnected } from '../networkState'

global.fetch = jest.fn(() => undefined)


import { relayTransaction } from '../sensui'

const RELAY_ENDPOINT = 'https://api.uport.me/sensui/relay'

describe('Relay transaction', () => {
  const txHash = '0xabcdtx'
  const metaSignedTx = '0x01012345'
  const fuelToken = 'FUELTOKEN'
  const nonce = '1'
  const settings = {
    fuelToken,
    network: 'rinkeby',
  }
  const request = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${fuelToken}`
    },
    body: JSON.stringify({ metaSignedTx, blockchain: 'rinkeby', metaNonce: nonce })
  }
  const web3 = {web3: true}
  const receipt = {receipt: true}
  const event = {
    identity: '0x00521965e7bd230323c423d96c657db5b79d099f'
  }
  it('successfull call', () => {
    const res = {
      status: 'success',
      data: txHash
    }
    const response = { json: () => res }
    return expectSaga(relayTransaction, metaSignedTx, settings, nonce)
      .provide([
        [call(waitUntilConnected)],
        [call(fetch, RELAY_ENDPOINT, request), response],
      ])
      .returns(txHash)
      .run()
  })

  describe('error handling', () => {
    it('403 error', () => {
      const res = {
        status: 'error',
        message: 'Meta signature invalid'
      }
      const response = { json: () => res }
      return expectSaga(relayTransaction, metaSignedTx, settings, nonce)
        .provide([
          [call(waitUntilConnected)],
          [call(fetch, RELAY_ENDPOINT, request), response],
        ])
        .put(saveError('tx', res.message))
        .returns(undefined)
        .run()
    })
  })
})
