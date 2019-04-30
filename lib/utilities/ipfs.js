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
import { Platform, PermissionsAndroid } from 'react-native'
import { call } from 'redux-saga/effects'
import RNFetchBlob from 'react-native-fetch-blob'
// const fs = RNFetchBlob.fs

const addUrl = 'https://ipfs.infura.io:5001/api/v0/add?pin=true'
export const ipfsUrl = 'https://cloudflare-ipfs.com'

function addFile (blob) {
  return new Promise((resolve, reject) => {
    RNFetchBlob.fetch('POST', addUrl, {
      'Content-Type': 'multipart/form-data'
    }, [ blob ]).then((response) => {
      resolve(response.json()['Hash'])
    }).catch((error) => {
      reject(error)
    })
  })
}

export function* addImage ({uri, data}) {
  // console.log(`ipfs.addImage`)
  // console.log(uri)

  const file = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
  return yield call(addFile, {name: 'file', filename: 'avatar.jpg', type: 'image/jpeg', data: RNFetchBlob.wrap(file)})
}

export function* addJson (jsonObject) {
  // console.log('addJson')
  var jsonString = JSON.stringify(jsonObject)
  return yield call(addFile, {data: jsonString, type: 'application/json', name: 'file'})
}

function ipfsFetch (ipfsHash) {
  return new Promise((resolve, reject) => {
    RNFetchBlob.fetch('GET', `${ipfsUrl}/ipfs/${ipfsHash}`).then(resolve).catch(reject)
  })
}

export function ipfsFetchText (ipfsHash) {
  return new Promise((resolve, reject) => {
    RNFetchBlob.fetch('GET', `${ipfsUrl}/ipfs/${ipfsHash}`).then((response) => resolve(response.text())).catch(reject)
  })
}

export function* fetchJson (ipfsHash) {
  const response = yield ipfsFetch(ipfsHash)
  return response.json()
}

export function* getAndroidPermissions () {
  try {
    const granted = yield call(PermissionsAndroid.request,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        'title': 'Read File Permission',
        'message': 'Haven ID needs permission to read file '
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true
    } else {
      return false
    }
  } catch (err) {
    return false
  }
}

export function* fetchUrlOrFile (url) {
  let access = true
  if (Platform.OS === 'android') {
    access = yield call(getAndroidPermissions)
  }
  if (access && (url.slice(0, 6) === 'file://' || url.slice(0, 9) === 'content://')) {
    return yield call(RNFetchBlob.fs.readFile, url)
  } else {
    const response = yield call(fetch, url, {headers: {'Accept': 'application/json'}})
    return yield call(response.json.bind(response))
  }
}