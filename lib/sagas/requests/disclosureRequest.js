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
import { call, put, select, spawn, fork } from 'redux-saga/effects'
import { Platform } from 'react-native'
import { updateActivity, updateInteractionStats, storeConnection, refreshBalance } from 'uPortMobile/lib/actions/uportActions'
import { registerDeviceForNotifications } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { failProcess } from 'uPortMobile/lib/actions/processStatusActions'
import { endpointArn, skippedPushNotifications } from 'uPortMobile/lib/selectors/snsRegistrationStatus'
import { clearRequest } from 'uPortMobile/lib/actions/requestActions'
import { savePublicUport, refreshExternalUport } from '../persona'
import { createToken, verifyToken, WEEK, DAY } from '../jwt'
import { createKeyPairAccount, createDeviceKey } from '../identitySaga'
import { checkRpcNetwork } from 'uPortMobile/lib/sagas/blockchain'
import { accountsForNetwork, hasPublishedDID, publicEncKey, accountForClientIdSignerTypeAndNetwork } from 'uPortMobile/lib/selectors/identities'
import { networkSettings } from 'uPortMobile/lib/selectors/chains'
import { working, errorMessage } from 'uPortMobile/lib/selectors/processStatus'
import { requestedClaims, verifiedClaimsTokens } from 'uPortMobile/lib/selectors/attestations'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { toJs, union, set, get } from 'mori'
import { networks, decodeAddress, defaultNetworkId } from 'uPortMobile/lib/utilities/networks'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { currentAddress } from '../../selectors/identities'
import authorize from 'uPortMobile/lib/helpers/authorize'



const devMatcher = Platform.select({
  ios: /APNS_SANDBOX\/uPort/,
  android: /GCM\/uPort-android-dev/
})

const prodMatcher = Platform.select({
  ios: /APNS\/uPort/,
  android: /GCM\/uPort-android[^-]/
})

const ARN_MATCHER = global.__DEV__ ? devMatcher : prodMatcher

const LEGACY_MS = 1000000000000
const TOKEN_VALIDITY = 86400

const ACCOUNT_TYPES = set(['general', 'segregated', 'keypair', 'none'])

export function * handle (payload, jwt) {
  const request = {
    validatedSignature: true,
    client_id: payload.iss,
    callback_url: payload.callback,
    verified: payload.verified,
    requested: toJs(union(set(payload.requested || []), set(payload.verified || []))),
    req: jwt,
    actType: payload.act ? payload.act : 'none'
  }
  if (payload.net && payload.rpc) {
    request.rpc = payload.rpc
  }

  if (payload.act && !get(ACCOUNT_TYPES, payload.act)) {
    request.error = `We do not support accounts of type ${payload.act}`
    return request
  }

  if (request.actType !== 'none') {
    request.network = payload.net || defaultNetworkId
    request.accountAuthorized = false
  }
  if (payload.verified) {
    yield put(track('requestVerifiedClaim', {claim: payload.verified.toString(), client_id: request.client_id, callback_url: request.callback_url}))
  }
  const current = yield select(currentAddress)
  request.target = current
  try {
    if (payload.permissions && payload.permissions[0] === 'notifications') {
      request.pushPermissions = true
      yield spawn(askForNotificationsPermissions)
    }
  
    const account = yield call(findCorrectAccount, request)
    if (account) {
      request.account = account.address
      request.target = account.parent || account.address
      yield put(refreshBalance(account.address))
    }

    yield put(updateInteractionStats(request.target, request.client_id, 'request'))
    yield spawn(refreshExternalUport, {clientId: request.client_id})
    return request
  } catch (error) {
    request.error = error.message
    return request
  }
}

function * parseRequest (basicReq, parsed) {
  const request = {...basicReq}
  if (parsed.query) {
    const params = parsed.query
    if (params.requestToken) {
      const { payload } = yield call(verifyToken, params.requestToken)
      if (payload.type === 'shareReq') {
        request.validatedSignature = true
        request.client_id = payload.iss
        if (payload.act !== 'none') {
          request.network = payload.net || defaultNetworkId
        }
        request.callback_url = payload.callback
        request.verified = payload.verified
        if (payload.verified) {
          yield put(track('requestVerifiedClaim', {claim: payload.verified.toString(), client_id: request.client_id, callback_url: request.callback_url}))
        }
        request.requested = payload.requested
        request.req = params.requestToken
        if (payload.act && !get(ACCOUNT_TYPES, payload.act)) {
          throw new Error(`We do not support accounts of type ${payload.act}`)
        }
        request.actType = payload.act ? payload.act : 'general'
        // This is to handle uport-js pre 0.6 releases. Should eventually be removed
        if (payload.iat && payload.iat >= LEGACY_MS) {
          request.legacyMS = true
        }
        if (payload.permissions && payload.permissions[0] === 'notifications') {
          request.pushPermissions = true
          yield call(askForNotificationsPermissions)
        }
      } else {
        throw new Error('Request was not of correct type')
      }
    } else {
      if (params.label) {
        request.name = params.label
      }
      if (params.client_id) {
        request.client_id = params.client_id
      }
      if (params.callback_url) {
        request.callback_url = params.callback_url
      }
      request.requested = ['name', 'description', 'location']
    }
    if (request.actType !== 'none' && !request.network) {
      request.network = params.network_id || defaultNetworkId
    }
  }
  // console.log(request)
  return request
}

