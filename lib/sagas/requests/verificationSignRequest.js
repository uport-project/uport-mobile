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
import { Platform } from 'react-native'
import { updateActivity, updateInteractionStats, storeConnection } from 'uPortMobile/lib/actions/uportActions'
import { registerDeviceForNotifications } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { endpointArn, skippedPushNotifications } from 'uPortMobile/lib/selectors/snsRegistrationStatus'
import { clearRequest } from 'uPortMobile/lib/actions/requestActions'
import { savePublicUport, refreshExternalUport } from '../persona'
import { createToken, verifyToken, WEEK, DAY } from '../jwt'
import { createSubAccount, createKeyPairAccount, createDeviceKey } from '../identitySaga'
import { accountsForNetwork, hasPublishedDID, accountForClientIdAndNetwork, accountForClientIdSignerTypeAndNetwork } from 'uPortMobile/lib/selectors/identities'
import { networkSettings } from 'uPortMobile/lib/selectors/chains'
import { working, errorMessage } from 'uPortMobile/lib/selectors/processStatus'
import { requestedClaims, verifiedClaimsTokens } from 'uPortMobile/lib/selectors/attestations'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { toJs, union, set, get } from 'mori'
import { networks, decodeAddress, defaultNetworkId } from 'uPortMobile/lib/utilities/networks'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { currentIdentity, currentAddress } from '../../selectors/identities'
import { addMultipleVc } from '../vcSaga'

export function * handle (payload, jwt) {

  const request = {
    client_id: payload.iss,
    callback_url: payload.callback,
    unsignedClaim: payload.unsignedClaim,
  }
  if (payload.sub) {
    request.subject = payload.sub
  }
  if (payload.rexp) {
    request.expiration = payload.rexp
  }

  request.target = yield select(currentAddress)

  if (payload.riss) {
    request.riss = payload.riss
  }

  if (payload.vc) {
    yield(fork(addMultipleVc, payload.vc))
  }

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
    const payload = {
      sub: request.subject,
      claim: request.unsignedClaim,
    }
    if (request.subject) {
      payload.sub = request.subject
    }
    const target = request.riss || request.target
    const legacyClient = request.client_id && !request.client_id.match(/did:/)
    const issuer = request.riss || !legacyClient && !request.target.match(/did:/) ? `did:uport:${request.target}` : request.target
    const token = yield call(createToken, target, payload, { expiresIn: request.expiration ? request.expiration : false, issuer })

    yield put(updateActivity(request.id, {authorizedAt: new Date().getTime()}))
    yield put(track('verificationSignRequest', {request}))
    return { access_token: token }
  } catch (error) {
    // console.log(error)
    yield put(updateActivity(request.id, {error: error.message}))
    yield put(track('verificationSignRequest Error', {error: error.message}))
  }
}

export default {
  authorize,
  handle
}