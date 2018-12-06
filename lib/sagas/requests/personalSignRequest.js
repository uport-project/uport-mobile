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
import { call, put, select, spawn, cps } from 'redux-saga/effects'
import { Alert } from 'react-native'
import { get } from 'mori'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { selectSigner } from './transactionRequest'
import { autoPrompt } from '../keychain'
import { networkSettingsForAddress, web3ForAddress, networkSettings, nativeSignerForAddress, hexAddressForAddress, 
  networkSettingsForAddressMap, securityLevelForAddress, deviceAddressForAddress } from 'uPortMobile/lib/selectors/chains'
import { updateActivity } from 'uPortMobile/lib/actions/uportActions'
import { currentIdentity, currentAddress } from 'uPortMobile/lib/selectors/identities'
import { findTarget } from 'uPortMobile/lib/sagas/requests/transactionRequest'
import askForAuthorization from 'uPortMobile/lib/helpers/authorize'
import { createToken } from '../jwt'

const ethAbi = require('uPortMobile/lib/browserified/ethereumjs-abi')
const keccak256 = require('js-sha3').keccak_256


export function * handle (payload, jwt) {
  const request = {}
  if (payload.iss) {
    request.client_id = payload.iss
  } else {
    throw new Error('No Issuer in request jwt')
  }

  if (payload.data) {
    request.data = payload.data
  } else {
    throw new Error('No data in request jwt')
  }

  if (payload.riss) {
    request.target = payload.riss
  } else {
    throw new Error('No signing address in request jwt')
  }

  if (payload.callback) {
    request.callback_url = payload.callback
  }

  return request
}

export function * authorize (request) {
  try {
    //yield put(startWorking('tx'))
    const deviceAddress = yield select(deviceAddressForAddress, request.target)
    const level = yield select(securityLevelForAddress, deviceAddress)
    if (autoPrompt(level)) {
      return yield signData(request)
    }

    const authorized = yield call(askForAuthorization, 'Sign Transaction?')

    if (authorized) {
      yield put(track('txRequest Authorized', request))
      return yield signData(request)
    } else {
      yield put(track('txRequest Unauthorized', request))
      //yield put(clearMessage('tx'))
      Alert.alert(
        'Warning',
        'uport requires a device passcode/fingerprint to allow for device user authentication, the app will never see your passcode and this is handled by the Android system',
        [
            {text: 'OK', onPress: () => console.log('OK Pressed')}
        ],
        { cancelable: false }
      )
      return {error: 'access_denied'}
    }
  } catch (e) {
    console.log(e)
  }
}

export function * signData (request, signerType) {
  try {
    const signer = yield select(nativeSignerForAddress, request.target)
    const signature = yield cps(signer.personalSign, request.data)
    const payload = {
      type: 'personalSignResp',
      data: request.data,
      signature
     }
    const target = request.target
    const legacyClient = request.client_id && !request.client_id.match(/did:/)
    const issuer = request.riss || !legacyClient && !request.target.match(/did:/) ? `did:uport:${request.target}` : request.target
    const token = yield call(createToken, target, payload, { expiresIn: false, issuer })
    yield put(updateActivity(request.id, {authorizedAt: new Date().getTime()}))
    return {personalSig: token}
  } catch (e) {
    console.log(e)
  }
}

export default {
  authorize: signData,
  handle
}
