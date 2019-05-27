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
import { AsyncStorage } from 'react-native'
import { Cache } from 'react-native-cache'

const cache = new Cache({
  namespace: 'generic',
  policy: {
    maxEntries: 300
  },
  backend: AsyncStorage
})

export function cacheOrFetch (key, f) {
  return new Promise((resolve, reject) => {
    cache.getItem(key, (e, v) => {
      if (e) return reject(e)
      if (v) {
        // console.log(`Cache Hit: ${key}`)
        return resolve(v)
      } else {
        // console.log(`fetching: ${key}`)
        f().then((value) => {
          if (value) {
            // console.log(`caching: ${key}`)
            cache.setItem(key, value, (e, v) => {
              // if (e) console.log(e)
            })
          }
          resolve(value)
        }).catch(reject)
      }
    })
  })
}
