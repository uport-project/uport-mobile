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
import { delay } from 'redux-saga'
import { takeEvery, takeLatest, call, put, select, all, spawn } from 'redux-saga/effects'
import { HANDLE_URL, HANDLE_MESSAGE, CLEAR_REQUEST, AUTHORIZE_REQUEST, CANCEL_REQUEST, SELECT_REQUEST, SELECT_ACCOUNT_FOR_REQUEST, AUTHORIZE_ACCOUNT } from 'uPortMobile/lib/constants/RequestActionTypes'
import contactsReq from './connectionRequest'
import propReq from './propertyRequest'
import shareReq from './disclosureRequest'
import verReq from './verificationSignRequest'
import attReq, { addAttestations } from './addAttestations'
import netReq from './networkRequest'
import eip712Req from './eip712Request'
import { encryptMessage } from '../encryption'
import { JWT_REGEX, verifyToken } from '../jwt'
import { fetchRequest, currentRequestId } from 'uPortMobile/lib/selectors/requests'
import { currentAddress, selectedIdentity } from 'uPortMobile/lib/selectors/identities'
import { openExternalUrl } from 'uPortMobile/lib/helpers/url_handler'
import { NavigationActions } from 'uPortMobile/lib/utilities/NavigationActions'
import { storeActivity, updateActivity, openActivity, refreshSettings, refreshBalance } from 'uPortMobile/lib/actions/uportActions'
import { selectRequest, clearRequest, saveRequest, cancelRequest } from 'uPortMobile/lib/actions/requestActions'
import { updateBadgeCount, sendLocalNotification } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { saveError, clearMessage } from 'uPortMobile/lib/actions/processStatusActions'
import { Platform, AppState } from 'react-native'
import { Navigation } from 'react-native-navigation'
import IntentLauncher, { IntentConstant } from 'react-native-intent-launcher'
import { track } from 'uPortMobile/lib/actions/metricActions'
import URL from 'url-parse'
import qs from 'qs'
import { sha256 } from 'js-sha256'
const HANDLERS = {
  sign: require('./transactionRequest'), // for some reason this doesn't follow the other cases
  disclosure: shareReq,
  connect: contactsReq,
  property: propReq,
  attestation: attReq,
  net: netReq,
  verificationSign: verReq,
  eip712Sign: eip712Req
}

const JWT_REQUEST_TYPE = {
  chainProv: 'net',
  shareReq: 'disclosure',
  shareResp: 'connect',
  ethtx: 'sign',
  verReq: 'verificationSign',
  eip712Req: 'eip712Sign'
}

const MNID = require('mnid')

// Naive sequential activity ID generator
export function * generateActivityId () {
  return (new Date().getTime() * 10000) + Math.floor(Math.random() * (Math.floor(100000)))
}

export function findRequestType (parsed) {
  if (parsed.protocol === 'ethereum:') {
    return 'sign'
  } else if (parsed.protocol === 'me.uport:' || (parsed.protocol === 'https:' && parsed.host === 'id.uport.me')) {
    if (parsed.pathname[0] === '/') parsed.pathname = parsed.pathname.slice(1)
    const token = parsed.pathname.split('/')[0]
    switch (token) {
      case 'req':
        return 'unified'
      case 'me':
        return 'disclosure'
      case 'add':
        return 'attestation'
      case 'net':
        return 'net'
      case 'deploy':
        return 'sign'
      case 'property':
        return 'property'
      case 'info':
        return 'information'
      default:
        if (MNID.isMNID(token) || token.match(/^(0x[0-9a-fA-F]{40})/)) {
          const params = parsed.query
          if (params && (params.value || params.function || params.bytecode)) {
            return 'sign'
          } else {
            return 'connect'
          }
        }
    }
  }
}

function * deleteUrl (url) {
  yield fetch(url, {method: 'DELETE', headers: {'Accept': 'application/json'}})
}

