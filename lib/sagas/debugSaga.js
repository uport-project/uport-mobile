import { SHARE_STATE_DUMP } from 'uPortMobile/lib/constants/UportActionTypes'
import { all, takeEvery, select, call } from 'redux-saga/effects'
import RNFS from 'react-native-fs'
import { toJs } from 'mori'
import { Share } from 'react-native'
import { encryptMessage } from './encryption';

const UPORT_BOX_PUB = 'Do7Il6jhD+U5yA5mqgX5CNnWNHilQvTj289Wm1RskXY='
const DUMP_FILE_PATH = `${RNFS.DocumentDirectoryPath}/uport_debug_dump.json`

export function* shareStateDumpSaga() {
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

    if (yield call(RNFS.exists, DUMP_FILE_PATH)) {
      yield call(RNFS.unlink, DUMP_FILE_PATH)
    }
  } catch (e) {
    console.log('error sharing dump file:', e)
  }
}

export default function* debug() {
  yield all([
    takeEvery(SHARE_STATE_DUMP, shareStateDumpSaga)
  ])
}