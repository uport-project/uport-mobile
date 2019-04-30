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
import { takeEvery, call, put, select, all, spawn } from 'redux-saga/effects'
import { FEATURE_FLAGS_LOAD } from 'uPortMobile/lib/constants/FeatureFlagsActionTypes'
import { featureFlagsLoad } from 'uPortMobile/lib/actions/featureFlagsActions'
import { connected, waitUntilConnected } from './networkState'
import { setChannel } from 'uPortMobile/lib/actions/settingsActions'
import { setFlagsAction } from 'flag'
import firebase from 'react-native-firebase'
import lodash from 'lodash'

import config from 'uPortMobile/lib/config'

export function loadFromHttps () {
  return fetch(config.flags.transport.https.url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  }).then(function (response) {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    throw new TypeError('Remote flags transport did not return JSON!')
  })
}

export function loadFromFirebase () {
  if (global.__DEV__) {
    firebase.config().enableDeveloperMode()
  }

  firebase.config().setDefaults(config.flags.defaultValues)
  const flagKeys = Object.keys(config.flags.defaultValues)

  return firebase.config().fetch(config.flags.transport.firebase.cacheDuration)
  .then(() => {
    return firebase.config().activateFetched()
  })
  .then((activated) => {
    if (!activated) console.log('Fetched data not activated')
    return firebase.config().getValues(flagKeys)
  })
  .then((snapshot) => {
    let flags = {}
    lodash.each(snapshot, (item, key) => {
      flags[key] = item.val()
    })
    return flags
  })
  .catch(console.error)

}

export function * loadRemoteFeatureFlags () {
  try {
    let flags = false
    yield call(waitUntilConnected)
    if (config.flags.remoteTransport === 'https') {
      flags = yield call(loadFromHttps)
    }

    if (config.flags.remoteTransport === 'firebase') {
      yield spawn(setDefaultFirebaseChannel)
      flags = yield call(loadFromFirebase)
    }

    if (flags) {
      yield put(setFlagsAction(flags))
    }
  } catch (e) {
    console.log(e)
  }
}

function firebaseInitialSetup () {
  firebase.analytics().setAnalyticsCollectionEnabled(true)
}

export function setUserProperty (name, value) {
  firebase.analytics().setUserProperty(name, value)
}

function * setDefaultFirebaseChannel () {
  const currentChannel = yield select((state) => state.settings.channel)
  if (!currentChannel) {
    try {
      yield call(firebaseInitialSetup)
      yield call(setUserProperty, 'channel', config.flags.transport.firebase.defaultChannel)
      yield put(setChannel(config.flags.transport.firebase.defaultChannel))
    } catch (e) {
      console.log(e)
    }
  }
}

function * featureFlagsSaga () {
  yield all([
    takeEvery(FEATURE_FLAGS_LOAD, loadRemoteFeatureFlags)
  ])
}

export default featureFlagsSaga
