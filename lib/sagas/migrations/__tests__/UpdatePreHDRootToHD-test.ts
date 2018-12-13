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
import { select, call } from 'redux-saga/effects'
declare let global: { fetch: {} };
global['fetch'] = jest.fn(() => undefined)
import migrate, { fetchFuelToken } from '../UpdatePreHDRootToHD'

import {
  addressFor,
  encryptionPublicKey,
  DEFAULT_LEVEL
} from 'uPortMobile/lib/sagas/keychain'

import {
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  startWorking,
  saveMessage,
  failProcess,
  completeProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import {
  hdRootAddress
} from 'uPortMobile/lib/selectors/hdWallet'
import {
  currentAddress
} from 'uPortMobile/lib/selectors/identities'
import {
  fuelTokenForAddress,
  deviceAddress,
  networkSettings
} from 'uPortMobile/lib/selectors/chains'
import {
  updateIdentity
} from 'uPortMobile/lib/actions/uportActions'
import { connected, waitUntilConnected } from 'uPortMobile/lib/sagas/networkState'
import { createToken } from 'uPortMobile/lib/sagas/jwt'

const step = MigrationStep.UpdatePreHDRootToHD

export const FETCH_FUEL_TOKEN_ROUTE = 'https://api.uport.me/nisaba/newDeviceKey'

describe('UpdatePreHDRootToHD', () => {
  const address = '0xroot'
  const oldDevice = '0xolddevice'
  const hdRoot = '0xhdRoot'
  const kp = {
    address: hdRoot,
    publicKey: '0xPUBLICSIGNKEY'
  }
  const publicEncKey = '0xPUBLICENCKEY'
  const fuelToken = 'FUEL_TOKEN'
  const preMigration = {
    device: oldDevice
  }

  describe('migrate()', () => {
    describe('happy path', () => {
      it('should update data', () => {
        return expectSaga(migrate)
          .provide([
            [select(networkSettings), preMigration],
            [select(currentAddress), address],
            [select(deviceAddress), oldDevice],
            [select(hdRootAddress), hdRoot],
            [call(addressFor, 0, 0), kp],
            [call(encryptionPublicKey, {idIndex: 0, actIndex: 0}), publicEncKey],
            [call(fetchFuelToken, address, hdRoot), fuelToken]
          ])
          .put(updateIdentity(address, {deviceAddress: kp.address, publicKey: kp.publicKey, publicEncKey, hdindex: 0, securityLevel: DEFAULT_LEVEL, fuelToken, preMigration, nonce: 0 }))
          .put(saveMessage(step, 'Updated Internal Identity Record'))
          .returns(true)
          .run()
      })
    })

    describe('incorrect address returned', () => {
      it('should not update data', () => {
        const kp = {
          address: '0xbaddevicekey',
          publicKey: '0xPUBLICSIGNKEY'
        }
        return expectSaga(migrate)
          .provide([
            [select(currentAddress), address],
            [select(hdRootAddress), hdRoot],
            [select(deviceAddress), oldDevice],
            [call(addressFor, 0, 0), kp]
          ])
          .put(failProcess(step, 'Incorrect device address returned'))
          .returns(false)
          .run()
      })
    })

    describe('can not fetch fuel token', () => {
      it('should update data', () => {
        return expectSaga(migrate)
          .provide([
            [select(currentAddress), address],
            [select(hdRootAddress), hdRoot],
            [select(deviceAddress), oldDevice],
            [call(addressFor, 0, 0), kp],
            [call(encryptionPublicKey, {idIndex: 0, actIndex: 0}), publicEncKey],
            [call(fetchFuelToken, address, hdRoot), false]
          ])
          .put(failProcess(step, 'could not create new fuel token'))
          .returns(false)
          .run()
      })
    })
  })


  describe('fetchFuelToken()', () => {
    const parent = 'MYMNID01010101'
    const deviceAddress = '0xDEVICE_KEY'
    const oldFuelToken = 'OLD_FUEL_TOKEN'
    const newFuelToken = 'NEW_FUEL_TOKEN'
    const requestToken = 'REQUEST_TOKEN'
    const request = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${oldFuelToken}`
      },
      body: JSON.stringify({requestToken})}
     describe('successful call', () => {
      it('new token is released', () => {
        const res = { status: 'success', data: newFuelToken }
        const response = { json: () => res, status: 200 }
        return expectSaga(fetchFuelToken, parent, deviceAddress)
          .provide([
            [call(waitUntilConnected), undefined],
            [select(fuelTokenForAddress, parent), oldFuelToken],
            [call(createToken, parent, {newDeviceKey: deviceAddress}), requestToken],
            [call(fetch, FETCH_FUEL_TOKEN_ROUTE, request), response]
          ])
          .put(startWorking('fetchFuelToken'))
          .put(saveMessage('fetchFuelToken', 'Fetching new fuel token'))
          .call(fetch, FETCH_FUEL_TOKEN_ROUTE, request)
          .put(completeProcess('fetchFuelToken'))
          .returns(newFuelToken)
          .run()
      })
    })
     describe('error handling', () => {
      it('no fuel token', () => {
        return expectSaga(fetchFuelToken, parent, deviceAddress)
          .provide([
            [call(waitUntilConnected), undefined],
            [select(fuelTokenForAddress, parent), undefined]
          ])
          .put(startWorking('fetchFuelToken'))
          .put(saveMessage('fetchFuelToken', 'Fetching new fuel token'))
          .put(failProcess('fetchFuelToken', 'You do not have a valid fuel token'))
          .returns(false)
          .run()
      })
       it('500 error', () => {
        const res = { message: 'There was a validation error on this request' }
        const response = { json: () => res, status: 500 }
         return expectSaga(fetchFuelToken, parent, deviceAddress)
          .provide([
            [call(waitUntilConnected), undefined],
            [select(fuelTokenForAddress, parent), oldFuelToken],
            [call(createToken, parent, {newDeviceKey: deviceAddress}), requestToken],
            [call(fetch, FETCH_FUEL_TOKEN_ROUTE, request), response]
          ])
          .put(startWorking('fetchFuelToken'))
          .put(saveMessage('fetchFuelToken', 'Fetching new fuel token'))
          .call(fetch, FETCH_FUEL_TOKEN_ROUTE, request)
          .put(failProcess('fetchFuelToken', 'Unable to request fueltoken'))
          .returns(false)
          .run()
      })
       it('403 error', () => {
        const res = { message: 'There was a validation error on this request' }
        const response = { json: () => res, status: 403 }
        return expectSaga(fetchFuelToken, parent, deviceAddress)
          .provide([
            [call(waitUntilConnected), undefined],
            [select(fuelTokenForAddress, parent), oldFuelToken],
            [call(createToken, parent, {newDeviceKey: deviceAddress}), requestToken],
            [call(fetch, FETCH_FUEL_TOKEN_ROUTE, request), response]
          ])
          .put(startWorking('fetchFuelToken'))
          .put(saveMessage('fetchFuelToken', 'Fetching new fuel token'))
          .call(fetch, FETCH_FUEL_TOKEN_ROUTE, request)
          .put(failProcess('fetchFuelToken', 'Unable to request fueltoken'))
          .returns(false)
          .run()
      })
       it('non http error', () => {
        return expectSaga(fetchFuelToken, parent, deviceAddress)
          .provide([
            [call(waitUntilConnected), undefined],
            [select(fuelTokenForAddress, parent), oldFuelToken],
            [call(createToken, parent, {newDeviceKey: deviceAddress}), requestToken],
            [call(fetch, FETCH_FUEL_TOKEN_ROUTE, request), throwError(new Error('Bad Connection'))]
          ])
          .put(startWorking('fetchFuelToken'))
          .put(saveMessage('fetchFuelToken', 'Fetching new fuel token'))
          .call(fetch, FETCH_FUEL_TOKEN_ROUTE, request)
          .put(failProcess('fetchFuelToken', 'Can\'t connect to verification service'))
          .returns(false)
          .run()
      })
    })
   })
})

