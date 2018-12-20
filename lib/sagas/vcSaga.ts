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
import { all, call, select, put, takeEvery } from 'redux-saga/effects'
import { createToken, verifyToken } from './jwt'
import { filter, isArray } from 'lodash'
import { addVc } from '../actions/vcActions'
import { ipfsFetchText } from '../utilities/ipfs'
import { currentAddress } from '../selectors/identities'

import {
  ADD_VC,
  UPDATE_CONTACT_LIST,
  UPDATE_CONTACT_DETAILS,
  SIGN_VC,
  SHARE_VC,
 } from '../constants/VcActionTypes'
import {
  setContactList,
  setContactDetails,
  signVc as svc,
  updateContactDetails as ucd } from '../actions/vcActions'
import { getContactList, getClaimsForDid } from './databaseSaga'

function * safeVerify(jwt: string) {
  try {
    return yield call(verifyToken, jwt)
  } catch (e) {
    return null
  }
}

function * loadIfIpfsHash(item: string) {
  if (item.slice(0, 6) !== '/ipfs/') {
    return item
  }
  try {
    const data = yield ipfsFetchText(item.slice(6))
    return data
  } catch (e) {
    console.log(e)
    return null
  }
}

export function * addMultipleVc(vc: string[]) {
  if (!isArray(vc)) {
    return
  }

  // Load JWTs from IPFS
  const load = vc.map(item => call(loadIfIpfsHash, item))
  const jwts = yield all(load)

  // Verify all JWTs
  const verify = jwts.map((jwt: string) => call(safeVerify, jwt))
  const verifiedJWTs = yield all(verify)

  const preparedVCs = filter(verifiedJWTs, (obj: JwtDetails) => obj !== null).map((item: JwtDetails) => {
    return {
      jwt: item.jwt,
      payload: item.payload,
    }
  })

  yield put(addVc(preparedVCs))
}

function * updateContactList() {
  try {
    const contactList = yield getContactList()
    yield put(setContactList(contactList))
    // yield put(svc({
    //   iss: '',
    //   sub: 'did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30',
    //   claim: {
    //     test: 'foobar',
    //   },
    // }))
    // yield put(ucd('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30'))
  } catch (e) {
    console.log(e)
  }
  return true
}

function * updateContactDetails(action: { type: string, did: string }) {
  try {
    const claims = yield getClaimsForDid(action.did)
    yield put(setContactDetails(action.did, claims))
    } catch (e) {
    console.log(e)
  }
  return true
}

function * signVc(action: { type: string, vc: JwtPayload }) {
  const issuer = yield select(currentAddress)
  const jwt = yield call(createToken, issuer, action.vc, { expiresIn: action.vc.exp ? action.vc.exp : false, issuer })
  yield addMultipleVc([jwt])
  return true
}

function * shareVc(action: { type: string, vc: JwtDetails[], shareType: 'file' | 'url' }) {

  const request = {
    version: 2,
    type: 'vc',
    vc: action.vc.map(item => item.jwt),
  }

  const issuer = yield select(currentAddress)
  const jwt = yield call(createToken, issuer, request, { expiresIn: false, issuer })

  if (action.shareType === 'file') {
    yield call(shareFile, jwt)
  }

  return true
}

function * shareFile(jwt: string) {

  let granted = PermissionsAndroid.RESULTS.GRANTED

  if (Platform.OS === 'android') {
    granted = yield call(PermissionsAndroid.request, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
  }

  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    const fileContents = JSON.stringify({
      message: {
        content: jwt,
      },
    })

    const path = `${RNFetchBlob.fs.dirs.CacheDir}/signed_data.uPort`
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

function * vcSaga() {
  yield all([
    takeEvery(UPDATE_CONTACT_LIST, updateContactList),
    takeEvery(UPDATE_CONTACT_DETAILS, updateContactDetails),
    takeEvery(SIGN_VC, signVc),
    takeEvery(SHARE_VC, shareVc),
  ])
  return true
}

export default vcSaga
