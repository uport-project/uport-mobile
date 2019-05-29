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
import { put, call, select } from 'redux-saga/effects'
import { web3ForAddress } from 'uPortMobile/lib/selectors/chains'
import { fetchFuel, fetchGasPrice, waitForTransactionReceipt } from './blockchain'
import { networksByName } from '../utilities/networks'
import { waitUntilConnected } from './networkState'
import {
  saveMessage, saveError
} from 'uPortMobile/lib/actions/processStatusActions'
import BN from 'bn.js'

// const MINIMUM_BALANCE = new BN('150000000000000000', 10)

export function* relayTransaction(metaSignedTx, settings, nonce) {
  try {
    const token = settings.fuelToken
    if (nonce) {
      nonce = nonce.toString(16)
    }
    if (token) {
      const networkPresets = networksByName[settings.network]
      yield call(waitUntilConnected)
      const response = yield call(fetch, settings.relayUrl || networkPresets.relayUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.fuelToken}`
        },
        body: JSON.stringify({metaSignedTx, blockchain: settings.network, metaNonce: nonce})
      })
      const responseJson = yield call(response.json.bind(response))
      if (responseJson.status == 'success') {
        return responseJson.data
      } else {
        console.log('error in txRelaying')
        yield put(saveError('tx', responseJson.message))
      }
    }
  } catch (error) {
    console.log('error in relayTransaction')
    console.log(error)
  }
}

export function* maybeRefuel (tx, settings) {
  try {
    const token = settings.fuelToken
    if (token) {
      const fuel = yield fetchFuel({address: settings.address})
      const gasPrice = yield fetchGasPrice({address: settings.address})
      const gasLimit = new BN('3000000', 10)
      const minimum = gasPrice.mul(gasLimit)
      if (fuel.lte(minimum)) {
        yield put(saveMessage('tx', 'Requesting gas...'))
        console.log(`fuel (${fuel}) minimum balance ${minimum.toString()}. We need to refuel?`)
        yield refuel(tx, settings)
      } else {
        // console.log(`refueling not necessary ${fuel} >= ${MINIMUM_BALANCE}`)
      }
    }
    // console.log(`calling signer callback for ${tx}`)
  } catch (error) {
    console.log('error in maybeRefuel')
    console.log(error)
  }
}

function* refuel (tx, {address, network, fuelToken, faucetUrl}) {
  const networkPresets = networksByName[network]
  // console.log('perform refuel')
  const web3 = yield select(web3ForAddress, address)
  // console.log(`calling ${faucetUrl || networkPresets.faucetUrl}`)
  // console.log({tx, blockchain: network, fuelToken})
  // console.log(web3.currentProvider)
  yield call(waitUntilConnected)
  const response = yield call(fetch, faucetUrl || networkPresets.faucetUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${fuelToken}`
    },
    body: JSON.stringify({tx, blockchain: network})
  })
  const responseJson = yield call(response.json.bind(response))
  // console.log(responseJson)
  if (response.status === 200) {
    yield put(saveMessage('tx', 'Confirming gas...'))
    yield waitForTransactionReceipt(web3, responseJson.message.txHash)
    yield put(saveMessage('tx', 'Sending...'))
    // console.log(`tx ${responseJson.message.txHash} mined`)
  } else {
    yield put(saveError('tx', responseJson.message.slice(0, 40)))
    console.log(responseJson.message)
  }
}