export function * findCorrectAccount ({target, client_id, network, actType, rpc}) {
  if (actType === 'none') return
  const networkName = networks[network] ? networks[network].name : network

  if (!((networks[network]||{}).supported || (network && rpc))) {
    throw new Error(`uPort does not support ${networkName} at the moment`)
  }
  if (actType !== 'keypair' && !networks[network].relayUrl) {
    throw new Error(`uPort does not support smart contract accounts on ${networkName} at the moment`)
  }
  const current = yield select(networkSettings)
  const base = {parent: target || current.address}
  if (rpc) {
    const checked = yield call(checkRpcNetwork, rpc)
    if (checked !== network) throw new Error(`App requested an account on chain ${network}, but endpoint returned ${checked}`)
    base.rpc = rpc
  }

  if (actType === 'segregated' ) {
    if (client_id) {
      const account = yield select(accountForClientIdSignerTypeAndNetwork, network, client_id, 'MetaIdentityManager')
      return account || {parent: target || current.address}
    }
    throw new Error('App requested a segregated account, but did not pass in a client_id')
  } else if (actType === 'keypair') {
    if (client_id) {
      const account = yield select(accountForClientIdSignerTypeAndNetwork, network, client_id, 'KeyPair')
      if (account) return account
      return base
    }
    throw new Error('App requested a segregated keypair account, but did not pass in a client_id')    
  }
  if (!network) return current
  const decoded = decodeAddress(target || current.address)
  if (decoded.network === network) return current
  const identities = yield select(accountsForNetwork, network)
  if (identities.length > 0) {
    return identities[0]
  }
  return base
}

export function * disclosureRequest (basicReq, parsed) {
  try {
    const request = yield call(parseRequest, basicReq, parsed)
    if (request.actType !== 'none' && request.actType !== 'general') request.accountAuthorized = false
    const account = yield call(findCorrectAccount, request)
    const current = yield select(networkSettings)
    request.target = account ? account.parent || account.address : current.address
    if (account) {
      request.account = account.address
    }
    // const counterparty = yield select(externalProfile, request.client_id)
    yield put(updateActivity(request.id, request))
    if (request.client_id) {
      yield put(updateInteractionStats(request.target, request.client_id, 'request'))
      yield spawn(refreshExternalUport, {clientId: request.client_id})
    }
    if (!request.target.match('^did:')) {
      const published = yield select(hasPublishedDID, request.target)
      if (!published) {
        const personaWorking = yield select(working, 'persona')
        const personaError = yield select(errorMessage, 'persona')
        if (!personaWorking && !personaError) {
          yield spawn(savePublicUport, {address: request.target})
        }
      }
    }
    yield put(track('disclosureRequest', {client_id: request.client_id, callback_url: request.callback_url}))
    return request
  } catch (error) {
    // console.log(error)
    yield put(updateActivity(basicReq.id, {error: error.message}))
    yield put(track('disclosureRequest Error', {error: error.message}))
  }
}

export function * askForNotificationsPermissions () {
  // While we're in develop mode I have to continue to to force re-registration
  // leaving this commented out as a reminder, since it's not straightforward why it's needed
  // const endpoint = yield select(endpointArn)
  // if (endpoint && endpoint.match(ARN_MATCHER)) {
  //   const address = yield select(currentAddress)
  //   yield put(updateEndpointAddress(address))
  //   return true
  // }
  // console.log('askForNotificationsPermissions')
  const endpoint = yield select(endpointArn)
  // console.log(`endpoint: ${endpoint}`)
  if (endpoint && endpoint.match(ARN_MATCHER)) return true
  console.log('no endpoint')
  const skipped = yield select(skippedPushNotifications)
  console.log(`skipped push ${skipped}`)
  // if (skipped) return false
  yield put(registerDeviceForNotifications())
}

