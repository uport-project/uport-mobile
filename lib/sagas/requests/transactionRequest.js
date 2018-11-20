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
import { Alert, Vibration } from 'react-native'
import { delay } from 'redux-saga'
import { call, put, spawn, fork, cps, select } from 'redux-saga/effects'
import { incNonce, updateActivity, updateInteractionStats, storeConnection, saveMetaNonce, refreshSettings } from 'uPortMobile/lib/actions/uportActions'
import { handleURL } from 'uPortMobile/lib/actions/requestActions'
import {
  saveMessage, clearMessage, startWorking, stopWorking
} from 'uPortMobile/lib/actions/processStatusActions'

import { errorMessage } from 'uPortMobile/lib/selectors/processStatus'
import { currentAddress, selectedIdentity, accountsForNetwork, accountForClientIdAndNetwork } from 'uPortMobile/lib/selectors/identities'
import { fetchRequest, externalProfile } from 'uPortMobile/lib/selectors/requests'
import {
  networkSettingsForAddress, web3ForAddress, proxySignerForAddress,
  identityManagerSignerForAddress, metaIdentityManagerSignerForAddress, metaTxMIMSignerForAddress,
  deviceSignerForAddress, securityLevelForAddress, deviceAddressForAddress, nativeSignerForAddress,
  gasPrice
} from 'uPortMobile/lib/selectors/chains'
import { unconfirmedTransactions } from 'uPortMobile/lib/selectors/activities'
import { isMetaTxEnabled } from 'uPortMobile/lib/selectors/featureFlags'

import { analyzeAddress, waitForTransactionReceipt, resolveMetaNonce, fetchGasPrice, fetchEthSpotPrice } from '../blockchain'
import { refreshExternalUport } from '../persona'
import { maybeRefuel, relayTransaction } from '../sensui'
import { autoPrompt } from '../keychain'
import { connected, waitUntilConnected } from '../networkState'

import { waitForUX } from 'uPortMobile/lib/utilities/performance'
import { decodeAddress } from 'uPortMobile/lib/utilities/networks'
import EthSigner, { txutils } from 'eth-signer/dist/eth-signer-simple.js'
import * as _ from 'mori'
// import { openExternalUrl } from '../../helpers/url_handler'
import { Buffer } from 'buffer'
import { getFunctionName } from 'uPortMobile/lib/utilities/4bytes'
import askForAuthorization from 'uPortMobile/lib/helpers/authorize'
import S from 'string'
import BN from 'bn.js'
import { wei2eth } from 'uPortMobile/lib/helpers/conversions'
import { track } from 'uPortMobile/lib/actions/metricActions'
const coder = require('uPortMobile/lib/browserified/coder')
import { addMultipleVc } from '../vcSaga'

const MNID = require('mnid')

const GAS_LIMIT = 3000000

export function parseParam (param) {
  const results = param.match(/^(\w+) (.+)?$/)
  if (results != null && results.length >= 3) {
    const type = results[1]
    let value = results[2].match(/^"?(.*[^"])"?$/)[1]
    if (type.match(/^bytes/)) {
      if (value.match(/^0x[0-9a-fA-F]*$/)) {
        value = new Buffer(strip0x(value), 'hex').toString('binary')
      } else {
        value = new Buffer(value).toString('binary')
      }
    }
    // TODO do proper error handling here and return show error in app if there is a problem
    return [type, value]
  }
}

export function toHexNumber (value) {
  if (value.match(/^0x[0-9a-f]*$/)) {
    return value
  }
  if (value.match(/^[0-9]*$/)) {
    return `0x${new BN(value, 10).toString('hex')}`
  }
}

export function parseFunctionCall (fn) {
  if (fn == null) {
    return
  }
  const params = fn.match(/(\w+)\((.*)\)/)
  const name = params[1]
  const pairs = _.map((p) => parseParam(p), params[2] === '' ? [] : params[2].split(/\s*,\s*/))
  const types = _.intoArray(_.map(_.first, pairs))
  const args = _.intoArray(_.map((p) => p[1], pairs))
  return {name: name, types: types, args: args}
}

// use for parsing fn definitions without values
export function parseFunctionCallSig (fn, data) {
  if (fn == null) {
    return
  }
  const params = fn.match(/(\w+)\((.*)\)/)
  const name = params[1]
  const types = params[2] && params[2] !== '' ? params[2].split(/,/) : []
  const args = data && types.length > 0 ? coder.decodeParams(types, data.slice(10)).map((c) => c.toString()) : null
  return { name, types, args }
}

export function encodeFunctionCall (abi) {
  if (abi) {
    return txutils._encodeFunctionTxData(abi.name, abi.types, abi.args)
  }
}

