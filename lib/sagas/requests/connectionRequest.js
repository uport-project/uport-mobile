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
import { put, select } from 'redux-saga/effects'
import { connected, currentAddress } from 'uPortMobile/lib/selectors/identities'
import { storeConnection, updateActivity, updateInteractionStats, storeExternalUport } from 'uPortMobile/lib/actions/uportActions'
import { get } from 'mori'
import { track } from 'uPortMobile/lib/actions/metricActions'

export function * handle (payload, jwt) {
  // TODO update this to use verifyProfile from uport js once did branch is merged in
  const profile = {...payload.own, shareToken: jwt}
  if (payload.nad) {
    profile.nad = payload.nad
  }
  const request = {did: payload.iss, profile, verified: payload.verified}
  const connections = yield select(connected)
  if (get(connections, request.to)) {
    request.existing = true
  }
  if (!request.target) {
    request.target = yield select(currentAddress)
  }
  return request
}

export function * addConnection (request) {
  let props = { authorizedAt: new Date().getTime(), request: request }
  yield put(storeExternalUport(request.did, request.profile))
  yield put(storeConnection(request.target, 'knows', request.did))
  // TODO store attestations included
  yield put(updateInteractionStats(request.target, request.did, 'connect'))
  yield put(updateActivity(request.id, {authorizedAt: props.authorizedAt}))
  yield put(track('connectionRequest'))
  return { status: 'ok' }
}

export default {
  authorize: addConnection,
  handle
}
