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
import { updateContactList } from '../actions/vcActions'
import { normalizeUrl } from '../utilities/ipfs'

DEBUG(true)
const noop = () => true

export const db = openDatabase({ name: 'data.sqlite', location : 'default', "key": "password" }, noop, noop)

export function * initializeSQLDatabase() {

  db.transaction((tx) => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS signed_data (
      iss TEXT,
      aud TEXT,
      sub TEXT,
      type TEXT,
      _value TEXT,
      iat NUMERIC,
      raw TEXT,
      sourceId TEXT,
      sourceType TEXT,
      previous TEXT,
      context TEXT,
      internal NUMERIC NOT NULL default 1

    );`, [], (t, results) => true)
    tx.executeSql(`CREATE TABLE IF NOT EXISTS profile_data (parent_id INTEGER, iss TEXT, sub TEXT, claim_type TEXT, claim_value TEXT);`, [], (t, results) => true)

    tx.executeSql(`CREATE INDEX IF NOT EXISTS "sub" ON "signed_data" ("sub");`, [], (t, results) => true)
    tx.executeSql(`CREATE INDEX IF NOT EXISTS "profile_data_sub" ON "profile_data" ("sub");`, [], (t, results) => true)
    tx.executeSql(`CREATE INDEX IF NOT EXISTS "profile_data_claim_type" ON "profile_data" ("claim_type");`, [], (t, results) => true)

    tx.executeSql(`CREATE TRIGGER IF NOT EXISTS insert_profile_data AFTER INSERT ON "signed_data" BEGIN
      INSERT INTO profile_data select new.rowid, a.iss, a.sub, b.key as claim_type, b.value as claim_value from signed_data a, json_tree(_value) b
      where new.type = 'vc' and b.path = '$.claim' and a.rowid = new.rowid; END;`, [], (t, results) => true)

    tx.executeSql(`CREATE TRIGGER IF NOT EXISTS delete_profile_data BEFORE DELETE ON "signed_data" BEGIN
      DELETE FROM profile_data where parent_id = old.rowid; END;`, [], (t, results) => true)

    tx.executeSql(`CREATE VIEW IF NOT EXISTS distinct_dids as select distinct sub from profile_data;`, [], (t, results) => true)

    tx.executeSql(`CREATE VIEW IF NOT EXISTS popular_name as select * from (
      select sub, claim_value as name from "profile_data" where claim_type='name' group by sub, claim_type, claim_value
      order by count( claim_value) asc) group by sub;`, [], (t, results) => true)

    tx.executeSql(`CREATE VIEW IF NOT EXISTS popular_first_name as select * from (
      select sub, claim_value as firstName from "profile_data"  where claim_type='firstName' group by sub, claim_type, claim_value
      order by count( claim_value) asc ) group by sub;`, [], (t, results) => true)

    tx.executeSql(`CREATE VIEW IF NOT EXISTS popular_last_name as select * from (
      select sub, claim_value as lastName from "profile_data"  where claim_type='lastName' group by sub, claim_type, claim_value
      order by count( claim_value) asc ) group by sub;`, [], (t, results) => true)

    tx.executeSql(`CREATE VIEW IF NOT EXISTS popular_profile_image as select * from (
      select sub, claim_value as profileImage from "profile_data"  where claim_type='profileImage' group by sub, claim_type, claim_value
      order by count( claim_value) asc ) group by sub;`, [], (t, results) => true)

    tx.executeSql(`CREATE VIEW IF NOT EXISTS popular_url as select * from (
      select sub, claim_value as url from "profile_data"  where claim_type='url' group by sub, claim_type, claim_value
      order by count( claim_value) asc ) group by sub;`, [], (t, results) => true)

    tx.executeSql(`CREATE VIEW IF NOT EXISTS popular_description as select * from (
      select sub, claim_value as description from "profile_data"  where claim_type='description' group by sub, claim_type, claim_value
      order by count( claim_value) asc ) group by sub;`, [], (t, results) => true)

    tx.executeSql(`CREATE VIEW IF NOT EXISTS profiles as
      select
        distinct_dids.sub,
        popular_name.name,
        popular_first_name.firstName,
        popular_last_name.lastName,
        popular_profile_image.profileImage,
        popular_url.url,
        popular_description.description
      from distinct_dids
        left outer join popular_name on distinct_dids.sub = popular_name.sub
        left outer join popular_first_name on distinct_dids.sub = popular_first_name.sub
        left outer join popular_last_name on popular_last_name.sub = distinct_dids.sub
        left outer join popular_profile_image on distinct_dids.sub = popular_profile_image.sub
        left outer join popular_url on distinct_dids.sub = popular_url.sub
        left outer join popular_description on distinct_dids.sub = popular_description.sub;`, [], (t, results) => true)

  })

  return true
}

function * insertVc(action: { type: string, vc: JwtDetails[] }) {
  db.transaction((tx) => {
    for (const key in action.vc) {
      if (action.vc.hasOwnProperty(key)) {
        const vc = action.vc[key];
        tx.executeSql('INSERT INTO signed_data (type, iss, sub, _value, raw, internal) values (?, ?, ?, ?, ?, ?)', [
          'vc',
          vc.payload.iss,
          vc.payload.sub,
          JSON.stringify(vc.payload),
          vc.jwt,
          0,
        ], (tx, results) => {
          console.log({ tx, results })
        })
      }
    }
  });
  yield put(updateContactList())

  return true
}

// function * runMigrations() {
//   // check which migrations have been run 
//   // run missing migrations (create tables, views, etc)

//   db.transaction((tx) => {
//   })
//   return true
// }

export function getContactList(): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql('select * from profiles', [], (transaction, results) => {
        const contactList: Contact[] = []
        for (let x = 0; x < results.rows.length; x++) {
          const row = results.rows.item(x) as ProfilesTableRow
          contactList.push({
            did: row.sub,
            name: row.name,
            firstName: row.firstName,
            lastName: row.lastName,
            profileImage: normalizeUrl(row.profileImage),
            url: row.url,
            description: row.description,
          })
        }
        resolve(contactList)
      }, reject)
    })
  })
}

export function getClaimsForDid(did: string): Promise<VerifiableClaim[]> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql('select pd.*, sd.raw as jwt, sd._value as value from profile_data pd inner join signed_data sd on pd.parent_id = sd.rowid where pd.sub = ?',
      [ did ], (transaction, results) => {
        const claims: VerifiableClaim[] = []
        for (let x = 0; x < results.rows.length; x++) {
          const row = results.rows.item(x) as ProfileDataTableRow
          claims.push({
            rowId: row.parent_id,
            iss: row.iss,
            sub: row.sub,
            jwt: row.jwt,
            claim: JSON.parse(row._value).claim,
            claimType: row.claim_type,
            claimValue: row.claim_value,
          })
        }
        resolve(claims)
      }, reject)
    })
  })
}

function * databaseSaga() {
  yield all([
    takeEvery(ADD_VC, insertVc),
  ])
  return true
}

export default databaseSaga
