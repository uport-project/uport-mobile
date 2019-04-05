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
import { takeEvery, put, select, call, fork, spawn } from 'redux-saga/effects'
import { ADD_ATTESTATION } from 'uPortMobile/lib/constants/UportActionTypes'
import { updateActivity, removeActivity, updateInteractionStats, storeAttestation, removePendingAttestation } from 'uPortMobile/lib/actions/uportActions'
import { verifyToken } from '../jwt'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { performCallback } from './index'

export function * reject (request, error) {
  yield put(removeActivity(request.id))
  return { error }
}

export function * handle (verified, jwt) {
  const request = {
    target: verified.sub,
    client_id: verified.iss
  }
  verified.token = jwt
  request.target = verified.sub
  request.client_id = verified.iss
  request.attestations = [verified]

  yield put(track('addAttestation', {claim: Object.keys(verified.claim)[0], callback_url: request.callback_url, client_id: request.client_id}))

  yield put(storeAttestation(verified))
  yield put(updateInteractionStats(verified.sub, verified.iss, 'attest'))
  yield put(removePendingAttestation(verified.sub, verified.iss, Object.keys(verified.claim)[0]))
  if (verified.callbackUrl) {
    yield spawn(performCallback, {
      callback_url: verified.callbackUrl,
      postback: true
    }, { status: 'accepted', jwt })
  }

  return request
}

export function * addAttestations (request, parsed) {
  const params = parsed.query || {}
  if (params.callback_url) {
    request.callback_url = params.callback_url
  }
  if (params.attestations) {
    const attestations = []
    for (let token of params.attestations.split(/,/)) {
      try {
        const { payload } = yield call(verifyToken, token)
        payload.token = token
        attestations.push(payload)
        request.target = payload.sub
        request.client_id = payload.iss
        yield put(track('addAttestation Verified', {callback_url: request.callback_url, client_id: request.client_id}))
      } catch (error) {
        yield put(track('addAttestation Invalid Verification', {callback_url: request.callback_url, client_id: request.client_id}))
        return yield reject(request, 'invalid_verification')
      }
    }
    if (attestations.length === 0) {
      yield put(track('addAttestation Missing Verification', {callback_url: request.callback_url, client_id: request.client_id}))
      return yield reject(request, 'missing_verifications')
    }
    request.attestations = attestations
    yield put(updateActivity(request.id, request))
    for (let att of request.attestations) {
      yield put(storeAttestation(att))
      yield put(updateInteractionStats(att.sub, att.iss, 'attest'))
      yield put(removePendingAttestation(att.sub, att.iss, Object.keys(att.claim)[0]))
    }
    let props = {authorizedAt: new Date().getTime()}
    props.request = request
    yield put(updateActivity(request.id, {authorizedAt: props.authorizedAt}))
    yield put(track('addAttestation Authorized', {callback_url: request.callback_url, client_id: request.client_id}))
    return { status: 'ok' }
  } else {
    yield put(track('addAttestation Invalid Request', {callback_url: request.callback_url, client_id: request.client_id}))
    return yield reject(request, 'invalid_request')
  }
}

export default {
  handleLegacy: addAttestations,
  handle
}
