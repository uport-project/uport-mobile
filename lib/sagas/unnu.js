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
import { takeEvery, call, put, select, all } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { web3ForNetwork } from 'uPortMobile/lib/selectors/chains'
import {
  saveMessage, startWorking, completeProcess, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import { networksByName } from 'uPortMobile/lib/utilities/networks'
import { waitUntilConnected } from './networkState'
import UportContracts from 'uport-identity'
const MNID = require('mnid')

const UNNU_ENDPOINT = 'https://api.uport.me'

export const LOOKUP_ENDPOINT = UNNU_ENDPOINT + '/unnu/lookup'

function errorMessage (response) {
  switch (response.status) {
    case 500:
      return 'Server Error'
    case 403:
      return 'Authentication Error'
    case 404:
      return 'Selected blockchain not available'
    default:
      return `Server error ${response.status}`
  }
}

export function * lookupAccount ({deviceAddress}) {
  yield put(startWorking('unnu'))
  const identity = {deviceAddress}
  try {
    yield put(saveMessage('unnu', 'Looking up identity'))
    yield call(waitUntilConnected)
    const response = yield call(fetch, LOOKUP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({deviceKey: deviceAddress})
    })
    if (response.status === 200) {
      const responseJson = yield call(response.json.bind(response))
      // console.log(responseJson)
      const net = networksByName[responseJson.data.blockchain || 'rinkeby'].network_id
      identity.hexaddress = responseJson.data.identity
      identity.network = responseJson.data.blockchain || 'rinkeby'
      identity.address = MNID.encode({network: net, address: identity.hexaddress})
      identity.identityManagerAddress = responseJson.data.managerAddress
      identity.controllerAddress = responseJson.data.managerAddress
      identity.txRelayAddress = UportContracts.TxRelay.v2.networks[parseInt(net.slice(2), 16)].address
      identity.signerType = responseJson.data.managerType || 'MetaIdentityManager'
      yield put(completeProcess('unnu'))
      return identity
    } else {
      yield put(failProcess('unnu', errorMessage(response)))
    }
  } catch (e) {
    // console.log(e)
    yield put(failProcess('unnu', 'Error looking up identity'))
  }
}

function * unnuSaga () {
  yield all()
}

export default unnuSaga
