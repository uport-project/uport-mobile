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
import { Alert, NativeModules } from 'react-native'
import { takeEvery, call, put, select, all, spawn } from 'redux-saga/effects'
import { RESET_IDENTITY, CREATE_IDENTITY, CREATE_ACCOUNT } from 'uPortMobile/lib/constants/UportActionTypes'
import { RESET_DEVICE } from 'uPortMobile/lib/constants/GlobalActionTypes'
import { currentIdentity } from 'uPortMobile/lib/selectors/identities'
import { hdAccountIndex, hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import { storeIdentity, storeSubAccount, removeIdentity, savePublicUport } from 'uPortMobile/lib/actions/uportActions'
import {
  startWorking, completeProcess
} from 'uPortMobile/lib/actions/processStatusActions'

// import { push } from 'uPortMobile/lib/actions/navigatorActions'
// import { setOnboardingNetwork } from 'uPortMobile/lib/actions/onboardingActions'

import { deviceAddress } from 'uPortMobile/lib/selectors/chains'
import { seed } from 'uPortMobile/lib/selectors/recovery'
// import { activationEvents } from 'uPortMobile/lib/selectors/userActivation'
// import { setError } from '../helpers/error'
import { resetKey, createIdentityKeyPair, createSubAccountAddress, createRecoveryAddress } from './keychain'
import authorize from 'uPortMobile/lib/helpers/authorize'
// import { whenConnected, onlyConnected } from './network_state'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { toJs, get } from 'mori'
const MNID = require('uPortMobile/lib/browserified/mnid')
import { failProcess, saveMessage } from '../actions/processStatusActions'
import { networksByName } from '../utilities/networks'

function * resetIdentity () {
  const authorized = yield call(authorize, 'Reset your identity? You will lose access to your identity')

  if (authorized) {
    yield put(track('Identity Reset'))
    const root = yield select(hdRootAddress)
    if (root) {
      // seedPhrase = yield call(NativeModules.NativeHDSignerModule.showSeed, root, 'Show your current recovery seed?')
      yield resetKey(root, true)
    } else {
      const deviceAddress = yield select(deviceAddress)
      yield resetKey(root, false)
    }
    // Creating this without action creator as this should only be called here and not be exposed to the UX
    yield put({type: RESET_DEVICE})
    yield call(delay, 2000)
  } else if (authorized !== 0) {
    console.log('error while resetting identity')
    console.log('Please Set a password')
    Alert.alert(
      'Warning',
      'uport requires a device passcode/fingerprint to allow for device user authentication, the app will never see your passcode and this is handled by the Android system',
      [
          {text: 'OK', onPress: () => console.log('OK Pressed')}
      ],
      { cancelable: false }
    )
  }
}

export function * createEthIdentity () {
  yield put(startWorking('createIdentity'))
  // console.log(defaultNetwork)
  // const identity = 
  yield call(createIdentityKeyPair)
  // console.log(identity)
  yield put(completeProcess('createIdentity'))
}

export function * createKeyPairAccount ({parent, network, clientId}) {
  yield put(startWorking('createSubAccount'))
  const parentIndex = yield select(hdAccountIndex, parent)
  const account = yield call(createSubAccountAddress, parentIndex)
  const address = MNID.encode({address: account.address, network: networksByName[network].network_id})
  if (clientId) {
    account.clientId = clientId
  }
  yield put(storeSubAccount({...account, address, hexaddress: account.address, parent, network, signerType: 'KeyPair'}))
  yield put(completeProcess('createSubAccount'))
  return address
}

export function * createDeviceKey ({parent, network, clientId}) {
  yield put(startWorking('createSubAccount'))
  const parentIndex = yield select(hdAccountIndex, parent)
  const account = yield call(createSubAccountAddress, parentIndex)
  const address = `temp-${network}-${clientId}-${account.address}`
  if (clientId) {
    account.clientId = clientId
  }
  yield put(storeSubAccount({...account, address, deviceAddress: account.address, parent, network, signerType: 'MetaIdentityManager'}))
  yield put(completeProcess('createSubAccount'))
  return account.address
}

function * identitySaga () {
  // yield checkForIdentity()
  yield all([
    takeEvery(RESET_IDENTITY, resetIdentity),
    takeEvery(CREATE_IDENTITY, createEthIdentity),
    takeEvery(CREATE_ACCOUNT, createKeyPairAccount)
  ])
}

export default identitySaga
