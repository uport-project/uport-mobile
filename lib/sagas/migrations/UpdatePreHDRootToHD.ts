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
import { all, takeEvery, call, select, put } from 'redux-saga/effects'
import {
  addressFor,
  encryptionPublicKey,
  DEFAULT_LEVEL
} from 'uPortMobile/lib/sagas/keychain'
import { 
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import {
  startWorking,
  saveMessage,
  failProcess,
  completeProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import {
  hdRootAddress
} from 'uPortMobile/lib/selectors/hdWallet'
import {
  currentAddress
} from 'uPortMobile/lib/selectors/identities'
import {
  fuelTokenForAddress,
  deviceAddress,
  networkSettings
} from 'uPortMobile/lib/selectors/chains'
import {
  updateIdentity
} from 'uPortMobile/lib/actions/uportActions'
import { connected, waitUntilConnected } from 'uPortMobile/lib/sagas/networkState'
import { createToken } from 'uPortMobile/lib/sagas/jwt'

const step = MigrationStep.UpdatePreHDRootToHD

export const FETCH_FUEL_TOKEN_ROUTE = 'https://api.uport.me/nisaba/newDeviceKey'

export function * fetchFuelToken (parent: string, deviceAddress: string) : any {
  try {
    yield put(startWorking('fetchFuelToken'))
    yield put(saveMessage('fetchFuelToken', 'Fetching new fuel token'))
    yield call(waitUntilConnected)
    const fuelToken = yield select(fuelTokenForAddress, parent)
    if (!fuelToken) {
      yield put(failProcess('fetchFuelToken', 'You do not have a valid fuel token'))
      return false
    }
    // TODO check in with Andres for proper API
    const requestToken = yield call(createToken, parent, {newDeviceKey: deviceAddress})
    const response = yield call(fetch, FETCH_FUEL_TOKEN_ROUTE, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fuelToken}`
      },
      body: JSON.stringify({requestToken})})
    const responseJson = yield call(response.json.bind(response))
    if (response.status === 200) {
      yield put(completeProcess('fetchFuelToken'))
      return responseJson.data
    } else {
      yield put(failProcess('fetchFuelToken', 'Unable to request fueltoken')) // TODO discuss and maybe do Funcaptch as a failure case
      return false
    }
  } catch (error) {
    yield put(failProcess('fetchFuelToken', "Can't connect to verification service"))
    return false
  }
}

function * migrate () : any {
  try {
    // TODO update fuel token, also why is device not the same as root
    const address = yield select(currentAddress)
    const parent = yield select(deviceAddress)
    const root = yield select(hdRootAddress)
    const kp = yield call(addressFor, 0, 0)
    if (root !== kp.address) {
      yield put(failProcess(step, 'Incorrect device address returned'))
      return false  
    }
    const publicEncKey = yield call(encryptionPublicKey, {idIndex: 0, actIndex: 0})
    const fuelToken = yield call(fetchFuelToken, address, kp.address)
    if (!fuelToken) {
      yield put(failProcess(step, 'could not create new fuel token'))
      return false  
    }
    const preMigration = yield select(networkSettings)
    yield put(updateIdentity(address, {deviceAddress: kp.address, publicKey: kp.publicKey, publicEncKey, hdindex: 0, securityLevel: DEFAULT_LEVEL, fuelToken, preMigration, nonce: 0}))
    yield put(saveMessage(step, 'Updated Internal Identity Record'))
    return true  
  } catch (error) {
    yield put(failProcess(step, error.message))
    return false
  }
}

export default migrate