export function * notificationsAllowed () {
  const endpoint = yield select(endpointArn)
  if (endpoint) return true
  const skipped = yield select(skippedPushNotifications)
  if (skipped) return false
}

export function * createNewAccount ({id, actType, target, network, client_id, rpc}) {
  yield put(track('create new account', {actType: actType, network: network, client_id: client_id}))
  const params = {parent: target, network: (networks[network] || {name: network}).name}
  if (rpc) {
    params.rpcUrl = rpc
  }
  if (client_id && (actType === 'segregated' || actType === 'keypair')) {
    params.clientId = client_id
  }
  const account = yield call(createKeyPairAccount, params)
  yield put(updateActivity(id, {account: account}))
  return account
}

export function * authorizeDisclosure (request) {
  try {
    const payload = { aud: request.client_id || request.callback_url, type: 'shareResp' }
    if (request.nad) payload.nad = request.nad
    if (request.dad) payload.dad = request.dad
    const moriProfile = yield select(externalProfile, request.client_id)
    const counterparty = toJs(moriProfile)
    const legacyClient = request.client_id && !request.client_id.match(/did:/)
    const issuer = !legacyClient && !request.target.match(/did:/) ? `did:uport:${request.target}` : request.target
    if (request.requested) {
      // This is what we currently do even though it's wrong. People could be relying on it so keeping the functionality
      const own = yield select(requestedClaims, toJs(union(set(request.requested || []), set(request.verified || []))))
      if (own) payload.own = own
    }
    if (request.req) payload.req = request.req
    if (request.verified) {
      payload.verified = yield select(verifiedClaimsTokens, request.verified)
      if (payload.verified && payload.verified.length > 0) {
        yield call(authorize, `Do you want to share your information with ${counterparty.name}?`)
      }
      yield put(track('authorizeVerifiedClaim', {claim: request.verified.toString(), client_id: request.client_id, callback_url: request.callback_url}))
      if (payload.verified && payload.verified.length > 0) {
        yield put(track('successDataExchange', {claim: request.verified.toString(), client_id: request.client_id, callback_url: request.callback_url}))
      }
    }
    if (request.challenge) payload.challenge = request.challenge
    if (request.pushPermissions) {
      const allowed = yield call(notificationsAllowed)
      if (allowed) {
        const endpoint = yield select(endpointArn)
        const pushPayload = {
          aud: request.client_id || request.callback_url,
          type: 'notifications',
          value: endpoint
        }
        const pushToken = yield call(createToken, request.target, pushPayload, {expiresIn: ((52 * WEEK) + DAY), issuer}, `Allow ${counterparty ? counterparty.name : 'service'} to send your push notifications`)
        yield put(updateActivity(request.id, {pushToken}))
        yield put(track('disclosureRequest Allowed Notifications', {client_id: request.client_id, callback_url: request.callback_url}))
        payload.capabilities = [pushToken]
        const boxPub = yield select(publicEncKey, request.target)
        if (legacyClient) {
          payload.publicEncKey = boxPub
        }
        payload.boxPub = boxPub
      }
    }
    // console.log(request.target, {expiresIn: TOKEN_VALIDITY, issuer}, payload)
    const token = yield call(createToken, request.target, payload, {expiresIn: TOKEN_VALIDITY, issuer}, `Provide requested information to ${counterparty ? counterparty.name : 'service'}`)
    // console.log(token)
    if (request.client_id) {
      yield put(updateInteractionStats(request.target, request.client_id, 'share'))
      yield put(storeConnection(request.target, 'apps', request.client_id))
    }
    const authorizedAt = new Date().getTime()
    yield put(updateActivity(request.id, {authorizedAt}))
    yield put(track('disclosureRequest Authorized', {client_id: request.client_id, callback_url: request.callback_url, authorizedAt}))
    yield put(clearRequest())
    return { access_token: token }
  } catch (error) {
    yield put(failProcess('authorizeDisclosure', error.message))
    yield put(updateActivity(request.id, {error: error.message}))
    yield put(track('disclosureRequest Error', {error: error.message}))
    return {error: error.message}
  }
}

export function * authorizeAccount (request) {
  const payload = {}
  payload.accountAuthorized = true
  if (request.actType !== 'none') {
    payload.nad = yield call(createNewAccount, request)
    if (payload.nad === false) throw new Error('Requested account could not be create')
  }
  yield put(updateActivity(request.id, payload))
}
export default {
  authorizeAccount: authorizeAccount,
  authorize: authorizeDisclosure,
  handleLegacy: disclosureRequest,
  handle
}
