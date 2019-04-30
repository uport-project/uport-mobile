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

import { Linking } from 'react-native'
import { queue, conj, pop, each } from 'mori'

// This handles incoming requests as well as initialURL's received while app is starting up or before user is onboarded

// It is important that this file is loaded before store.js

// It is designed to handle clean handover to normal Linking request handler after startup

// Once app is initialized call the default requestQueue function with a url handling function, which
// is called for each queued request. There should only be 0 or 1, but better safe than sorry.

// After handling any queued events it subscribes the url handler to handle any new requests

// This funcion returns a promise which can safely be ignored.

function listenToRequests () {
  // sets up initial mori queue. Note here I'm specifically using let as it will change
  let requests = queue()

  const queueRequest = (event) => {
    // as an event handler it expects an event object. But for getInitialURL it just receives a string
    const url = (typeof event) === 'string' ? event : (event && event.url)
    if (url) {
      console.log(`QUEUEING ${url}`)
      // add url to requests queue and replace it with new queue
      requests = conj(requests, url)
    }
  }
  Linking.addEventListener('url', queueRequest)
  Linking.getInitialURL().then(queueRequest)
  console.log('Listening and Queing Linking events')

  return (handler) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('Switching over to regular event handling')
        Linking.addEventListener('url', (event) => {
          // This allows us to use the same event handler
          if (event && event.url) handler(event.url)
        })
        // Remove old event handler
        Linking.removeListener('url', queueRequest)

        // each is for iterating over mori collections with side effects
        each(requests, (url) => {
          console.log(`handling queued event: ${url}`)
          handler(url)
          // Remove the latest request from queue for good mesure
          requests = pop(requests)
        })
        resolve()
      } catch (e) {
        console.log(`Error handling queued events`)
        console.log(e)
        reject(e)
      }
    })
  }
}

const requestQueue = listenToRequests()

export default requestQueue