export function humanize (abi) {
  return S(abi.name).humanize().s
}

function strip0x (data) {
  if (data) {
    if (data.slice(0, 2) === '0x') {
      return data.slice(2)
    } else {
      return data
    }
  }
}

export function * deploymentRequest (request, url) {
  const data = url.pathname.split('/')[1]
  if (!data) return
  request.data = data
  request.to = '0x0'
  request.from = request.target
  yield put(updateActivity(request.id, request))
  yield put(track('txRequest Deployment', request))
  return request
}

function * findTarget (request, client_id) {
  if (request.network) {
    if (client_id) {
      const account = yield select(accountForClientIdAndNetwork, request.network, client_id)
      if (account) return account.address
    }
    if (request.target) {
      const userNetworkId = decodeAddress(request.target).network
      const exists = yield select(selectedIdentity, request.target)
      if (exists && userNetworkId === request.network) {
        return request.target
      }
    }
    const current = yield select(currentAddress)
    if (current) {
      const userNetworkId = decodeAddress(current).network
      if (userNetworkId === request.network) {
        return current
      }
    }
    const identities = yield select(accountsForNetwork, request.network)
    if (identities.length === 0) {
      let props = { request, error: 'You do not have an account supporting this network' }
      yield put(track('txRequest Error', props))
      return yield put(updateActivity(request.id, props.error))
    }
    return identities[0].address
  }
  let props = { error: `incorrect network ${request.network}`, network: request.network, to: request.to, message: `Incorrect network in transaction ${request.network}` }
  yield put(updateActivity(request.id, {error: props.error}))
  yield put(track('txRequest Error', props))
}

export function * handle (payload, jwt, id) {
  const decoded = MNID.isMNID(payload.to) ? decodeAddress(payload.to) : undefined
  const request = {
    client_id: payload.iss,
    to: decoded ? decoded.address : payload.to,
    id
  }
  
  if (payload.vc) {
    yield(fork(addMultipleVc, payload.vc))
  }

  if (payload.net || decoded) {
    request.network = payload.net || (decoded ? decoded.network : undefined)
  }

  if (payload.callback) request.callback_url = payload.callback
  if (payload.value) request.value = new BN(payload.value.slice(2), 'hex').toNumber()

  if (payload.from) {
    let target
    if (MNID.isMNID(payload.from)) {
      target = payload.from
    } else {
      target = MNID.encode({address: payload.from, network: request.network})
    }
    const exists = yield select(selectedIdentity, target)
    if (exists) {
      request.target = target
      yield put(refreshSettings(target))
    } else {
      return {...request, error: `The provided from account ${target} does not exist in your wallet`}
    }
  } else {
    const segregated = yield select(accountForClientIdAndNetwork, request.network, request.client_id)
    if (segregated) {
      request.target = segregated.address
    } else {
      const current = yield select(currentAddress)
      if (current && decodeAddress(current).network === request.network) {
        request.target = current
      } else {
        const identities = yield select(accountsForNetwork, request.network)
        if (identities.length === 0) {
          const error = `You do not have an account supporting network (${request.network})`
          yield put(track('txRequest Error', { request, error }))
          return {...request, error}
        }
        request.target = identities[0].address
      }
    }
  }

  if (payload.net && decoded && payload.net !== decoded.network) {
    request.error = `Network requested (${payload.net}) is not the same as encoded in to address ${payload.to}`
  }
  if (request.error) return request

  const mnid = MNID.isMNID(payload.to) ? payload.to : MNID.encode({ address: payload.to, network: payload.net })

  yield fork(analyzeAddress, {address: mnid})
  // console.log(`ethereum Signing Request value is: ${request.value}`)
  if (payload.fn) {
    request.abi = parseFunctionCall(payload.fn)
    request.fn = payload.fn
    request.data = encodeFunctionCall(request.abi)
  } else if (payload.data) {
    request.data = payload.data
  }
  if (request.data) {
    request.fnSig = strip0x(request.data).slice(0, 8)
  }
  if (payload.gas) {
    request.gasLimit = new BN(payload.gas.slice(2), 'hex').toNumber()
  }

  if (payload.gasPrice) {
    request.gasPrice = new BN(payload.gasPrice.slice(2), 'hex').toNumber()
  }

  yield put(updateInteractionStats(request.target, payload.to, 'request'))

  if (request.client_id) {
    // yield put(updateInteractionStats(request.client_id, 'request'))
    yield fork(refreshExternalUport, {clientId: request.client_id})
  }

  if (!request.abi && request.fnSig) {
    yield spawn(check4Bytes, request)
  }
  let gas = yield call(estimateGas, request)
  if (gas) {
    request.gas = gas
    const gasPrice = yield call(fetchGasPrice, {address: request.target})
    if (gasPrice) {
      let txCostProps = {gas: gas}
      const gasCostWei = gas.mul(gasPrice)
      const gasCost = yield wei2eth(gasCostWei)
      txCostProps.gasCost = request.gasCost = gasCost
      const spotPrice = yield call(fetchEthSpotPrice)
      if (spotPrice) {
        request.ethSpotPrice = txCostProps.spotPrice = spotPrice
      }
      yield put(updateActivity(request.id, txCostProps))
    }
  }
  return request
}

