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
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

const RNRandomBytes = require('react-native').NativeModules.RNRandomBytes

function toBuffer (nativeStr) {
  return Buffer.from(nativeStr, 'base64')
}

export function randomBytes (length, callback) {
  RNRandomBytes.randomBytes(length, (err, base64String) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, toBuffer(base64String))
    }
  })
}
