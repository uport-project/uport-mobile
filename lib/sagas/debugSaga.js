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
import Share from 'react-native-share'
import { PermissionsAndroid, Platform } from 'react-native'
import RNFetchBlob from 'react-native-fetch-blob'
import { SHARE_STATE_DUMP } from 'uPortMobile/lib/constants/UportActionTypes'
import { all, takeEvery, select, call } from 'redux-saga/effects'
import { toJs } from 'mori'
import { encryptMessage } from './encryption';

const UPORT_BOX_PUB = 'Do7Il6jhD+U5yA5mqgX5CNnWNHilQvTj289Wm1RskXY='

export function* shareStateDump() {
  const moriState = yield select(state => state)
  const jsState = Object.keys(moriState).reduce((state, reducer) => {
    state[reducer] = toJs(moriState[reducer])
    return state
  }, {})
  const jsonState = JSON.stringify(jsState)
  const encryptedState = yield call(encryptMessage, jsonState, UPORT_BOX_PUB)
  const json = JSON.stringify({ encryptedState })

  try {
    yield call(shareFile, json, 'uport_debug_dump.json')
  } catch (e) {
    console.log('error sharing dump file:', e)
  } 
}

function * shareFile(fileContents, fileName) {

  let granted = PermissionsAndroid.RESULTS.GRANTED

  if (Platform.OS === 'android') {
    granted = yield call(PermissionsAndroid.request, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
  }

  if (granted === PermissionsAndroid.RESULTS.GRANTED) {

    const path = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`
    RNFetchBlob.fs.writeFile(path, fileContents, 'utf8')
    .then(() => {
      return Share.open({
        type: 'text/plain',
        url: `file://${path}`,
      })
    })
    .catch(e => console.log(e))
  }

  return true
}

export default function* debug() {
  yield all([
    takeEvery(SHARE_STATE_DUMP, shareStateDump)
  ])
}