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
import { Alert } from 'react-native'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { autoPrompt } from '../keychain'
import { networkSettingsForAddress, nativeSignerForAddress, securityLevelForAddress, deviceAddressForAddress } from 'uPortMobile/lib/selectors/chains'
import { currentAddress, selectedIdentity, accountsForNetwork, accountForClientIdAndNetwork } from 'uPortMobile/lib/selectors/identities'
import { updateActivity, refreshSettings } from 'uPortMobile/lib/actions/uportActions'
import askForAuthorization from 'uPortMobile/lib/helpers/authorize'
import { createToken } from '../jwt'
import { decodeAddress } from 'uPortMobile/lib/utilities/networks'

const MNID = require('mnid')
const ethAbi = require('uPortMobile/lib/browserified/ethereumjs-abi')
const keccak256 = require('js-sha3').keccak_256

const TYPED_MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    types: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {type: 'string'},
            type: {type: 'string'}
          },
          required: ['name', 'type']
        }
      }
    },
    primaryType: {type: 'string'},
    domain: {type: 'object'},
    message: {type: 'object'}
  },
  required: ['types', 'primaryType', 'domain', 'message']
}

export function * handle (payload, jwt) {
  const request = {}
  if (payload.iss) {
    request.client_id = payload.iss
  } else {
    throw new Error('No Issuer in request jwt')
  }

  if (payload.typedData) {
    request.typedData = payload.typedData
  } else {
    throw new Error('No data in request jwt')
  }

  if (payload.riss) {
    request.target = payload.riss
  } else {
    request.target = yield select(currentAddress)
  }

  if (payload.callback) {
    request.callback_url = payload.callback
  }
  request.network = payload.net ? payload.net : '0x1'
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

export function * authorize (request) {
  try {
    //yield put(startWorking('tx'))
    const deviceAddress = yield select(deviceAddressForAddress, request.target)
    const level = yield select(securityLevelForAddress, deviceAddress)
    if (autoPrompt(level)) {
      return yield signTypedData(request)
    }

    const authorized = yield call(askForAuthorization, 'Sign Transaction?')

    if (authorized) {
      yield put(track('txRequest Authorized', request))
      return yield signTypedData(request)
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

export function * signTypedData (request, signerType) {
  try {
    const data = request.typedData
    const settings = yield select(networkSettingsForAddress, request.target)

    if (!signerType) {
      signerType = settings.signerType ? settings.signerType : 'keypair'
      console.log('signerType:', signerType)
    }
    const sanitizedData = yield sanitizeData(data)
    const parts = [Buffer.from('1901', 'hex')]

    parts.push(hashStruct('EIP712Domain', data.domain, data.types))
    parts.push(hashStruct(sanitizedData.primaryType, sanitizedData.message, sanitizedData.types))
    const unsigned = Buffer.concat(parts)
    const signer = yield select(nativeSignerForAddress, request.signer)
    const signature = yield cps(signer.signTypedData, unsigned)
    const payload = {
      type: 'eip712Resp',
      request: request.typedData,
      signature
     }

    const target = request.target
    const legacyClient = request.client_id && !request.client_id.match(/did:/)
    const issuer = request.riss || !legacyClient && !request.target.match(/did:/) ? `did:uport:${request.target}` : request.target
    const token = yield call(createToken, target, payload, { expiresIn: false, issuer })
    yield put(updateActivity(request.id, {authorizedAt: new Date().getTime()}))
    return {typedDataSig: token}
  } catch (e) {
    console.log(e)
  }
}

function * sanitizeData (data) {
  const sanitizedData = {}
  for (const key in TYPED_MESSAGE_SCHEMA.properties) {
    data[key] && (sanitizedData[key] = data[key])
  }
  return sanitizedData
}

export function hashStruct (primaryType, data, types) {
  const encodedData = encodeData(primaryType, data, types)
  return Buffer.from(keccak(encodedData).slice(2), 'hex')
}

export function encodeData (primaryType, data, types) {
  const encodedTypes = ['bytes32']
  const encodedValues = [hashType(primaryType, types)]
  for (const field of types[primaryType]) {
    let value = data[field.name]
    if (value !== undefined) {
      if (field.type === 'string' || field.type === 'bytes') {
        encodedTypes.push('bytes32')
        value = keccak(value)
        encodedValues.push(value)
      } else if (types[field.type] !== undefined) {
        encodedTypes.push('bytes32')
        value = keccak(encodeData(field.type, value, types))
        encodedValues.push(value)
      } else if (field.type.lastIndexOf(']') === field.type.length - 1) {
        throw new Error('Arrays currently unimplemented in encodeData')
      } else {
        encodedTypes.push(field.type)
        encodedValues.push(value)
      }
    }
  }
  return ethAbi.rawEncode(encodedTypes, encodedValues)
}

export function hashType (primaryType, types) {
  return keccak(encodeType(primaryType, types))
}

/**
   * Encodes the type of an object by encoding a comma delimited list of its members
   *
   * @param {string} primaryType - Root type to encode
   * @param {Object} types - Type definitions
   * @returns {string} - Encoded representation of the type of an object
   */
function encodeType (primaryType, types) {
  let result = ''
  let deps = findTypeDependencies(primaryType, types).filter(dep => dep !== primaryType)
  deps = [primaryType].concat(deps.sort())
  for (const type of deps) {
    const children = types[type]
    if (!children) {
      throw new Error(`No type definition specified: ${type}`)
    }
    result += `${type}(${types[type].map(({ name, type }) => `${type} ${name}`).join(',')})`
  }
  return result
}

  /**
   * Finds all types within a type defintion object
   *
   * @param {string} primaryType - Root type
   * @param {Object} types - Type definitions
   * @param {Array} results - current set of accumulated types
   * @returns {Array} - Set of all types found in the type definition
   */
function findTypeDependencies (primaryType, types, results = []) {
  if (results.includes(primaryType) || types[primaryType] === undefined) { return results }
  results.push(primaryType)
  for (const field of types[primaryType]) {
    for (const dep of findTypeDependencies(field.type, types, results)) {
      !results.includes(dep) && results.push(dep)
    }
  }
  return results
}

function keccak (val) {
  return `0x${keccak256(val)}`
}

export default {
  authorize: signTypedData,
  handle
}
