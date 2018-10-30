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
import { all, call, select, put } from 'redux-saga/effects'
import { verifyToken } from './jwt'
import { filter, isArray } from 'lodash'
import { addVc } from '../actions/vcActions'
import { ipfsFetchText } from '../utilities/ipfs'

function * safeVerify (jwt) {
  try {
    return yield call(verifyToken, jwt)
  } catch (e) {
    return null
  }
}

function * loadIfIpfsHash (item) {
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

export function * addMultipleVc (vc) {
  if (!isArray(vc)) {
    return
  }

  // Load JWTs from IPFS
  const load = vc.map(item => call(loadIfIpfsHash, item))
  const jwts = yield all(load)

  // Verify all JWTs
  const verify = jwts.map(jwt => call(safeVerify, jwt))
  const verifiedJWTs = yield all(verify)

  const preparedVCs = filter(verifiedJWTs, obj => obj !== null).map(item => {
    return {
      jwt: item.jwt,
      payload: item.payload
    }
  })

  yield put(addVc(preparedVCs))
}