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
import { SHARE_STATE_DUMP } from 'uPortMobile/lib/constants/UportActionTypes'
import { all, takeEvery, select, call } from 'redux-saga/effects'
import RNFS from 'react-native-fs'
import { toJs } from 'mori'
import { Share } from 'react-native'
import { encryptMessage } from './encryption';

const UPORT_BOX_PUB = 'Do7Il6jhD+U5yA5mqgX5CNnWNHilQvTj289Wm1RskXY='
const DUMP_FILE_PATH = `${RNFS.DocumentDirectoryPath}/uport_debug_dump.json`

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
    yield call(RNFS.writeFile, DUMP_FILE_PATH, json, 'utf8')
    yield call(Share.share,
      {
        message: 'Here is a json file containing the encrypted debug dump of my uPort Mobile App.',
        url: `file://${DUMP_FILE_PATH}`,
        title: 'uPort Debug Dump',
        subject: 'uPort Debug Dump'
      }, {
        // Android only
        dialogTitle: 'uPort Debug Dump'
      })
  } catch (e) {
    console.log('error sharing dump file:', e)
  } finally {
    if (yield call(RNFS.exists, DUMP_FILE_PATH)) {
      yield call(RNFS.unlink, DUMP_FILE_PATH)
    }
  }
}

export default function* debug() {
  yield all([
    takeEvery(SHARE_STATE_DUMP, shareStateDump)
  ])
}