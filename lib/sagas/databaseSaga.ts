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

const db = openDatabase({ name: 'data.sqlite', location : 'default', "key": "password" }, noop, noop)

export function * initializeSQLDatabase() {

  db.transaction((tx) => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS signed_data (iss TEXT, sub TEXT, _value TEXT, raw TEXT);`, [], (t, results) => true)
    tx.executeSql(`CREATE TABLE IF NOT EXISTS profile_data (parent_id INTEGER, iss TEXT, sub TEXT, claim_type TEXT, claim_value TEXT);`, [], (t, results) => true)

    tx.executeSql(`CREATE INDEX IF NOT EXISTS "sub" ON "signed_data" ("sub");`, [], (t, results) => true)
    tx.executeSql(`CREATE INDEX IF NOT EXISTS "profile_data_sub" ON "profile_data" ("sub");`, [], (t, results) => true)
    tx.executeSql(`CREATE INDEX IF NOT EXISTS "profile_data_claim_type" ON "profile_data" ("claim_type");`, [], (t, results) => true)

    tx.executeSql(`CREATE TRIGGER IF NOT EXISTS insert_profile_data AFTER INSERT ON "signed_data" BEGIN
      INSERT INTO profile_data select new.rowid, a.iss, a.sub, b.key as claim_type, b.value as claim_value from signed_data a, json_tree(_value) b
      where b.path = '$.claim' and a.rowid = new.rowid; END;`, [], (t, results) => true)

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
        tx.executeSql('INSERT INTO signed_data (iss, sub, _value, raw) values (?, ?, ?, ?)', [
          vc.payload.iss,
          vc.payload.sub,
          JSON.stringify(vc.payload),
          vc.jwt,
        ], (tx, results) => {
          console.log({ tx, results })
        })
      }
    }
  });
  yield put(updateContactList())

  return true
}

function * runMigrations() {
  // check which migrations have been run 
  // run missing migrations (create tables, views, etc)

  db.transaction((tx) => {
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"name":"Aurore Schuppe"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7Im5hbWUiOiJBdXJvcmUgU2NodXBwZSJ9LCJpc3MiOiJkaWQ6ZXRocjoweGJmOGE2ZjUxNDI3MzQ1M2I4NDY5NWNmZDVlMTg2Zjk1NzNhZGVjMzAifQ.Y6Aec2NbAo7i1FihAfgbRfZV3iIFS2ktfV4yQwIVESwrs2eDvrfOK7Ss0VT27F78U3fWpC3cDXKU48Fos6rJ9QE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"firstName":"Ardith"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkFyZGl0aCJ9LCJpc3MiOiJkaWQ6ZXRocjoweGJmOGE2ZjUxNDI3MzQ1M2I4NDY5NWNmZDVlMTg2Zjk1NzNhZGVjMzAifQ.SuM_W9_YOX6KAChgOFkCyRaaIIC6nqlGmJ3atfr9YqCI586sbDNc7aaChfzZTjTKMpOC3pgtlYVTJbo8uzSAhAE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"lastName":"Jacobi"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7Imxhc3ROYW1lIjoiSmFjb2JpIn0sImlzcyI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCJ9.htA1ww4ffrjyKNMfvAcAtlmeIP4crCp0YaS5baLp1qVeo0t3dBaWlhxqyKl96BuNiZseH7KCAMpf-KvWAHf2YAA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"email":"Norwood95@gmail.com"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7ImVtYWlsIjoiTm9yd29vZDk1QGdtYWlsLmNvbSJ9LCJpc3MiOiJkaWQ6ZXRocjoweGJmOGE2ZjUxNDI3MzQ1M2I4NDY5NWNmZDVlMTg2Zjk1NzNhZGVjMzAifQ.UpXOPCqEzIXiySEUiG4lv2ntBYujvBRYf2rdfAm2Vbxav4ZuC5SbpTNSnVSd3qymoO3UjF7u2-1Qf2g5aSSmDQE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/AM_Kn2/128.jpg"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIvQU1fS24yLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhiZjhhNmY1MTQyNzM0NTNiODQ2OTVjZmQ1ZTE4NmY5NTczYWRlYzMwIn0.nYbboNOqAYV7zQL8EhNg6o-QBM2v5zVedo5vbMvbqeNpdbzKs5FJkKEhgtvh9KavnBeYVF5MdgKzqrFASXTawQA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"name":"Elta Rohan"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7Im5hbWUiOiJFbHRhIFJvaGFuIn0sImlzcyI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCJ9.nMXJ0pAVz3xH9hvN5T0gocqx5SwfcZHrcNb7XIKFIVy3C17d2oXT2EMECV4dITVSmlo2H3YeaPt0aoDLMvB5ygA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"firstName":"Christ"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkNocmlzdCJ9LCJpc3MiOiJkaWQ6ZXRocjoweGJmOGE2ZjUxNDI3MzQ1M2I4NDY5NWNmZDVlMTg2Zjk1NzNhZGVjMzAifQ.2Pmw1KeOD8TejkBzy32EXJOizWqmZjn7YhH8m7HDj7QnD87N_KKYCvjJSCAkR1S6nNuRoTxtbmb_jyX17hicEQA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"lastName":"Marquardt"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7Imxhc3ROYW1lIjoiTWFycXVhcmR0In0sImlzcyI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCJ9.zNoWav0ZhLUDV55nydBBgRttBq71CRUqXzYraR-MLWtWhUr1JFKH07nsFu2IcMxTGZDW64q02mqnLT-NmkXk0gA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"email":"Tommie.Zieme53@yahoo.com"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7ImVtYWlsIjoiVG9tbWllLlppZW1lNTNAeWFob28uY29tIn0sImlzcyI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCJ9.8AUfDszkMDN3NOaXRP7DhtOoFiZC-E3UopfOlif85_g_ZU8djh58u3i5xqFVQmRxt2-CGoHrn3nZopaPJfcZxAA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/kosmar/128.jpg"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIva29zbWFyLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhiZjhhNmY1MTQyNzM0NTNiODQ2OTVjZmQ1ZTE4NmY5NTczYWRlYzMwIn0.TjY2l8CH5k6tiR9vXrzHpRwQ_xgbzMCcrSmL2I2dKnw3pF9uwk0EbqM0BbAd7l0voyM75_FDT4954OMfOWTRggA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"name":"Abby Gleason"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7Im5hbWUiOiJBYmJ5IEdsZWFzb24ifSwiaXNzIjoiZGlkOmV0aHI6MHhiZjhhNmY1MTQyNzM0NTNiODQ2OTVjZmQ1ZTE4NmY5NTczYWRlYzMwIn0.y_zVehHfhtp83o2LqgpVBfue37v93O4PX83DQAVp06FpVUxrq05HGMOkRsL1KyQs_5hV_PA8gqAUjqSy21SJwgA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"firstName":"Frederic"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkZyZWRlcmljIn0sImlzcyI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCJ9.AfCqTnoo8twtSILwoPXjjZFGVIO5QCDg8Bhx4udmqiIwKDARQFYhFAl9PRm0LOgmvu4nSO5KWVDMXMgglAJsuwE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"lastName":"Strosin"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7Imxhc3ROYW1lIjoiU3Ryb3NpbiJ9LCJpc3MiOiJkaWQ6ZXRocjoweGJmOGE2ZjUxNDI3MzQ1M2I4NDY5NWNmZDVlMTg2Zjk1NzNhZGVjMzAifQ.__6brExNoiu3lfI9xdxEnJ0Hgw95MBAzl5_PQmVQFttZw_kXGA1N7XcWSqQTW9_ylDjZ5f_F-2b_NtGGlwdYIwE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"email":"Theodora12@gmail.com"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7ImVtYWlsIjoiVGhlb2RvcmExMkBnbWFpbC5jb20ifSwiaXNzIjoiZGlkOmV0aHI6MHhiZjhhNmY1MTQyNzM0NTNiODQ2OTVjZmQ1ZTE4NmY5NTczYWRlYzMwIn0.KsP3-ZWKXTfZdtHyBrZ6vhWxRluTilDlE4Yox_30I1-J5HaavZT_VzVdRvA-VapFfpyoZXmGpWZpVBZ5j2d_xwE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/aiiaiiaii/128.jpg"},"iss":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIvYWlpYWlpYWlpLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhiZjhhNmY1MTQyNzM0NTNiODQ2OTVjZmQ1ZTE4NmY5NTczYWRlYzMwIn0.EaBorscluv8iS-l5vWbQcON_TQrM8ycvTWWi2Puc7dtwOA9d3Hzj5uoBzZ3A2QVjNYsk0S7tw2W6VuHC0G_rCQA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"name":"Aurore Schuppe"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7Im5hbWUiOiJBdXJvcmUgU2NodXBwZSJ9LCJpc3MiOiJkaWQ6ZXRocjoweGNmYzE0YzEzNWE3YzU0MDk1ZjM2ZmE5YTgxYTUzMzA0MDg5Njc3NjIifQ.tw4KmVIJgo3NmfBCUotfoeNab7fxrklOpMmBUseikQMr2EXGo8XFPZpPq4ar1IilPmh31kD_y_uojfbNCTsNnwE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"firstName":"Ardith"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkFyZGl0aCJ9LCJpc3MiOiJkaWQ6ZXRocjoweGNmYzE0YzEzNWE3YzU0MDk1ZjM2ZmE5YTgxYTUzMzA0MDg5Njc3NjIifQ.zu9bf-ahki0HEHl44DRc-Z__bn_5PVwJ3Ig6rydD3n8RMd7f_5OqL0Pqf7yeFmHdoU6MZEgJcL9ZZttmH6wNbgE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"lastName":"Jacobi"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7Imxhc3ROYW1lIjoiSmFjb2JpIn0sImlzcyI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiJ9.FaEcFaeJ07hMBozfeeUmGC-JTCC6d4ydkiC6dphynvJP-y5g3ZxJ6jGK4GZdaghkW0WroRAQlq1hDeHfjwWVhwA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"email":"Norwood95@gmail.com"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7ImVtYWlsIjoiTm9yd29vZDk1QGdtYWlsLmNvbSJ9LCJpc3MiOiJkaWQ6ZXRocjoweGNmYzE0YzEzNWE3YzU0MDk1ZjM2ZmE5YTgxYTUzMzA0MDg5Njc3NjIifQ.zHxwM8rfGpyJt7v8gjPbzt2g8C52DvvdHgPkBm4twLyr4VAqMI2y1DHgxwCDt8JcaWJZ0FHB8r72p-GQdUEolwE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/AM_Kn2/128.jpg"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIvQU1fS24yLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhjZmMxNGMxMzVhN2M1NDA5NWYzNmZhOWE4MWE1MzMwNDA4OTY3NzYyIn0.foqSoh4gvFVcCQFl0rm3-ARjJA9sgoH4QJk0YvpTSf12nCqmNkOlWUuI16TAXHFkkCVb80F1w0JQ9ibScTdDpAA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"name":"Elta Rohan"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7Im5hbWUiOiJFbHRhIFJvaGFuIn0sImlzcyI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiJ9.9tCIRs87CSA1TjtTvQt1v0MlSfdtF5UN5XmIRLW6LuG7364htlu2rfPoPr5bULseaiKMzSWSAf2iEypqVOGeegE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"firstName":"Christ"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkNocmlzdCJ9LCJpc3MiOiJkaWQ6ZXRocjoweGNmYzE0YzEzNWE3YzU0MDk1ZjM2ZmE5YTgxYTUzMzA0MDg5Njc3NjIifQ.M9HIYnQxjakEF92bwhOrAD1tJcZB2LzBqm702oZHauW3P4SqxzIRFsEpZIdYNzDJ0XboLs5LwqkcxIgZBAHrWAE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"lastName":"Marquardt"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7Imxhc3ROYW1lIjoiTWFycXVhcmR0In0sImlzcyI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiJ9.5YdeYRAha_KIW4-0Ni5KO4PBo-U4NaxBX_80vcreF7mRbylkP7GorMgNt4Tf9e5CLi0EhT2hqwZ1xbWdiP5ctQA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"email":"Tommie.Zieme53@yahoo.com"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7ImVtYWlsIjoiVG9tbWllLlppZW1lNTNAeWFob28uY29tIn0sImlzcyI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiJ9.Ah_EWV-_pLnfUyxDvX07G36xIaFbstbx1IXMVSYAgODZyKez1gEBcHf1O_TV1-Rs3U6Mf8MQAOLSsJvXGrTK0gE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/kosmar/128.jpg"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIva29zbWFyLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhjZmMxNGMxMzVhN2M1NDA5NWYzNmZhOWE4MWE1MzMwNDA4OTY3NzYyIn0.eMljjR0ZPnOY-2Auy8zdHCuC3dEW4yVTAY7Zv68NkY8S7TjZ_YSlwoYPfELTPaEvB5ohEajMFT-Ynv4jhazoTQE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"name":"Abby Gleason"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7Im5hbWUiOiJBYmJ5IEdsZWFzb24ifSwiaXNzIjoiZGlkOmV0aHI6MHhjZmMxNGMxMzVhN2M1NDA5NWYzNmZhOWE4MWE1MzMwNDA4OTY3NzYyIn0.whm86fSNTpNiwYET5de0udxxBJcVvE5iXCsJ0tjYTjHkvcAzMx4Ch_slY4uomELm1pd4jJOyRen98zkYWHFFmgA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"firstName":"Frederic"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkZyZWRlcmljIn0sImlzcyI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiJ9.gBoRw6AksAV30_XLxHK-GSZHstanZZLpmCh8bKSXSJmkLpsZq8blKYPwHDDZMUNNiuSadtCFsPndKc98m14ERQA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"lastName":"Strosin"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7Imxhc3ROYW1lIjoiU3Ryb3NpbiJ9LCJpc3MiOiJkaWQ6ZXRocjoweGNmYzE0YzEzNWE3YzU0MDk1ZjM2ZmE5YTgxYTUzMzA0MDg5Njc3NjIifQ.-kE73CwI366tDPL-3XkfgOsEnrbhMU4QVIPXlqViCSgFfhWmEBCExP_J9Ah_hH-maunbsV90TCNpP5aoGu39kAA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"email":"Theodora12@gmail.com"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7ImVtYWlsIjoiVGhlb2RvcmExMkBnbWFpbC5jb20ifSwiaXNzIjoiZGlkOmV0aHI6MHhjZmMxNGMxMzVhN2M1NDA5NWYzNmZhOWE4MWE1MzMwNDA4OTY3NzYyIn0.iQbAXVgnkkcQL6wW4voLezNzzPHh3cFEjbBupLb7I0_m0WmVnxHjfpWAzR98NDxGezgl7HgSlPE-z57AQgzHsQE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/aiiaiiaii/128.jpg"},"iss":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIvYWlpYWlpYWlpLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhjZmMxNGMxMzVhN2M1NDA5NWYzNmZhOWE4MWE1MzMwNDA4OTY3NzYyIn0.twIHFSJHG8TlsQLK56kZtbkVjwkO7x9duvHy-mMO_Te_saAntwrWsGHJsQ8yiILbfxYUWn61dbmhRIKLKX4O1gE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"name":"Aurore Schuppe"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7Im5hbWUiOiJBdXJvcmUgU2NodXBwZSJ9LCJpc3MiOiJkaWQ6ZXRocjoweGRkZjYxMjM5ZTBmMWMzMDAyNmJkNWZmMjI1M2VkYzY5ZDUwZDk3YmMifQ.v_J-wRZXVwOtDaH_jVju_iqC3x7thXl_2LT2HOAb98uqbhtX9ZKmNyxmLAiaoSsI9x4soMNWuV8Hb5Zv68JFTQA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"firstName":"Ardith"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkFyZGl0aCJ9LCJpc3MiOiJkaWQ6ZXRocjoweGRkZjYxMjM5ZTBmMWMzMDAyNmJkNWZmMjI1M2VkYzY5ZDUwZDk3YmMifQ.s3XNmYxIVZKHa56rXwFXYJIjlzEEQfT7x1PEKR6XccRxEGS3KjSj58-kv7wJFYop0Ar1onJWRO3StQWWn_yMkQE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"lastName":"Jacobi"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7Imxhc3ROYW1lIjoiSmFjb2JpIn0sImlzcyI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyJ9.pH6JF2RoAT1zmVcotPAz3mlx8R4GytpVAJ7rXtu5rr9XcjJQk0XTka--byXOk7ZYMAhO1o3ZDu2TL4PJkUIUqwE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"email":"Norwood95@gmail.com"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7ImVtYWlsIjoiTm9yd29vZDk1QGdtYWlsLmNvbSJ9LCJpc3MiOiJkaWQ6ZXRocjoweGRkZjYxMjM5ZTBmMWMzMDAyNmJkNWZmMjI1M2VkYzY5ZDUwZDk3YmMifQ.A4WqpvVBPEyp1PYvXYQXcJoPsOandu9VmiBQVSlIped7wcrjBx3myUcinvqsgGiqds87I1Zz0HsckCWPyXtlrQE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30','{"sub":"did:ethr:0xbf8a6f514273453b84695cfd5e186f9573adec30","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/AM_Kn2/128.jpg"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4YmY4YTZmNTE0MjczNDUzYjg0Njk1Y2ZkNWUxODZmOTU3M2FkZWMzMCIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIvQU1fS24yLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhkZGY2MTIzOWUwZjFjMzAwMjZiZDVmZjIyNTNlZGM2OWQ1MGQ5N2JjIn0.9EUiVumVEavEjcHxzSXso_hvLpcYaCgO3km5meUXQpEXoF6knpgsnz-PlInCvoVULsINC0rK9f-XuY-PBYc4sgA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"name":"Elta Rohan"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7Im5hbWUiOiJFbHRhIFJvaGFuIn0sImlzcyI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyJ9.iltpHK0_lEC35rrT_h762vSKG9zUmaV8SKmq0drvwi0j3JJUtOa-e0oJmxr2pwYf6H4bM08IlPs2Ug458q-F2AE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"firstName":"Christ"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkNocmlzdCJ9LCJpc3MiOiJkaWQ6ZXRocjoweGRkZjYxMjM5ZTBmMWMzMDAyNmJkNWZmMjI1M2VkYzY5ZDUwZDk3YmMifQ.3z5AoQMs-eJ56Ymlp_3gZRZNWaKKhuKahLu91f9IbQ5izdyCAHXAV3KWTP5gmXO2HqknvFF56CHyQi8yNqrKJAA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"lastName":"Marquardt"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7Imxhc3ROYW1lIjoiTWFycXVhcmR0In0sImlzcyI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyJ9.-8F1XVofzyr9Pbfx1Ckai-Jf541DlqLEJDn-CcumzNNwU_oUpWLvIvTX28JTDTqDq2XpzWxqGi-03Pt0jE2SggE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"email":"Tommie.Zieme53@yahoo.com"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7ImVtYWlsIjoiVG9tbWllLlppZW1lNTNAeWFob28uY29tIn0sImlzcyI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyJ9.JZ_cfHG4ASfRuuvb8vaNxmbidNroJ24bpNMDZb6ENNBzhs2KviuWt2SDzmCB3WshrK-7S6cq_I1ylrhSLHoT5gA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762','{"sub":"did:ethr:0xcfc14c135a7c54095f36fa9a81a5330408967762","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/kosmar/128.jpg"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4Y2ZjMTRjMTM1YTdjNTQwOTVmMzZmYTlhODFhNTMzMDQwODk2Nzc2MiIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIva29zbWFyLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhkZGY2MTIzOWUwZjFjMzAwMjZiZDVmZjIyNTNlZGM2OWQ1MGQ5N2JjIn0.wprAsCyfRkGrVY5LU5Wcl0VJFfAvQNb9kMl_v7j-ZpWj5XTCmDCnP_u6WTtfbnDJQjj6Pp5u8sve-ASINbMJOwA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"name":"Abby Gleason"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7Im5hbWUiOiJBYmJ5IEdsZWFzb24ifSwiaXNzIjoiZGlkOmV0aHI6MHhkZGY2MTIzOWUwZjFjMzAwMjZiZDVmZjIyNTNlZGM2OWQ1MGQ5N2JjIn0.OgsU0DAMhiT1Rta96EWbsPXJ5x4h5aBSD2x-uWd4D4CN3xUhbuovvUGNuqi3v7dbvsmUe6_rDB4d_1QzbyOAtQA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"firstName":"Frederic"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7ImZpcnN0TmFtZSI6IkZyZWRlcmljIn0sImlzcyI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyJ9.hnWr5CAiGeEYBupqgVvIX19Zd1CmJ691-mWJ1opgWdm-xhUpC71I8YV3BIP-BsDRBUI9H-7eOZzJwg2pIi_pkwE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"lastName":"Strosin"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7Imxhc3ROYW1lIjoiU3Ryb3NpbiJ9LCJpc3MiOiJkaWQ6ZXRocjoweGRkZjYxMjM5ZTBmMWMzMDAyNmJkNWZmMjI1M2VkYzY5ZDUwZDk3YmMifQ.SuPMmgpzOLkzt4Qd0bmK0kum1rsTpmOt_-qWYnB9hMxUGJW9ptZXMyK0_zpHajBOwrMbopI9kqmGGhGf8N13xgE');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"email":"Theodora12@gmail.com"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7ImVtYWlsIjoiVGhlb2RvcmExMkBnbWFpbC5jb20ifSwiaXNzIjoiZGlkOmV0aHI6MHhkZGY2MTIzOWUwZjFjMzAwMjZiZDVmZjIyNTNlZGM2OWQ1MGQ5N2JjIn0.PMBDVbjzpXv4b6PMG8doO1cqUjDIwlf_pUBS6FIE061-Qc-jYEUpZ9fqUhzEbVpTiQM_ourO4suDKbOZ-uDzcAA');`, [], (tx, results) => {});
    // tx.executeSql(`INSERT INTO signed_data VALUES('did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc','{"sub":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc","claim":{"profileImage":"https://s3.amazonaws.com/uifaces/faces/twitter/aiiaiiaii/128.jpg"},"iss":"did:ethr:0xddf61239e0f1c30026bd5ff2253edc69d50d97bc"}','eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDM0MTQ2NzAsInN1YiI6ImRpZDpldGhyOjB4ZGRmNjEyMzllMGYxYzMwMDI2YmQ1ZmYyMjUzZWRjNjlkNTBkOTdiYyIsImNsYWltIjp7InByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIvYWlpYWlpYWlpLzEyOC5qcGcifSwiaXNzIjoiZGlkOmV0aHI6MHhkZGY2MTIzOWUwZjFjMzAwMjZiZDVmZjIyNTNlZGM2OWQ1MGQ5N2JjIn0.OeniBk-yXmutO4sRIlkdOhUSSgy6RE5Q-Ftyof25gpmimgH63AH9JHA3asCVPgyG4Xw8Spj4DuxIN1vlxKHYMgE');`, [], (tx, results) => {});
  })
  return true
}

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
      tx.executeSql('select pd.*, sd.raw as jwt, sd._value as _value from profile_data pd inner join signed_data sd on pd.parent_id = sd.rowid where pd.sub = ?',
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
