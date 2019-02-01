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
import { all, takeEvery, call, select, put, cps } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {
  savePublicUport,
  registry,
  profileTemplate
} from 'uPortMobile/lib/sagas/persona'
import { 
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import {
  saveMessage,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import {
  currentAddress, publicUportForAddress
} from 'uPortMobile/lib/selectors/identities'
import { isEqual } from 'lodash'

const step = MigrationStep.UportRegistryDDORefresh

export function * isProfileUpToDate (address: string, seq?: number) { // seq is just for easy mocking in tests
  try {
    const fetchedProfile = yield cps(registry, address)
    // console.log(`fetched profile ${address}`, fetchedProfile)
    const attributes = yield select(publicUportForAddress, address)
    const profile = {...profileTemplate, ...attributes}
    // console.log('local profile', profile)
    return isEqual(profile, fetchedProfile)  
  } catch (error) {
    console.log('problem calling registry', error)
    return false
  }
}

function * migrate (attempt = 0) : any {
  try {
    const address = yield select(currentAddress)
    if (yield call(isProfileUpToDate, address, 1)) {
      yield put(saveMessage(step, `Profile is already up to date for ${address}`))
      return true  
    }

    yield put(saveMessage(step, `Updating uPort Registry for ${address}`))
    
    if (yield call(savePublicUport, {address, force: attempt > 0})) {
      // Sometimes nodes are not uptodate
      yield call(delay, 5000)

      if (yield call(isProfileUpToDate, address)) {
        return true
      } else {
        if (attempt > 2) {
          yield put(failProcess(step, 'Transaction updating profile failed'))
          return false  
        }
      }
    } else {
      if (attempt > 2) {
        yield put(failProcess(step, 'Did not successfully update profile'))
        return false  
      }
    }
    return yield call(migrate, ++attempt)
  } catch (error) {
    console.log(error)
    yield put(failProcess(step, error.message))
    return false
  }

}

export default migrate