export function * handleURL ({ url, postback, popup, clientId, target, legacyPush }) {
  // console.log(url)
  // if (popup) {
  //   yield call(handleClearRequest)
  // }
  yield put(clearMessage('handleUrl'))
  const parsed = URL(url, true)
  // console.log(parsed)
  // clientId is only received from push notifications. We will override any built in clientId
  if (clientId) {
    if (!parsed.query) {
      parsed.query = {client_id: clientId}
    } else {
      parsed.query.client_id = clientId
    }
  }
  const requestType = findRequestType(parsed)
  if (!requestType) {
    // Try loading from this URL
    try {
      const response = yield call(fetch, url, {headers: {'Accept': 'application/json'}})
      const json = yield call(response.json.bind(response))
      if (json && json.status === 'success' && json.message && json.message.content && json.message.content.match(JWT_REGEX)) {
        yield spawn(deleteUrl, url)
        return yield call(messageHandler, {
          message: json.message.content,
          popup,
          target,
          redirectUrl: json.message.redirect_url,
          postback: json.message.callback_type  === 'post'
        })
      } else {
        throw new Error('Unsupported request')
      }
    } catch (e) {
      yield put(saveError('handleUrl', `Unsupported Url ${url}`))
      return
    }
  }

  if (requestType === 'unified') {
    const path = parsed.pathname && parsed.pathname.match(/^\/?req\/(.*)$/)
    if (path && path[1].match(JWT_REGEX)) {
      let redirectUrl
      let postback
      if (parsed.query.callback_type) {
        switch (parsed.query.callback_type) {
          case 'post':
            postback = true
            break
          case 'redirect':
            postback = false
            break
        }
      }
      if (parsed.query.redirect_url) redirectUrl = parsed.query.redirect_url
      return yield call(messageHandler, {message: path[1], popup, target, redirectUrl, postback})
    } else {
      yield put(saveError('handleUrl', `Invalid request url ${url}`))
      return
    }
  }

  // LEGACY SECTION PLEASE CUT WHEN READY
  try {
    const activityId = yield call(generateActivityId)
    const request = {id: activityId, postback, type: requestType, opened: popup, target, legacyPush: legacyPush}
    if (requestType === 'information') {
      request.infoType = parsed.query.infoType
      request.screen = parsed.query.screen
    }
    if (!request.target) {
      request.target = yield select(currentAddress)
    }
    if (parsed.query.callback_url) {
      request.callback_url = parsed.query.callback_url
    }
    if (parsed.query.redirect_url) {
      request.redirect_url = parsed.query.redirect_url
      const redirect = URL(request.redirect_url)
      const callback = URL(request.callback_url)

      if (redirect && redirect.protocol !== undefined && callback && redirect.protocol.match(/(http|https):/)) {
        if (redirect.hostname !== callback.hostname) {
          yield put(saveError('handleUrl', 'Redirect URL and Callback URL must have matching host names'))
          return
        }
      }
    }
    switch (parsed.query.callback_type) {
      case 'post':
        request.postback = true
        break
      case 'redirect':
        request.postback = false
        break
    }
    // console.log('request')
    // console.log(request)
    yield put(storeActivity(request))
    if (AppState.currentState === 'background') {
      // When opening URL from mobile safari, app state is in 'background'
      yield call(delay, 1000)
    }
    if (popup && AppState.currentState === 'active' && requestType !== 'information') {
      yield put(selectRequest(activityId))
    } else {
      yield put(updateBadgeCount())
      if (AppState.currentState !== 'active' && legacyPush && Platform.OS === 'ios') {
        yield put(sendLocalNotification(activityId, 'You received a message'))
      }
    }

    yield put(track(`request ${requestType}`))
    if (requestType === 'attestation') {
      const attResponse = yield call(addAttestations, request, parsed)
      if (request.callback_url && postback) {
        yield spawn(performCallback, request, attResponse)
      }
      return attResponse
    }
    const handler = HANDLERS[requestType]
    if (handler) {
      return yield call(handler.handleLegacy, request, parsed)
    }
  } catch (e) {
    console.log('error in handleURL')
    console.log(e)
  }
}

