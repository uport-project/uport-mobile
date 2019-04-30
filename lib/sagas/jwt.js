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
import { call, select } from 'redux-saga/effects'
import { NativeModules } from 'react-native'
import { verifyJWT } from 'did-jwt'
import { Credentials } from 'uport-credentials'
import { deviceAddressForAddress } from 'uPortMobile/lib/selectors/chains'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import { hdRootAddress, hdPathFor } from 'uPortMobile/lib/selectors/hdWallet'
import { partial } from 'mori'
import { RNUportSigner, RNUportHDSigner } from 'react-native-uport-signer'
import registerHttpsResolver from 'https-did-resolver'
import registerUportResolver from 'uport-did-resolver'
import registerEthrResolver from 'ethr-did-resolver'

registerHttpsResolver()
registerUportResolver()
registerEthrResolver()

export const DAY = 86400 // TODO determine this
export const WEEK = DAY * 7
export const JWT_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/

export function normalizeRecoveryParam (v) {
  switch (v) {
    case 0:
    case 1:
      return v
    case 27:
    case 28:
      return (v - 27)
    default:
      throw new Error(`Signing library returned invalid recovery param '${v}'`)
  }
}

export function * signerFor (address, prompt) {
  const path = yield select(hdPathFor, address)

  let signJwt
  if (path) {
    const root = yield select(hdRootAddress)
    // `partial()` is a mori function that creates a new function based on another function with the first parameters applied
    // see http://swannodette.github.io/mori/#partial
    signJwt = partial(RNUportHDSigner.signJwt, root, path)
  } else {
    const deviceAddress = yield select(deviceAddressForAddress, address)
    signJwt = partial(RNUportSigner.signJwt, deviceAddress)
  }
  return async (data) => {
    const { v, r, s } = await signJwt(Buffer.from(data).toString('base64'), prompt || 'sign request')
    return {
      recoveryParam: normalizeRecoveryParam(v),
      r: Buffer.from(r, 'base64').toString('hex'),
      s: Buffer.from(s, 'base64').toString('hex')
    }
  }
}

export function * credentialsFor (address, prompt, opts = {}) {
  const params = {}
  params.signer = yield signerFor(address, prompt)
  if (!!opts.issuer) {
    params.did = opts.issuer
  } else {
    params.did = address
  }
  return new Credentials(params)
}

export function * createToken (address, payload, opts = {}) {
  const credentials = yield call(credentialsFor, address, opts.prompt, { issuer: opts.issuer })
  return yield call([credentials, credentials.signJWT], payload, typeof opts.expiresIn === 'undefined' ? DAY : opts.expiresIn)
}

export function * verifyToken (jwt) {
  const address = yield select(currentAddress)
  const verified = yield call(verifyJWT, jwt, { audience: address })
  if (verified) {
    return verified
  }
  throw new Error('Could not verify the signature of request')
}

export function * verifyProfile (jwt) {
  const address = yield select(currentAddress)
  const credentials = yield call(credentialsFor, address)
  return yield call([credentials, credentials.verifyDisclosure], jwt)
}

export function * createShareRequestToken (address, payload = {}) {
  const credentials = yield call(credentialsFor, address)
  return yield call([credentials, credentials.createDisclosureRequest], payload)
}

export function * createShareResponseToken (address, payload = {}) {
  const credentials = yield call(credentialsFor, address)
  return yield call([credentials, credentials.createDisclosureResponse], payload)
}

export function * createAttestationToken (address, sub, claim) {
  const credentials = yield call(credentialsFor, address)
  return yield call([credentials, credentials.createVerification], {sub, claim})
}

export function * createPututuAuthToken (address) {
  // TODO come up with better wording
  return yield call(
    createToken,
    address,
    { type: 'user-auth' },
    { prompt: 'Look for messages?', issuer: address }
  )
}
