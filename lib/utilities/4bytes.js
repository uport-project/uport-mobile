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
import { cacheOrFetch } from './cache'

export function getFunctionNameUncached (fnSig) {
  return new Promise((resolve, reject) => {
    if (fnSig) {
      fetch(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${fnSig}`)
                .then((response) => response.json())
                .then(function (jsonResponse) {
                  if (jsonResponse.results.length === 0) {
                    reject()
                  } else {
                    resolve(jsonResponse.results[0].text_signature)
                  }
                }).catch(reject)
    } else {
      reject(null)
    }
  })
}

export function getFunctionName (fnSig) {
  return cacheOrFetch(fnSig, () => getFunctionNameUncached(fnSig))
}
