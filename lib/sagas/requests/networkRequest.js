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

import { call, put, select, fork } from 'redux-saga/effects'
import { clearRequest } from 'uPortMobile/lib/actions/requestActions'
import { refreshExternalUport, updateActivity, updateInteractionStats, storeSubAccount } from 'uPortMobile/lib/actions/uportActions'
import { verifyToken } from '../jwt'
import { waitForUX } from 'uPortMobile/lib/utilities/performance'
import { decodeAddress, networks } from 'uPortMobile/lib/utilities/networks'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { removeIdentity } from '../../actions/uportActions'
import { deviceAddressForAddress } from 'uPortMobile/lib/selectors/chains'
import { addMultipleVc } from '../vcSaga'

export function * handle (payload) {
  const request = {}
  request.target = payload.aud
  request.clientId = payload.iss
  const decoded = decodeAddress(payload.sub)
  const network = decoded.network
  const ts = new Date().getTime()
  // const all = yield select(allAddresses)
  // console.log(all)
  // console.log(`temp-${decoded.network}-${payload.iss}-${payload.dad}`)
  // const act = yield select(selectedIdentityJs, `temp-${network}-${payload.iss}-${payload.dad}`)
  // console.log(act)
  const preregistered = yield select(deviceAddressForAddress, `temp-${network}-${payload.iss}-${payload.dad}`)
  if (!preregistered) throw new Error('Private chain needs to register a device key first')
  // console.log(decoded)
  // console.log(`network:  ${decoded.network} : '${networks[decoded.network]}' - ${networks[decoded.network] ? networks[decoded.network].name : decoded.network}`)
  request.subIdentity = {
    address: payload.sub,
    deviceAddress: payload.dad,
    controllerAddress: payload.ctl,
    rpcUrl: payload.gw,
    registry: payload.reg,
    faucetUrl: payload.fct,
    relayUrl: payload.rel,
    fuelToken: payload.acc,
    network: networks[decoded.network] ? networks[decoded.network].name : decoded.network,
    parent: payload.aud,
    createdAt: ts,
    updatedAt: ts
  }
  
  if (payload.vc) {
    yield(fork(addMultipleVc, payload.vc))
  }

  // console.log(request)
  yield put(track('networkRequest', request))
  yield put(refreshExternalUport(request.clientId))
  return request
}

export function * networkRequest (request, parsed) {
  try {
    // console.log(parsed)
    const jwt = parsed.pathname.split('/')[1]
    // if (Object.keys(parsed.query).length === 0) return
    // const jwt = Object.keys(parsed.query)[0]
    // console.log(jwt)
    if (!jwt) throw new Error('Missing network provisioning payload')
    const { payload } = yield call(verifyToken, jwt)
    request.target = payload.aud
    request.clientId = payload.iss
    const decoded = decodeAddress(payload.sub)
    const network = decoded.network
    const ts = new Date().getTime()
    // const all = yield select(allAddresses)
    // console.log(all)
    // console.log(`temp-${decoded.network}-${payload.iss}-${payload.dad}`)
    // const act = yield select(selectedIdentityJs, `temp-${network}-${payload.iss}-${payload.dad}`)
    // console.log(act)
    const preregistered = yield select(deviceAddressForAddress, `temp-${network}-${payload.iss}-${payload.dad}`)
    if (!preregistered) throw new Error('Private chain needs to register a device key first')
    // console.log(decoded)
    // console.log(`network:  ${decoded.network} : '${networks[decoded.network]}' - ${networks[decoded.network] ? networks[decoded.network].name : decoded.network}`)
    request.subIdentity = {
      address: payload.sub,
      deviceAddress: payload.dad,
      controllerAddress: payload.ctl,
      rpcUrl: payload.gw,
      registry: payload.reg,
      faucetUrl: payload.fct,
      relayUrl: payload.rel,
      fuelToken: payload.acc,
      network: networks[decoded.network] ? networks[decoded.network].name : decoded.network,
      parent: payload.aud,
      createdAt: ts,
      updatedAt: ts
    }
    // console.log(request)
    yield put(updateActivity(request.id, request))
    yield put(track('networkRequest', request))
    yield call(waitForUX)
    yield put(refreshExternalUport(request.clientId))
    return request

  } catch (error) {
    // console.log(error)
    yield put(updateActivity(request.id, {error: error.message}))
    yield put(track('networkRequest Error', {error: error.message}))
  }
}

export function * authorize (request) {
  // TODO Check existence of identity and merge if it is there. UX should warn against it
  // console.log('addNetworkIdentity')
  // console.log(request)
  let props = { authorizedAt: new Date().getTime(), request: request }
  yield put(storeSubAccount(request.subIdentity))
  const network = request.subIdentity.network

  yield put(removeIdentity(`temp-${network}-${request.clientId}-${request.subIdentity.deviceAddress}`))
  yield put(updateInteractionStats(request.target, request.to, 'network'))
  yield put(updateActivity(request.id, {authorizedAt: props.authorizedAt}))
  yield put(track('networkRequest', props))
  yield put(clearRequest())
  return { status: 'ok' }
}

export default {
  authorize,
  handleLegacy: networkRequest,
  handle
}