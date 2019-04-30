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
import { Platform } from 'react-native'
import { delay } from 'redux-saga'
import { takeEvery, select, all, call } from 'redux-saga/effects'
import analytics from 'uPortMobile/lib/utilities/analytics'
import { networkSettingsForAddress } from 'uPortMobile/lib/selectors/chains'
import { analyticsOptOut } from 'uPortMobile/lib/selectors/settings'
import { waitUntilConnected } from './networkState'
import { trackId } from 'uPortMobile/lib/utilities/trackid'
import { ADD_OWN_CLAIM, REMOVE_OWN_CLAIM, OPEN_ACTIVITY, CREATE_IDENTITY } from 'uPortMobile/lib/constants/UportActionTypes'
import { SAVE_ERROR, COMPLETE_PROCESS, FAIL_PROCESS } from 'uPortMobile/lib/constants/ProcessStatusActionTypes'
import { HANDLE_URL, SELECT_REQUEST, AUTHORIZE_REQUEST, CANCEL_REQUEST, CALLBACK } from 'uPortMobile/lib/constants/RequestActionTypes'
import { START_SEED_RECOVERY, RECOVERY_SUCCESS } from 'uPortMobile/lib/constants/RecoveryActionTypes'
import { HANDLE_ENCRYPTED_MESSAGE, SEND_LOCAL_NOTIFICATION, SKIP_PUSH_NOTIFICATIONS, INIT_NOTIFICATIONS } from 'uPortMobile/lib/constants/SnsRegistrationActionTypes'
import { ADD_MIGRATION_TARGET, RUN_MIGRATIONS, COMPLETED_MIGRATION_STEP, FAILED_MIGRATION_STEP, STARTED_MIGRATION_STEP } from 'uPortMobile/lib/constants/MigrationActionTypes'
import * as metricTypes from 'uPortMobile/lib/constants/MetricActionTypes'
import * as authorizationActionTypes from 'uPortMobile/lib/constants/AuthorizationActionTypes'
import * as onboardingActionTypes from 'uPortMobile/lib/constants/OnboardingActionTypes'
import * as myInfoActionTypes from 'uPortMobile/lib/constants/MyInfoActionTypes'
import * as scannerActionTypes from 'uPortMobile/lib/constants/ScannerActionTypes'

const actions = {
  ...myInfoActionTypes,
  ...scannerActionTypes,
  ...onboardingActionTypes,
  ...authorizationActionTypes,
  ADD_OWN_CLAIM,
  REMOVE_OWN_CLAIM,
  OPEN_ACTIVITY,
  CREATE_IDENTITY,
  SAVE_ERROR,
  COMPLETE_PROCESS,
  FAIL_PROCESS,
  HANDLE_URL,
  SELECT_REQUEST,
  AUTHORIZE_REQUEST,
  CANCEL_REQUEST,
  CALLBACK,
  START_SEED_RECOVERY,
  RECOVERY_SUCCESS,
  HANDLE_ENCRYPTED_MESSAGE,
  SEND_LOCAL_NOTIFICATION,
  SKIP_PUSH_NOTIFICATIONS,
  INIT_NOTIFICATIONS,
  ADD_MIGRATION_TARGET,
  COMPLETED_MIGRATION_STEP,
  FAILED_MIGRATION_STEP,
  RUN_MIGRATIONS,
  STARTED_MIGRATION_STEP
}

const allowedProperties = [
  'client_id', 'clientId', 'interactionType', 'party', 'iss', 'exp', 'iat', 'authorizedAt', 'target', 'step',
  'connection', 'type', 'connection_type', 'postback', 'popup', 'activityId', 'balance',
  'gasLimit', 'network', 'opened', 'to', 'changes', 'event', 'section', 'message', 'id',
  'callback_url', 'legacyPush', 'requested', 'pushPermissions', 'validatedSignature', 'request', 'actType',
  'commandType', 'startTime', 'endTime', 'screen', 'change', 'claims', 'claim', 'attestations', 'properties']

export function * identify ({address}) {
  const optOut = yield select(analyticsOptOut)
  const settings = yield select(networkSettingsForAddress, address)
  const segId = yield trackId()
  const didMethod = address ? (address.match(/^did:ethr:/) ? 'ethr' : 'uport') : undefined
  if (segId && !optOut) {
    try {
      yield call(waitUntilConnected)
      yield call([analytics, analytics.identify], {
        userId: segId,
        traits: {platform: Platform.OS, existingUport: !!address, chain: settings.network, signerType: settings.signerType, didMethod},
        context: { ip: '0.0.0.0' }
      })
    } catch (error) {
      console.log(error)
    }
  }
}

export function * track (payload) {
  const optOut = yield select(analyticsOptOut)
  const segId = yield trackId()
  if (!optOut) {
    try {
      const properties = scrubProperties(payload.data)
      yield call(waitUntilConnected)
      yield call([analytics, analytics.track], {
        userId: segId,
        event: `[MOBILE] ${payload.event}`,
        properties: properties,
        context: { ip: "0.0.0.0" }
      })
    } catch (error) {
      console.log(error)
    }
  }
}

export function * trackAction (action) {
  const optOut = yield select(analyticsOptOut)
  const segId = yield trackId()
  if (!optOut) {
     try {
      const properties = scrubProperties(action)
      yield call(waitUntilConnected)
      yield call([analytics, analytics.track], {
        userId: segId,
        event: `[MOBILE] ${action.type}`,
        properties: properties,
        context: { ip: "0.0.0.0" }
      })
    } catch (error) {
      console.log(error)
    }
   }
}

export function * screen (context) {
  const optOut = yield select(analyticsOptOut)
  const segId = yield trackId()
  if (!optOut) {
    try {
      const properties = scrubProperties(context.data)
      yield call(waitUntilConnected)
      yield call([analytics, analytics.screen], {
        userId: segId,
        name: `[MOBILE] ${context.name}`,
        properties: properties,
        context: { ip: "0.0.0.0" }
      })
    } catch (error) {
      console.log(error)
    }
  }
}

function scrubProperties (input) {
  try {
    let properties = Object.keys(input).reduce((obj, key) => {
      if (input[key] instanceof Array) {                                                                // A1. Handle arrays first.
        input[key].forEach(function (rec) { obj[key] = scrubProperties(rec) })                          // A2. Call recursively for each element.
      } else if (input[key] && typeof input[key] === 'object' && input[key].constructor === Object) {   // B1. Handle objects second.
        switch (key) {                                                                                  // note: Add more keys as needed.
          case 'claim':                                                                                 // These nested objects contain PII.
          case 'requested':
          case 'change':
            obj[key] = Object.keys(input[key])                                                          // B2. We only assign the keys and not the values to avoid PII.
            break
          default:
            obj[key] = scrubProperties(input[key])                                                      // B3. Call recursively for the object
        }
      } else if (allowedProperties.includes(key) && input[key] !== undefined) {                                                    // C1. Handle anything else that is not an array or object
        key === 'callback_url' ? obj[key] = getHostName(input[key]) : obj[key] = input[key]
      }                                                                                                 // C2. Only assign if allowedProperties.includes(key) is true to avoid PII.
      return obj
    }, {})
    return properties
  } catch (error) { console.log(error) }
}

function getHostName (url) {
  let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i)
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2]
  } else {
    return null
  }
}

function * metricsSaga () {
  yield all([
    takeEvery(Object.keys(actions), trackAction),
    takeEvery(metricTypes.IDENTIFY, identify),
    takeEvery(metricTypes.SCREEN, screen),
    takeEvery(metricTypes.TRACK, track)
  ])
}

export default metricsSaga
