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
import { AsyncStorage, AppState } from 'react-native'
import { call, put, select, throttle, takeEvery, takeLatest, take, all, spawn, cps } from 'redux-saga/effects'
import { eventChannel, delay } from 'redux-saga'
import { toJs, equals, toClj, assoc, dissoc, get, reduceKV, set, partial, pipeline, curry, hashMap, sortedMap, updateIn, intoArray, into, queue } from 'mori'
import { reload, persist, loadedDB } from 'uPortMobile/lib/actions/globalActions'
import { PERSIST_DB, FORCE_PERSIST_DB, RESET_DEVICE, RELOAD_DB } from '../constants/GlobalActionTypes'
import { without } from 'lodash'

// DEV ONLY - this should always be false in GITHUB. For Dev purposes you can turn it on to be sure of completely fresh state
export const FORCE_CLEAN_STATE = false
const persistedReducers = ['uport', 'sns', 'events', 'settings', 'hdwallet', 'hub', 'vc', 'migrations']
export const allStores = without(persistedReducers, 'settings').map(reducer => `${reducer}-state`)

export function stateSaverMiddleware ({dispatch, getState}) {
  return (next) => (action) => {
    const prevState = getState()
    const returnValue = next(action)
    if (action.type !== RELOAD_DB && action.type !== RESET_DEVICE) {
      persistedReducers.forEach(reducer => {
        const prevReducerState = prevState[reducer]
        const nextReducerState = getState()[reducer]
        if (!equals(prevReducerState, nextReducerState)) {
          dispatch(persist(reducer))
        }
      })
    }
    return returnValue
  }
}

export function * persistReducer ({reducer}) {
  const state = yield select(state => state[reducer])
  yield call(AsyncStorage.setItem, `${reducer}-state`, JSON.stringify(toJs(state)))
}

export function * debounchedPersistReducer ({reducer}) {
  yield call(delay, 500)
  // console.log(`PERSISTING ${reducer}`)
  yield call(persistReducer, {reducer})
  // console.log(`PERSISTED ${reducer}`)
}

export function * distributePersistTasks () {
  // Yes this is next level SAGA magic
  // The previous debouncing code, meant that any persist action would cancel the previous one
  // This sets up a separate debouncedPersistReducer for each reducer type.
  return yield all(persistedReducers.map(reducer => takeLatest(a => a.type === PERSIST_DB && a.reducer === reducer, debounchedPersistReducer)))
}

export function * forcePersistAll () {
  yield call(delay, 1000)
  // console.log('forcePersistAll')
  for (let reducer of persistedReducers) {
    yield call(persistReducer, {reducer})
  }
  // console.log('FINISHED forcePersistAll')
}

export function massageActivities (activities) {
  if (activities) {
    return reduceKV((a, id, v) => assoc(a, get(v, 'id'), v), sortedMap(), activities)
  }
}

export function massageIdentity (identity) {
  return pipeline(identity,
                  curry(updateIn, ['own', 'connections'],
                    partial(reduceKV, (c, type, v) => assoc(c, type, set(v)), hashMap()))
                  // curry(updateIn, ['activities'], massageActivities)
  )
}

// Do some post processing of data, due to the fact that JSON doesn't
// support things like sets, non string keys and sorted maps.
export function massage (data) {
  return reduceKV((state, address, identity) => {
    return updateIn(state, ['byAddress', address], massageIdentity)
  }, data, get(data, 'byAddress'))
}

// Forces saving of app when going to background or inactive state
function * saveWhenInactive () {
  const appStateChannel = yield eventChannel(emitter => {
    function handler (state) {
      if (state !== 'active') emitter(state)
    }
    AppState.addEventListener('change', handler)
    return () => AppState.removeEventListener('change', handler)
  })
  while (true) {
    yield take(appStateChannel)
    yield forcePersistAll()
  }
}

export function * initializeDatabase () {
  console.log('initializeDb')
  if (FORCE_CLEAN_STATE) return
  const state = {}
  try {
    for (let i in persistedReducers) {
      const reducer = persistedReducers[i]
      const name = `${reducer}-state`
      // console.log(`checking for data in ${name}`)
      const json = yield call(AsyncStorage.getItem, name)
      if (json) {
        const data = JSON.parse(json)
        if (Object.keys(data).length > 0) {
          console.log(`loaded ${reducer} data`)
          // console.log(data)
          switch (reducer) {
            case 'uport':
              state[reducer] = massage(toClj(data))
              break
            case 'events':
            case 'hdwallet':
              state[reducer] = toClj(data)
              break
            case 'hub':
              state[reducer] = hashMap('head', data.head, 'events', into(queue(), data.events))
              break
            default:
              state[reducer] = data
          }
        }
      }
    }
    if (Object.keys(state).length > 0) {
      yield put(reload(state))
      yield put(loadedDB())
    } else {
      console.log('No saved state')
    }
    yield spawn(saveWhenInactive)
  } catch (e) {
    console.log('error loading state')
    console.log(e)
  }
}

export function * resetStorage () {
  try {
    // console.log('resetStorage')
    yield call(delay, 1000)
    yield cps(AsyncStorage.multiRemove, allStores)
    // console.log('finished resetStorage')
  } catch (e) {
    console.log('resetStorage error')
    console.log(e)
  }
}

export default function * stateSaver () {
  // This makes sure the db doesn't get persisted more than every 10s for performance reasons
  yield all([
    distributePersistTasks(),
    takeLatest(FORCE_PERSIST_DB, forcePersistAll),
    takeLatest(RESET_DEVICE, resetStorage)
  ])
}
