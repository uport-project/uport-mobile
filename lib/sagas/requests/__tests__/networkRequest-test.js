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
jest.mock('../../jwt', () => {
  return {
    verifyToken: () => {}
  }
})

import { call, select } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { handle, networkRequest, authorize } from '../networkRequest.js'
import { verifyToken } from '../../jwt'
import { waitForUX } from 'uPortMobile/lib/utilities/performance'
import { refreshExternalUport, updateActivity, updateInteractionStats, storeSubAccount, removeIdentity } from 'uPortMobile/lib/actions/uportActions'
import { clearRequest } from 'uPortMobile/lib/actions/requestActions'
import { deviceAddressForAddress } from 'uPortMobile/lib/selectors/chains'

const tk = require('timekeeper')

const deviceAddress = '0x00521965e7bd230323c423d96c657db5b79d099f'
const address = '5vZ6nCrJqwhb9nizRBxuPSddrzCBY3mXbu78KMa'
const networkId = '0xdeadbeef'
const clientId = '0x012'
const tmpAddress = `temp-${networkId}-${clientId}-${deviceAddress}`
const request = {
  target: '0x011',
  clientId,
  subIdentity: {
    address,
    deviceAddress,
    controllerAddress: '0x014',
    rpcUrl: 'https://gw.infura.io',
    faucetUrl: 'https://sensui.infura.io/fuel',
    relayUrl: 'https://sensui.infura.io/relay',
    registry: '0x015',
    network: networkId,
    fuelToken: 'FUELTOKEN',
    parent: '0x011',
    createdAt: 1492997057053,
    updatedAt: 1492997057053
  }
}
const payload = {
  aud: '0x011',
  iss: '0x012',
  dad: deviceAddress,
  sub: address,
  ctl: '0x014',
  gw: 'https://gw.infura.io',
  fct: 'https://sensui.infura.io/fuel',
  rel: 'https://sensui.infura.io/relay',
  reg: '0x015',
  acc: 'FUELTOKEN'
}

describe('#handle()', () => {
  describe('previously created device address', () => {
    it('sets up correct request', () => {
      tk.freeze(new Date(1492997057053))
      return expectSaga(handle, payload)
        .provide([
          [select(deviceAddressForAddress, tmpAddress), {address: tmpAddress}]
        ])
        .put(refreshExternalUport('0x012'))
        .returns(request)
        .run().then(() => tk.reset())
    })
  })

  describe('no previously created device address', () => {
    it('sets up correct request', () => {
      tk.freeze(new Date(1492997057053))
      return expectSaga(networkRequest, payload)
        .provide([
          [call(waitForUX), undefined],
          [select(deviceAddressForAddress, tmpAddress), null]
        ])
        .returns(undefined)
        .run().then(() => tk.reset())
    })  
  })
})

describe('#networkRequest()', () => {
  describe('previously created device address', () => {
    it('sets up correct request', () => {
      tk.freeze(new Date(1492997057053))
      return expectSaga(networkRequest, {id: 123}, {pathname: 'net/JWT'})
        .provide([
          [select(deviceAddressForAddress, tmpAddress), {address: tmpAddress}],
          [matchers.call.fn(verifyToken), {payload}]
        ])
        .put(updateActivity(123, {...request, id: 123}))
        .put(refreshExternalUport('0x012'))
        .returns({...request, id: 123})
        .run().then(() => tk.reset())
    })
  })

  describe('no previously created device address', () => {
    it('sets up correct request', () => {
      tk.freeze(new Date(1492997057053))
      return expectSaga(networkRequest, {id: 123}, {pathname: 'net/JWT'})
        .provide([
          [select(deviceAddressForAddress, tmpAddress), null],
          [matchers.call.fn(verifyToken), {payload}]
        ])
        .put(updateActivity(123, {error: 'Private chain needs to register a device key first'}))
        .returns(undefined)
        .run().then(() => tk.reset())
    })  
  })

  it('handles invalid jwt', () => {
    return expectSaga(networkRequest, {id: 123}, {pathname: 'net/JWT'})
      .provide([
        [matchers.call.fn(verifyToken), throwError(
          new Error('Could not verify the signature of request')
        )]
      ])
      .put(updateActivity(123, {error: 'Could not verify the signature of request'}))
      .returns(undefined)
      .run()
  })

  it('handles missing jwt', () => {
    return expectSaga(networkRequest, {id: 123}, {pathname: 'net'})
      .put(updateActivity(123, {error: 'Missing network provisioning payload'}))
      .returns(undefined)
      .run()
  })
})

describe('#authorize()', () => {
  it('adds subIdentity', () => {
    tk.freeze(new Date(1492997057053))
    return expectSaga(authorize, request)
      .put(storeSubAccount(request.subIdentity))
      .not.put(removeIdentity(tmpAddress))
      .put(updateInteractionStats(request.target, request.to, 'network'))
      .put(updateActivity(123, {authorizedAt: 1492997057053}))
      .put(clearRequest())
      .returns({ status: 'ok' })
      .run().then(() => tk.reset(), () => tk.reset())
  })
})
