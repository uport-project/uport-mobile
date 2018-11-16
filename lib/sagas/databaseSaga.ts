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
import { openDatabase, DEBUG, enablePromise } from 'react-native-sqlcipher-storage'
import { ADD_VC } from '../constants/VcActionTypes'

DEBUG(true)

const db = openDatabase({ name: 'testDB', createFromLocation : "~www/testDB", "key": "password" }, () => {}, () => {})

export function * initializeSQLDatabase() {

  db.transaction((tx) => {
    // tx.executeSql('CREATE TABLE IF NOT EXISTS signed_data (iss TEXT, sub TEXT, json_blob TEXT, raw TEXT);', [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`CREATE INDEX IF NOT EXISTS "sub" ON "signed_data" ("sub");`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`CREATE TABLE IF NOT EXISTS profile_data (parent_id INTEGER, iss TEXT, sub TEXT, claim_type TEXT, claim_value TEXT);`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`CREATE INDEX IF NOT EXISTS "profile_data_sub" ON "profile_data" ("sub");`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`CREATE INDEX IF NOT EXISTS "profile_data_claim_type" ON "profile_data" ("claim_type");`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`CREATE TRIGGER IF NOT EXISTS insert_profile_data AFTER INSERT ON "signed_data" BEGIN INSERT INTO profile_data select new.rowid, a.iss, a.sub, b.key as claim_type, b.value as claim_value from signed_data a, json_tree(json_blob) b where b.path = '$.claim' and a.rowid = new.rowid; END;`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`CREATE TRIGGER IF NOT EXISTS delete_profile_data BEFORE DELETE ON "signed_data" BEGIN DELETE FROM profile_data where parent_id = old.rowid; END;`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`create view IF NOT EXISTS  popular_name as select * from (
    //   select sub, claim_value as name
    //   from "profile_data"
    //   where claim_type='name'
    //   group by sub, claim_type, claim_value
    //   order by count( claim_value) asc
    //   ) group by sub;`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`create view IF NOT EXISTS  popular_first_name as select * from (
    //   select sub, claim_value as firstName
    //   from "profile_data" 
    //   where claim_type='firstName'
    //   group by sub, claim_type, claim_value
    //   order by count( claim_value) asc
    //   ) group by sub;`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`create view IF NOT EXISTS  popular_last_name as select * from (
    //   select sub, claim_value as lastName
    //   from "profile_data" 
    //   where claim_type='lastName'
    //   group by sub, claim_type, claim_value
    //   order by count( claim_value) asc
    // ) group by sub;`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`create view IF NOT EXISTS popular_profile_image as select * from (
    //   select sub, claim_value as profileImage
    //   from "profile_data" 
    //   where claim_type='profileImage'
    //   group by sub, claim_type, claim_value
    //   order by count( claim_value) asc
    // ) group by sub;`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`create view IF NOT EXISTS distinct_dids as select distinct sub from profile_data;`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    // tx.executeSql(`create view IF NOT EXISTS profiles as
    // select
    //   distinct_dids.sub,
    //   popular_name.name,
    //   popular_first_name.firstName,
    //   popular_last_name.lastName,
    //   popular_profile_image.profileImage
    // from distinct_dids
    //   left outer join popular_name on distinct_dids.sub = popular_name.sub
    //   left outer join popular_first_name on distinct_dids.sub = popular_first_name.sub
    //   left outer join popular_last_name on popular_last_name.sub = distinct_dids.sub
    //   left outer join popular_profile_image on distinct_dids.sub = popular_profile_image.sub;`, [], (tx, results) => {
    //   console.log({tx, results})
    // });
    tx.executeSql("select * from profiles", [], (tx, results) => {
      // console.log({tx, results})
      console.log('AAAAA', results.rows.length)
      console.log(new Date())
      let names = ''
      for (let x = 0; x < results.rows.length; x++) {
        names = names + ', ' + results.rows.item(x).name
        // console.log('res: ', results.rows.item(x))
      }
      console.log(new Date())
      console.log({names})
    });
  });

  return true
}

function * insertVc(action: any) {
  const vc = action.vc[0]
  db.transaction((tx) => {
    tx.executeSql('INSERT INTO signed_data (iss, sub, json_blob, raw) values (?, ?, ?, ?)', [
      vc.payload.iss,
      vc.payload.sub,
      JSON.stringify(vc.payload),
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