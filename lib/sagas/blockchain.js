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
import { takeEvery, call, cps, select, put, all } from 'redux-saga/effects'
import { connected, waitUntilConnected } from './networkState'
// import coder from 'uPortMobile/lib/browserified/coder'

import { FETCH_NONCE, FETCH_BALANCE, FETCH_FUEL_BALANCE, REFRESH_SETTINGS, FETCH_RECOVERY_NONCE, SWITCH_IDENTITY } from 'uPortMobile/lib/constants/UportActionTypes'
import { FETCH_GAS_PRICE, ANALYZE_ADDRESS } from 'uPortMobile/lib/constants/NetworkingActionTypes'

import { saveNonce, saveMetaNonce, saveBalance, saveFuel, storeExternalUport } from 'uPortMobile/lib/actions/uportActions'
import { saveGasPrice } from 'uPortMobile/lib/actions/networkingActions'
import {
  startWorking, stopWorking, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import { networks, decodeAddress } from 'uPortMobile/lib/utilities/networks'
import { identityByAddress } from 'uPortMobile/lib/selectors/identities'
import { currentNonce, defaultWeb3, web3ForAddress, web3ForNetwork, currentNetwork, deviceAddressForAddress, txRelayAddressForAddress } from 'uPortMobile/lib/selectors/chains'
import { decodeEvent } from 'ethjs-abi/dist/ethjs-abi.min.js'

import { wei2eth } from 'uPortMobile/lib/helpers/conversions'

import { TxRelay } from 'uport-identity'
import BN from 'bn.js'
const Eth = require('ethjs/dist/ethjs.min.js')

const txRelayAbi = TxRelay.v2.abi

// const MAX_GAS_PRICE = 25000000000

// Utilities for interacting with the Blockchain

export function extractSettings (address) {
  let matches = address.match('did:ethr:(0x[a-fA-F0-9]{40})')
  if (matches) {
    return { address: matches[1], network: networks['0x1'] }
  }
  matches = address.match('did:uport:(.+)')
  const settings = decodeAddress(matches ? matches[1] : address)
  settings.network = networks[settings.network]
  return settings
}

// When passed a txHash it returns the receipt once mined
export function * waitForTransactionReceipt (web3, txHash, network = null) {
  if (!txHash) return
  console.log(`waiting for ${txHash} to mine`)
  // console.log(web3.currentProvider)
  // console.tron.log(`waiting for ${txHash} to mine`)
  let attempts = 0
  while (attempts < 180) {
    // console.log(`attempt: ${attempts}`)
    // console.tron.log(`attempt: ${attempts}`)
    yield waitUntilConnected()
    try {
      // console.log('getTransactionReceipt')
      const receipt = yield call(web3.getTransactionReceipt, txHash)
      // console.log(receipt)
      if (receipt && receipt.blockHash) return receipt
    } catch (error) { console.log('error during waitForTransactionReceipt') }
    yield call(delay, 5000)
    attempts++
  }
}

// Given a transaction receipt and an array of ABI types, it returns the decoded value of an event
// TODO check the event type
export function extractEventFromReceipt (receipt, eventAbi, index = 0) {
  let log = receipt.logs[index]
  return decodeEvent(eventAbi, log.data, log.topics)
}

export function * fetchBalance ({address}) {
  try {
    if (!address) return
    const isConnected = yield connected()
    if (isConnected) {
      yield put(startWorking('balance'))
      const settings = extractSettings(address)
      const web3 = yield select(web3ForAddress, address)
      console.log(`fetching balance of ${address}`)
      // console.tron.log(`fetching balance of ${settings.address}`)
      const balance = yield call(web3.getBalance, settings.hexaddress || settings.address)
      const spotPrice = yield call(fetchEthSpotPrice)
      const usdBalance = wei2eth(balance) * spotPrice
      yield put(saveBalance(address, balance.toString(10), usdBalance))
      yield put(stopWorking('balance'))
      return balance
    }
  } catch (error) {
    console.log('error in fetchBalance')
    console.log(error)
  }
}

export function * fetchFuel ({address}) {
  try {
    if (!address) return
    const deviceAddress = yield select(deviceAddressForAddress, address)
    const isConnected = yield connected()
    if (isConnected && address) {
      yield put(startWorking('fuel'))
      console.log(`fetching fuel for ${address}`)
      const web3 = yield select(web3ForAddress, address)

      // console.tron.log(`fetching fuel for ${address}`)
      const fuel = yield call(web3.getBalance, deviceAddress)
      yield put(saveFuel(address, fuel))
      yield put(stopWorking('fuel'))
      return fuel
    }
  } catch (error) {
    console.log('error in fetchFuel')
    console.log(error)
  }
}

export function * fetchGasPrice ({address}) {
  try {
    if (!address) return
    const isConnected = yield connected()
    if (!isConnected) return
    // console.log(`fetching gasPrice for ${address}`)
    yield put(startWorking('gasPrice'))
    // console.tron.log('fetching gasPrice')
    const web3 = yield select(web3ForAddress, address)
    // console.log(web3.currentProvider)
    const price = yield call(web3.gasPrice)
    // console.log(`network gasPrice: ${price.toNumber()}`)
    // console.log(`MAX_GAS_PRICE: ${MAX_GAS_PRICE}`)
    // Due to spam attacks on ropsten I'm not capping it now
    // const boundPrice = Math.min(MAX_GAS_PRICE, price.toNumber())
    // console.log(`Using gasPrice: ${boundPrice}`)
    console.log(`gasPrice: ${price.toString()}`)
    yield put(saveGasPrice(price.toString(16)))
    yield put(stopWorking('gasPrice'))
    return price
  } catch (error) {
    console.log('error in fetchGasPrice')
    console.log(error)
  }
}

export function * fetchNonce ({address}) {
  try {
    if (!address) return
    const deviceAddress = yield select(deviceAddressForAddress, address)
    const isConnected = yield connected()
    if (isConnected && address) {
      const web3 = yield select(web3ForAddress, address)
      console.log(`fetching nonce for ${address}`)
      const nonce = yield call(web3.getTransactionCount, deviceAddress)
      return nonce.toNumber()
    }
  } catch (error) {
    yield put(failProcess('nonce', error.message))
    console.log('fetchNonce', error)
  }
}

export function * resolveNonce ({address}) {
  try {
    yield put(startWorking('nonce'))
    let nonce = yield call(fetchNonce, {address})
    let localNonce = yield select(currentNonce, address)
    if (localNonce > nonce) {
      nonce = localNonce
    }
    yield put(saveNonce(address, nonce))
    yield put(stopWorking('nonce'))
    return nonce
  } catch (error) {
    console.log('resolveNonce', error)
    yield put(failProcess('nonce', error.message))
  }
}

export function * fetchMetaNonce ({ address, deviceAddress }) {
  try {
    if (!address) return
    const isConnected = yield connected()
    if (isConnected && address) {
      yield put(startWorking('metanonce'))
      const web3 = yield select(web3ForAddress, address)
      console.log(`fetching TxRelay nonce for ${address}`)

      let txRelayAddress = yield select(txRelayAddressForAddress, address)
      const txRelay = web3.contract(txRelayAbi).at(txRelayAddress)

      const nonce = (yield call(txRelay.getNonce, deviceAddress))[0].toNumber()
      yield put(stopWorking('metanonce'))
      return nonce
    }
  } catch (error) {
    yield put(failProcess('metanonce', error.message))
    console.log('metanonce', error)
  }
}

export function * resolveMetaNonce ({ address, deviceAddress, metaNonce }) {
  try {
    // Fetch on-chain nonce (number of tx's confirmed)
    let nonce = yield call(fetchMetaNonce, {address, deviceAddress})
    // If local metaNonce is undefined then use network nonce
    // local metaNonce must be greater than network nonce && be younger than 20 seconds to be used
    if (metaNonce !== undefined && metaNonce.nonce > nonce && ((Date.now() / 1000) - (metaNonce.timestamp / 1000) < 20)) {
      nonce = metaNonce.nonce
    }
    return nonce
  } catch (error) {
    console.log(error)
  }
}

export function * fetchRecoveryNonce ({recoveryAddress}) {
  try {
    if (!recoveryAddress) return
    const isConnected = yield connected()
    if (isConnected && recoveryAddress) {
      yield put(startWorking('nonce'))
      const web3 = yield select(defaultWeb3)
      console.log(`fetching nonce for ${recoveryAddress}`)

      // console.tron.log(`fetching nonce for ${address}`)
      const nonce = yield call(web3.getTransactionCount, recoveryAddress)
      yield put(saveNonce(recoveryAddress, nonce.toNumber()))
      yield put(stopWorking('nonce'))
      return nonce
    }
  } catch (error) {
    console.log('error in fetchRecoveryNonce')
    console.log(error)
  }
}

// checks an address if it's a contract and any other information
export function * analyzeAddress ({address}) {
  console.log('analyzeAddress', {address})

  try {
    if (!address) return
    const settings = extractSettings(address)
    const web3 = yield select(web3ForNetwork, settings.name)
    const identity = yield select(identityByAddress, address)
    let validated = identity && identity._validated
    if (validated || validated === false) return
    if (!identity || !identity.hasOwnProperty('contract')) {
      const code = yield call(web3.getCode, settings.address, 'latest')
      const contract = (code && code !== '0x')
      yield put(storeExternalUport(address, {_contract: contract}))
      if (contract) {
        validated = true
      } else {
        const nonce = yield call(web3.getTransactionCount, settings.address, 'latest')
        if (nonce > 0) {
          yield put(storeExternalUport(address, {_nonce: nonce}))
          validated = true
        }
      }
    }
    if (validated) {
      yield put(storeExternalUport(address, {_network: settings.network, _validated: true}))
    } else {
      yield put(storeExternalUport(address, {_validated: false}))
    }
  } catch (error) {
    console.log('error in analyzeAddress')
    console.log(error)
  }
}

export function * fetchEthSpotPrice () {
  try {
    const response = yield call(fetch, 'https://api.infura.io/v1/ticker/ethusd', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    const responseJson = yield call(response.json.bind(response))
    return responseJson.ask
  } catch (error) {
    console.log('error in fetchEthSpotPrice')
    console.log(error)
  }
}

// export function* faucet ({address}) {
//   const isConnected = yield connected()
//   if (!isConnected) return
//   try {
//     yield put(startWorking('faucet'))
//     const settings = yield select(networkSettings)
//     yield put(saveMessage('faucet', 'Calling faucet'))
//     const response = yield call(fetch, `http://faucet.ropsten.be:3001/donate/${settings.address}`, {
//       headers: {
//         'Accept': 'application/json'
//       }
//     })
//     const responseJson = yield call(response.json.bind(response))
//     console.log(responseJson)
//     if (response.status === 200) {
//       if (responseJson.txhash) {
//         const web3 = yield select(web3ForAddress, address)
//         yield put(saveMessage('faucet', 'Waiting to mine'))
//         yield waitForTransactionReceipt(web3, responseJson.txhash)
//         yield fetchBalance()
//         yield put(clearMessage('faucet'))
//       } else {
//         yield put(saveMessage('faucet', 'Queued'))
//         yield call(delay, 60000)
//         yield fetchBalance()
//         yield put(clearMessage('faucet'))
//       }
//     } else {
//       console.log(responseJson.message)
//       yield put(saveError('faucet', responseJson.message))
//     }
//   } catch (error) {
//     console.log('error calling faucet')
//     console.log(error)
//     yield put(saveError('faucet', 'error calling faucet'))
//   }
//   yield put(stopWorking('faucet'))
// }

export function * fetchAllSettings ({address}) {
  if (!address) return
  if (address.match('^did:')) return
  console.log(`fetchAllSettings ${address}`)
  yield waitUntilConnected()
  try {
    yield all([
      fetchFuel({address}),
      resolveNonce({address}),
      fetchBalance({address}),
      fetchGasPrice({address})
    ])
  } catch (e) {
    console.log('error in fetchAllSettings')
    // console.tron.log('error in fetchAllSettings')
    console.log(e)
    // console.tron.log(e)
  }
}

export function * checkRpcNetwork (rpcUrl) {
  try {
    yield put(startWorking('checkRpc'))
    const eth = new Eth(new Eth.HttpProvider(rpcUrl))
    const net = yield call(eth.net_version)
    yield put(stopWorking('checkRpc'))
    if (net) {
      return `0x${new BN(net).toString(16)}`
    }
  } catch (error) {
    yield put(failProcess('checkRpc', error.message))
  }
}

function * blockchainSaga () {
  yield all([
    takeEvery(FETCH_NONCE, resolveNonce),
    takeEvery(FETCH_RECOVERY_NONCE, fetchRecoveryNonce),
    takeEvery(FETCH_GAS_PRICE, fetchGasPrice),
    takeEvery(FETCH_BALANCE, fetchBalance),
    takeEvery(FETCH_FUEL_BALANCE, fetchFuel),
    takeEvery([REFRESH_SETTINGS, SWITCH_IDENTITY], fetchAllSettings),
    // takeEvery(CALL_FAUCET, faucet),
    takeEvery(ANALYZE_ADDRESS, analyzeAddress)
  ])
}

export default blockchainSaga
