import { SHARE_STATE_DUMP } from 'uPortMobile/lib/constants/UportActionTypes'
import { all, takeEvery, select, call } from 'redux-saga/effects'
import RNFS from 'react-native-fs'
import { toJs } from 'mori'
import { Share } from 'react-native'

export function* shareStateDumpSaga() {
  console.log('dumping state:')
  const rawState = yield select(state => state)
  const dumpState = {}
  for (let reducer in rawState) {
    dumpState[reducer] = toJs(rawState[reducer])
  }
  const json = JSON.stringify(dumpState)
  console.log(dumpState)

  const rootPath = RNFS.DocumentDirectoryPath
  const dumpFilePath = `${rootPath}/dump.json`

  try {
    yield call(RNFS.writeFile, dumpFilePath, json, 'utf8')
    const fileUrl = `file://${dumpFilePath}`
    console.log(fileUrl)
    console.log(yield call(RNFS.exists, dumpFilePath))

    const result = yield call(Share.share,
      {
        message: 'There should be a json file here',
        url: fileUrl,
        title: 'uPort Debug Data',
        subject: 'JSON Data'
      }, {
        // Android only
        dialogTitle: 'uPort Debug Data'
      })

    if (result.action === Share.sharedAction) {
      console.log('share complete')
    } else if (result.action === Share.dismissedAction) {
      console.log('share dismissed')
    }

    const dumpFileExists = yield call(RNFS.exists, dumpFilePath)
    if (dumpFileExists) {
      console.log('removing dump file')
      yield call(RNFS.unlink, dumpFilePath)
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