// silent are for certain internal transactions to be signed without user interaction (automatic update of public profile)
export function * handleLegacy (request, url) {
  if (url.pathname.match(/^\/?deploy\//)) {
    return yield deploymentRequest(request, url)
  }
  // console.log(url.pathname)
  const decoded = decodeAddress(url.pathname)
  request.network = decoded.network
  request.to = decoded.address
  const params = url.query || {}
  request.target = yield call(findTarget, request, params.client_id)
  if (!request.target) return
  const from = request.target

  if (params.callback_url) request.callback_url = params.callback_url
  if (params.value) request.value = toHexNumber(params.value)
  // console.log(`ethereum Signing Request value is: ${request.value}`)
  if (params['function']) {
    request.abi = parseFunctionCall(params['function'])
    request.fn = params['function']
    request.data = encodeFunctionCall(request.abi)
  } else if (params.bytecode) {
    request.data = encodeFunctionCall(request.abi) || params['bytecode']
  }
  if (request.data) {
    request.fnSig = strip0x(request.data).slice(0, 8)
    // console.log(`fnSig: ${request.fnSig}`)
  }

  request.gasLimit = params.gas ? new BN(params.gas).toNumber() : null
  if (params.gasPrice) {
    request.gasPrice = params.gasPrice
  }
  if (params.client_id) {
    request.client_id = params.client_id
  }
  yield put(updateActivity(request.id, request))
  // Give the UX a chance to catch up
  yield call(waitForUX)
  yield put(updateInteractionStats(from, url.pathname, 'request'))

  if (request.client_id) {
    // yield put(updateInteractionStats(request.client_id, 'request'))
    yield fork(refreshExternalUport, {clientId: request.client_id})
  }

  if (!request.abi && request.fnSig) {
    yield spawn(check4Bytes, request)
  }
  const mnid = MNID.isMNID(url.pathname) ? url.pathname : MNID.encode({network: decoded.network, address: decoded.address})
  yield fork(analyzeAddress, {address: mnid})
  let gas = yield call(estimateGas, request)
  if (gas) {
    request.gas = gas
    const gasPrice = yield call(fetchGasPrice, {address: request.target})
    if (gasPrice) {
      let txCostProps = {gas: gas}
      const gasCostWei = gas.mul(gasPrice)
      const gasCost = yield wei2eth(gasCostWei)
      txCostProps.gasCost = request.gasCost = gasCost
      const spotPrice = yield call(fetchEthSpotPrice)
      if (spotPrice) {
        request.ethSpotPrice = txCostProps.ethSpotPrice = spotPrice
      }
      yield put(updateActivity(request.id, txCostProps))
    }
  }
  return request
}

export function * check4Bytes (request) {
  console.log('checking 4bytes')
  yield waitUntilConnected()
  const name = yield call(getFunctionName, request.fnSig)
  if (name) {
    const changes = {}
    // console.log(`Function is ${name}`)
    changes.abi = parseFunctionCallSig(name, request.data)
    // console.log(changes.abi)
    changes.fn = name
    yield put(updateActivity(request.id, changes))
  }
}

export function* estimateGas (request) {
  const web3 = yield select(web3ForAddress, request.target)
  const settings = yield select(networkSettingsForAddress, request.target)
  let from = settings.hexaddress || settings.address
  try {
    const gas = yield call(web3.estimateGas, {data: request.data, value: 0, to: request.to, from})
    return gas
  } catch (error) {
    console.log(`Error in estimateGas: ${error}`)
  }
}

function * buildTransaction (request, signerType) {
  const web3 = yield select(web3ForAddress, request.target)
  const settings = yield select(networkSettingsForAddress, request.target)

  const price = yield call(web3.gasPrice)
  let gasPrice = price ? `0x${price.toString(16)}` : `0x${new BN(20000000000).toString(16)}`
  let gas = GAS_LIMIT

  const metaTxEnabled = yield select(isMetaTxEnabled)
  let from = settings.hexaddress || settings.address
  
  // TODO: Using Local nonce again, has caused issues in the past
  // need to include some more defensive programming here
  let nonce = settings.nonce // yield call(web3.getTransactionCount, settings.deviceAddress)

  switch (signerType) {
    case 'device':
      from = settings.deviceAddress
      break
    case 'KeyPair':
      from = settings.hexaddress
      gasPrice = request.gasPrice || gasPrice
      nonce = yield call(web3.getTransactionCount, settings.hexaddress)
      const txObj = { to: request.to === '0x0' ? undefined : request.to, from, nonce: nonce, data: request.data, value: request.value }
      const estimatedGas = yield call(web3.estimateGas, txObj)
      gas = estimatedGas.toNumber() ? estimatedGas.toNumber() * 1.5 : GAS_LIMIT
      break
    case 'MetaIdentityManager':
      if (metaTxEnabled) {
        nonce = yield call(resolveMetaNonce, settings)
        // console.log('nonce ' + nonce)
      }
    case 'proxy':
    case 'IdentityManager':
      from = settings.address
      break
  }
  return {
    to: request.to === '0x0' ? undefined : request.to,
    from,
    nonce: nonce,
    data: request.data,
    value: request.value,
    gasPrice,
    gas: gas
  }
}

export function * handleTransactionMined (web3, requestId, txhash) {
  try {
    if (txhash) {
      // console.log(`Waiting for tx ${txhash} to be mined`)
      const receipt = yield waitForTransactionReceipt(web3, txhash)
      if (!receipt) {
        console.log(`Transaction ${txhash} not mined`)
        let props = { error: 'Transaction not mined', message: 'transaction was not mined' }
        yield put(updateActivity(requestId, { error: props.error }))
        yield put(track('txRequest Error', props))
        return
      }
      // console.log(receipt)
      let props = { blockNumber: receipt.blockNumber, status: receipt.status }
      yield put(updateActivity(requestId, props))
      yield put(track('txRequest Mined', props))
      Vibration.vibrate()
    } else {
      console.log('no hash available in request')
      let props = { error: 'No transaction hash available in request' }
      yield put(updateActivity(requestId, { error: props.error }))
      yield put(track('txRequest Error', props))
    }
  } catch (error) {
    console.log('error in handleTransactionMined')
    console.log(error)
    yield put(track('txRequest Error', error))
  }
}

export function * authorize (request) {
  try {
    yield put(startWorking('tx'))
    const deviceAddress = yield select(deviceAddressForAddress, request.target)
    const level = yield select(securityLevelForAddress, deviceAddress)
    if (autoPrompt(level)) {
      return yield signTransaction(request)
    }

    const authorized = yield call(askForAuthorization, 'Sign Transaction?')

    if (authorized) {
      yield put(track('txRequest Authorized', request))
      return yield signTransaction(request)
    } else {
      yield put(track('txRequest Unauthorized', request))
      yield put(clearMessage('tx'))
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

export function * sendingTimeout (id, ms = 180000) {
  try {
    yield call(delay, ms)
    const request = yield select(fetchRequest, id)
    if (request.error) return
    if (request.txhash) {
      if (!request.blockHash) {
        let props = { request, message: 'unconfirmedTransaction', error: 'Transaction could not be confirmed' }
        yield put(updateActivity(request.id, { error: props.error }))
        yield put(track('txRequest Error', props))
      }
    } else {
      let props = { request, message: 'txTimeout', error: 'Transaction sending timed out' }
      yield put(updateActivity(request.id, {error: props.error }))
      yield put(track('txRequest Error', props))
    }
    yield put(stopWorking('tx'))
  } catch (error) {
    console.log('Error in sendingTimeout')
    console.log(error)
  }
}

function * selectSigner (type, address) {
  const metaTxEnabled = yield select(isMetaTxEnabled)
  switch (type) {
    case 'device':
      const deviceSigner = yield select(deviceSignerForAddress, address)
      return new EthSigner.signer(deviceSigner)
    case 'KeyPair':
      const keypairSigner = yield select(nativeSignerForAddress, address)
      return new EthSigner.signer(keypairSigner)
    case 'IdentityManager':
      return yield select(identityManagerSignerForAddress, address)
    case 'MetaIdentityManager':
      if (metaTxEnabled) {
        return yield select(metaTxMIMSignerForAddress, address)
      } else {
        return yield select(metaIdentityManagerSignerForAddress, address)
      }
    default:
      return yield select(proxySignerForAddress, address)
  }
}

export function * signTransaction (request, signerType) {
  yield put(startWorking('tx'))
  try {
    let props = {authorizedAt: new Date().getTime()}
    yield put(saveMessage('tx', 'Sending...'))
    yield put(updateActivity(request.id, {authorizedAt: props.authorizedAt}))
    const isConnected = yield call(connected)
    if (!isConnected) {
      yield put(saveMessage('tx', 'Waiting for internet...'))
    }
    yield call(waitUntilConnected)
    yield put(saveMessage('tx', 'Sending...'))
    const settings = yield select(networkSettingsForAddress, request.target)
    if (!signerType) {
      signerType = settings.signerType ? settings.signerType : 'proxy'
      console.log('signerType:', signerType)
    }
    const unsigned = yield call(buildTransaction, request, signerType)
    const web3 = yield select(web3ForAddress, request.target)
    const signer = yield call(selectSigner, signerType, request.target)
    const signed = yield cps(signer.signTransaction.bind(signer), unsigned)

    const metaTxEnabled = yield select(isMetaTxEnabled)
    let txhash
    if (signerType === 'MetaIdentityManager' && metaTxEnabled) {
      txhash = yield call(relayTransaction, signed.slice(2), settings, unsigned.nonce)
      yield put(saveMetaNonce(settings.address, unsigned.nonce + 1, Date.now()))
    } else {
      if (signerType !== 'KeyPair') {
        yield maybeRefuel(signed, settings)
      }
      txhash = yield call(web3.sendRawTransaction, signed)
    }
    // console.log(`Sent ${txhash}`)
    // txTimeout.cancel()
    yield put(updateActivity(request.id, {txhash}))
    yield put(updateInteractionStats(request.target, request.to, 'sign'))
    yield put(saveMessage('tx', 'Confirming...'))
    // console.log(`sent transaction ${txhash}`)
    yield put(incNonce(request.target))
    yield put(stopWorking('tx'))
    yield spawn(handleTransactionMined, web3, request.id, txhash)
    yield put(storeConnection(request.target, 'contracts', request.to))
    const txDetails = {}
    if (request.client_id) {
      yield put(storeConnection(request.target, 'apps', request.client_id))
      txDetails.client_id = request.client_id
    }
    if (request.abi && request.abi.name) {
      txDetails.fn = request.abi.name
    }
    if (request.value) {
      txDetails.value = (request.value.toNumber ? request.value.toNumber() : request.value)
    }
    yield put(track(`txRequest Sign ${signerType}`, {props, txDetails, message: 'txSent'}))
    return { tx: txhash }
  } catch (e) {
    console.log('error signing transaction')
    console.log(e)
    console.log('message')
    console.log(e.message)
    console.log('value')
    console.log(e.value)
    const error = yield select(errorMessage, 'tx')
    if (request) {
      let props = { request, error: e.value ? e.value.message : e.message }
      yield put(updateActivity(request.id, {error: props.error }))
      yield put(track(`txRequest Error Sign ${signerType}`, props))
    }
    yield put(stopWorking('tx'))
    yield put(track(`txRequest Error Sign ${signerType}`, props))
    return {error: 'processing_error'}
  }
}

export function * requestFunctionCall (address, fn, label, popup = true) {
  yield put(handleURL(`me.uport:${address}?function=${encodeURIComponent(fn)}&label=${encodeURIComponent(label)}`), {postback: false, popup})
}

export function functionCallUrl (address, abi, args, label) {
  const abiWithArgs = Object.assign({}, abi)
  abiWithArgs.args = args
  const data = encodeFunctionCall(abiWithArgs)
  return `me.uport:${address}?bytecode=${encodeURIComponent(data)}&label=${encodeURIComponent(label)}`
}

export function * requestFunctionCallAsData (address, abi, args, label) {
  yield put(handleURL(functionCallUrl(address, abi, args, label)))
}

export function * signTransactionUrl (url, signerType) {
  const request = yield handleURL({url, popup: false})
  return yield signTransaction(request, signerType)
}

export function * signFunctionCall ({address, fn, label, signerType}) {
  return yield signTransactionUrl(`me.uport:${address}?function=${encodeURIComponent(fn)}&label=${encodeURIComponent(label)}`, signerType)
}

export function * checkOldPendingTransactions (address) {
  try {
    const transactions = yield select(unconfirmedTransactions, address)
    if (transactions.length === 0) return
    const web3 = yield select(web3ForAddress, address)
    for (let i in transactions) {
      const tx = transactions[i]
      const receipt = yield call(web3.getTransactionReceipt, tx[1])
      if (receipt && receipt.blockNumber) {
        yield put(updateActivity(tx[0], {blockNumber: receipt.blockNumber}))
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default {
  authorize,
  handleLegacy,
  handle
}
