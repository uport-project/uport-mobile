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
import { call, put, select, cps } from 'redux-saga/effects'
import { nativeSignerForAddress } from 'uPortMobile/lib/selectors/chains'
import { updateActivity } from 'uPortMobile/lib/actions/uportActions'
import { createToken } from '../jwt'

export function * handle (payload) {
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
  if (payload.net) {
    request.network = payload.net
  } else {
    throw new Error('No network specified in request jwt')
  }
  if (payload.from) {
    let signer
    if (MNID.isMNID(payload.from)) {
      signer = payload.from
    } else {
      signer = MNID.encode({address: payload.from, network: request.network})
    }
    const exists = yield select(selectedIdentity, signer)
    if (exists) {
      request.signer = signer
      yield put(refreshSettings(signer))
    } else {
      return {...request, error: `The provided from account ${signer} does not exist in your wallet`}
    }
  } else {
    const segregated = yield select(accountForClientIdAndNetwork, request.network, request.client_id)
    if (segregated) {
      request.signer = segregated.address
    } else {
      const current = yield select(currentAddress)
      if (current && decodeAddress(current).network === request.network) {
        request.signer = current
      } else {
        const identities = yield select(accountsForNetwork, request.network)
        if (identities.length === 0) {
          const error = `You do not have an account supporting network (${request.network})`
          yield put(track('txRequest Error', { request, error }))
          return {...request, error}
        }
        request.signer = identities[0].address
      }
    }
  }
  return request
}

export function * signData (request) {
  try {
    const signer = yield select(nativeSignerForAddress, request.signer)
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
