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
import { call, put } from 'redux-saga/effects'
import { Platform } from 'react-native'
import IntentLauncher, { IntentConstant } from 'react-native-intent-launcher'
import { openExternalUrl } from 'uPortMobile/lib/helpers/url_handler'
import { callback } from 'uPortMobile/lib/actions/requestActions'
import URL from 'url-parse'
import qs from 'qs'

export function * returnToApp (request, response) {
  const url = URL(request.callback_url)
  // console.log(url)
  const hash = url.hash || '#'
  url.set('hash', hash + qs.stringify(response))
  // console.log(`redirecting to: ${url.toString()}`)
  if (Platform.OS === 'android' && url.protocol === 'https:') {
    try {
      return yield call(IntentLauncher.startActivity, {action: IntentConstant.ACTION_VIEW, data: url.toString(), extra: { 'com.android.browser.application_id': 'com.android.chrome' }})
    } catch (error) {
      console.log(error)
    }
  }
  return yield call(openExternalUrl, url.toString())
}

export function * postBackToServer (request, response) {
  return yield call(fetch, request.callback_url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(response)
  })
}

export function * performCallback (request, response) {
  const url = URL(request.callback_url)
  yield put(callback(request))
  if (request.postback || url.hostname.match(/^(chasqui|api)\.uport\.(me|space)$/)) {
    return yield call(postBackToServer, request, response)
  } else {
    return yield call(returnToApp, request, response)
  }
}