export function * messageHandler ({message, popup, target, redirectUrl, postback}) {
  if (AppState.currentState === 'background') {
    // When opening URL from mobile safari, app state is in 'background'
    yield call(delay, 1000)
  }
  try {
    const { payload, doc } = yield call(verifyToken, message)
    const id = sha256(message)
    const requestType = JWT_REQUEST_TYPE[payload.type] || 'attestation'
    const handler = HANDLERS[requestType]
    const boxPub = payload.boxPub // Breaking change, may introduce later: ->  || (doc.publicKey.find(pk => pk.type === 'Curve25519EncryptionPublicKey') || {}).publicKeyBase64
    if (handler && handler.handle) {
      const request = yield call(handler.handle, payload, message, id)
      if (request) {
        request.type = requestType
        if (redirectUrl) request.redirect_url = redirectUrl
        if (postback !== undefined) request.postback = postback
        let callback = request.callback_url ? URL(request.callback_url) : undefined
        let redirect = request.redirect_url ? URL(request.redirect_url) : undefined
        if (redirect && redirect.protocol !== undefined && callback && redirect.protocol.match(/(http|https):/)) {
          if (redirect.hostname !== callback.hostname) {
            yield put(saveError('handleUrl', 'Redirect URL and Callback URL must have matching host names'))
            return
          }
        }
        if (!request.id) {
          request.id = id
        }
        if (boxPub) {
          request.boxPub = boxPub
        }
        // console.log('messageHandler', request)
        yield put(storeActivity(request))
        if (popup && AppState.currentState === 'active' && requestType !== 'information') {
          yield put(selectRequest(request.id))
        } else {
          yield put(updateBadgeCount())
        }
      }
    }
  } catch (error) {
    yield put(saveError('handleMessage', error.message))
  }
}

export function * returnToApp (url, response) {
  // console.log(`callback_url: ${request.callback_url}`)
  // console.log(url)
  const res = qs.stringify(response)
  if (response !== undefined) {
    let hash
    if (url.hash === '#') {
      hash = '#' + res
    } else {
      hash = url.hash ? url.hash + '&' + res : '#' + res
    }
    url.set('hash', hash)
  }
  // console.log(`redirecting to: ${url.toString()}`)
  if (Platform.OS === 'android' && url.protocol === 'https:') {
    try {
      return yield call(IntentLauncher.startActivity, {action: IntentConstant.ACTION_VIEW, data: url.toString(), extra: { 'com.android.browser.application_id': 'com.android.chrome' }})
    } catch (error) {
      console.log(error)
    }
  }
  return yield call(openExternalUrl, url.toString())
}

export function * postBackToServer (request, response) {
  // console.log(`posting back to ${request.callback_url}`)
  let body
  if (request.boxPub) {
    const encrypted = yield call(encryptMessage, JSON.stringify(response), request.boxPub)
    body = JSON.stringify({encrypted})
  } else {
    body = JSON.stringify(response)
  }
  return yield call(fetch, request.callback_url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body
  })
}

export function * performCallback (request, response) {
  const callbackUrl = URL(request.callback_url)
  const redirectUrl = request.redirect_url ? URL(request.redirect_url) : undefined

  if (request.postback !== false || callbackUrl.hostname.match(/^(chasqui|api)\.uport\.(me|space)$/)) {
    yield call(postBackToServer, request, response)
    if (redirectUrl !== undefined) {
      return yield call(returnToApp, redirectUrl, undefined)
    }
  } else if (redirectUrl !== undefined) {
    return yield call(returnToApp, redirectUrl, response)
  } else if (callbackUrl !== undefined) {
    return yield call(returnToApp, callbackUrl, response)
  }
}

export function * authorizeAndCallback (request) {
  const handler = HANDLERS[request.type]
  if (handler && handler.authorize) {
    const response = yield call(handler.authorize, request)
    if (response) {
      if (request.type !== 'sign') {
        yield put({type: CLEAR_REQUEST})
      }
      if (request.callback_url) {
        yield spawn(performCallback, request, response)
      }
      return response
    } else {
      // TODO what do we do if there isn't a response'
      return false
    }
  } else {
    if (request.infoType === 'seedRecovery') {
      try {
        yield put(updateActivity(request.id, {authorizedAt: new Date().getTime()}))
        NavigationActions.push({screen: request.screen, title: 'Account Recovery'})
        NavigationActions.dismissModal()
      } catch (e) {
        console.log(e)
      }
    }
  }
}

