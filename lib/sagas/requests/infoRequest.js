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
import { call, put, fork, select, spawn } from 'redux-saga/effects'
import { updateActivity, updateInteractionStats } from 'uPortMobile/lib/actions/uportActions'
import { refreshExternalUport } from '../persona'
import { createToken } from '../jwt'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { addMultipleVc } from '../vcSaga'

export function * handle (payload, jwt) {

  const request = {
    client_id: payload.iss,
    callback_url: payload.callback,
    title: payload.title,
    body: payload.body,
    ctaUrl: payload.ctaUrl,
    ctaTitle: payload.ctaTitle,
  }

  if (payload.vc) {
    yield(fork(addMultipleVc, payload.vc))
  }

  request.target = payload.sub

  try {
    yield spawn(refreshExternalUport, {clientId: request.client_id})
  } catch (error) {
    request.error = error.message
    return request
  }
  return request
}

export function * authorize (request) {
  try {
    if (request.client_id) {
      yield put(updateInteractionStats(request.target, request.client_id, 'request'))
    }

    yield put(updateActivity(request.id, {authorizedAt: new Date().getTime()}))
    yield put(track('infoRequest', {request}))
    return true
  } catch (error) {
    // console.log(error)
    yield put(updateActivity(request.id, {error: error.message}))
    yield put(track('infoRequest Error', {error: error.message}))
  }
}

export default {
  hideRequestCard: true,
  authorize,
  handle
}