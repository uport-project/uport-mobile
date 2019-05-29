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
import { throwError } from 'redux-saga-test-plan/providers'
import { call } from 'redux-saga/effects'

global.fetch = jest.fn(() => undefined)

import {
  saveMessage, startWorking, completeProcess, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import { waitUntilConnected } from '../networkState'
import UportContracts from 'uport-identity'
const TxRelay = UportContracts.TxRelay.v2

import {
  lookupAccount,
  LOOKUP_ENDPOINT
} from '../unnu'
const MNID = require('mnid')

describe('lookupAccount', () => {
  const deviceAddress = '0x0101device'
  const ENDPOINT = LOOKUP_ENDPOINT
  const managerType = 'MetaIdentityManager'
  const recoveredKeys = {
    deviceAddress
  }
  const request = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({deviceKey: deviceAddress})
  }
  const managerAddress = '0x0102manager'
  const address = '2ocuXMaz4pJPtzkbqeaAeJUvGRdVGm2MJth'
  const hexaddress = MNID.decode(address).address
  const identity = {
    ...recoveredKeys,
    address,
    network: 'rinkeby',
    identityManagerAddress: managerAddress,
    controllerAddress: managerAddress,
    signerType: 'MetaIdentityManager',
    hexaddress,
    txRelayAddress: TxRelay.networks[4].address
  }
  it('successfull call', () => {
    const res = {
      status: 'success',
      data: {
        identity: hexaddress,
        managerAddress,
        managerType,
        blockchain: 'rinkeby'
      }
    }
    const response = { json: () => res, status: 200 }
    return expectSaga(lookupAccount, recoveredKeys)
      .provide([
        [call(waitUntilConnected)],
        [call(fetch, ENDPOINT, request), response]
      ])
      .put(startWorking('unnu'))
      .put(saveMessage('unnu', 'Looking up identity'))
      .call(fetch, ENDPOINT, request)
      // Save the public profile
      .put(completeProcess('unnu'))
      .returns(identity)
      .run()
  })

  describe('error handling', () => {
    it('500 error', () => {
      const res = { data: 'There was an error' }
      const response = { json: () => res, status: 500 }
      return expectSaga(lookupAccount, recoveredKeys)
        .provide([
          [call(waitUntilConnected)],
          [call(fetch, ENDPOINT, request), response]
        ])
        .put(startWorking('unnu'))
        .put(saveMessage('unnu', 'Looking up identity'))
        .call(fetch, ENDPOINT, request)
        .put(failProcess('unnu', 'Server Error'))
        .returns(undefined)
        .run()
    })

    it('403 error', () => {
      const res = {
        status: 'fail',
        data: {authorization: 'Bearer missing'}
      }
      const response = { json: () => res, status: 403 }
      return expectSaga(lookupAccount, recoveredKeys)
        .provide([
          [call(waitUntilConnected)],
          [call(fetch, ENDPOINT, request), response]
        ])
        .put(startWorking('unnu'))
        .put(saveMessage('unnu', 'Looking up identity'))
        .call(fetch, ENDPOINT, request)
        .put(failProcess('unnu', 'Authentication Error'))
        .returns(undefined)
        .run()
    })

    it('non http error', () => {
      return expectSaga(lookupAccount, recoveredKeys)
        .provide([
          [call(waitUntilConnected)],
          [call(fetch, ENDPOINT, request), throwError(new Error('Bad Connection'))]
        ])
        .put(startWorking('unnu'))
        .put(saveMessage('unnu', 'Looking up identity'))
        .call(fetch, ENDPOINT, request)
        .put(failProcess('unnu', 'Error looking up identity'))
        .returns(undefined)
        .run()
    })
  })
})