export function * authorize ({activityId}) {
  try {
    // console.log(`authorize: ${activityId}`)
    const request = yield select(fetchRequest, activityId)
    // console.log(`Authorize request: ${request.type}`)
    // console.log(request)
    yield put(track(`authorize ${request.type}`, {network: request.network}))
    if (request.type === 'attestation') {
      yield put({type: CLEAR_REQUEST})
      if (!request.postback && request.callback_url) {
        yield spawn(performCallback, request, { status: 'ok' })
      }
    } else {
      yield spawn(authorizeAndCallback, request)
    }
    yield put(updateBadgeCount())
  } catch (error) {
    console.log(error)
  }
}

export function * authorizeAccount ({activityId, accType}) {
  const request = yield select(fetchRequest, activityId)
  if (accType === 'existing') {
    if (request.actType === 'devicekey') {
      yield put(updateActivity(request.id, {accountAuthorized: true, dad: request.account}))
    } else {
      yield put(updateActivity(request.id, {accountAuthorized: true, nad: request.account}))
    }
    return
  }
  const handler = HANDLERS[request.type]
  yield call(handler.authorizeAccount, request)
}

function * cancel ({activityId}) {
  yield put(clearRequest())
  const request = yield select(fetchRequest, activityId)
  // console.log(request)
  if (!(request.authorizedAt || request.canceledAt)) {
    yield put(updateActivity(activityId, {canceledAt: new Date().getTime()}))
    if (request.callback_url) {
      yield spawn(performCallback, request, { error: 'access_denied' })
    }
  }
}

export function * handleSelectActivity ({activityId}) {
  const existing = yield select(currentRequestId)
  if (activityId === existing) return
  const request = yield select(fetchRequest, activityId)
  request.target ? yield spawn(refreshBalance, request.target) : null
  yield call(handleClearRequest)
  yield call(delay, 200)
  yield put(saveRequest(activityId))
  if (!!request.type && (request.type === 'disclosure' || request.type === 'sign')) {
    yield call(NavigationActions.showLightBox, {
      screen: 'newRequest.root',
      style: {
        backgroundBlur: 'none', // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
        backgroundColor: '#00000080'
      }
    })
  } else {
    yield call(NavigationActions.showModal, {
      screen: 'request.root',
      animationType: 'slide-up'
    })
  }
  
  if (!request.opened) {
    yield put(openActivity(activityId))
  }
  yield put(updateBadgeCount())
}

export function * handleClearRequest () {
  yield call(NavigationActions.dismissLightBox, {})
  yield call(NavigationActions.dismissModal, {animationType: 'slide-down'})
  yield put(updateBadgeCount())
}

export function * selectAccount ({activityId, account}) {
  const request = yield select(fetchRequest, activityId)
  if (request.network && account && MNID.decode(account).network === request.network) {
    const accountRecord = yield select(selectedIdentity, account)
    if (accountRecord) {
      yield put(updateActivity(activityId, {account, target: accountRecord.parent || account}))
    }
  }
}

function * handleRequestSaga () {
  yield all([
    takeEvery(HANDLE_URL, handleURL),
    takeEvery(HANDLE_MESSAGE, messageHandler),
    takeEvery(AUTHORIZE_REQUEST, authorize),
    takeEvery(AUTHORIZE_ACCOUNT, authorizeAccount),
    takeEvery(SELECT_REQUEST, handleSelectActivity),
    takeEvery(CANCEL_REQUEST, cancel),
    takeEvery(CLEAR_REQUEST, handleClearRequest),
    takeLatest(SELECT_ACCOUNT_FOR_REQUEST, selectAccount)
  ])
}

export default handleRequestSaga
