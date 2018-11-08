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
import { delay } from 'redux-saga'
import { Alert, NativeModules } from 'react-native'
import { takeEvery, call, put, select, all, spawn } from 'redux-saga/effects'
import { openDatabase } from 'react-native-sqlcipher-storage'
import { ADD_VC } from '../constants/VcActionTypes'
const db = openDatabase({ name: 'uport.sqlite', location: 'default', "key": "password" }, () => {}, () => {})

export function * initializeSQLDatabase() {

  db.transaction((tx) => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS signed_data (iss, aud, sub, type, _value, iat, raw, sourceId, sourceType, previous, context, internal)', [], (tx, results) => {
      console.log({tx, results})
    });
    tx.executeSql("select a.sub, b.key, b.value from signed_data a, json_tree(_value) b where b.path = '$.claim';", [], (tx, results) => {
      console.log({tx, results})
      for (let x = 0; x < results.rows.length; x++) {
        console.log('res: ', results.rows.item(x))
      }
    });
  });

  return true
}

function * insertVc(action: any) {
  const vc = action.vc[0]
  db.transaction((tx) => {
    tx.executeSql('INSERT INTO signed_data (iss, sub, type, _value, iat, raw) values (?, ?, ?, ?, ?, ?)', [
      vc.payload.iss,
      vc.payload.sub,
      'todo',
      JSON.stringify(vc.payload),
      vc.payload.iat,
      vc.jwt
    ], (tx, results) => {
      console.log({tx, results})
    });
  });
  return true
}

function * databaseSaga () {
  yield all([
    takeEvery(ADD_VC, insertVc),
  ])
  return true
}

export default databaseSaga