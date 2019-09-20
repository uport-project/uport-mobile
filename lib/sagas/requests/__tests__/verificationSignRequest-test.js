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
import { call } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import { authorize } from '../verificationSignRequest'
import { createToken } from '../../jwt'

const ethAddress = '0x79ecd6962e10b4acab0b039b168e59f1737006e2'
const mnid = '2nbyhXvmkGUwLoR32oc2ocQ4PwhsEN5ooL3'

const subject = 'did:ethr:0x0a47a04c9582541d8e5c9d5c554a174727091a92'
const issuer = `did:ethr:${ethAddress}`
const claim = {
  name: 'Bob Smith'
}
const payload = {
  sub: subject,
  claim
}

const request = {
  client_id: 'did:ethr:0x0a47a04c9582541d8e5c9d5c554a174727091a92',
  target: issuer,
  subject,
  unsignedClaim: claim,
  type: 'verReq'
}
const TOKEN = 'TOKEN'

describe('#authorize()', () => {
  describe('all ethr did', () => {
    it('calls createToken', () => {
      return expectSaga(authorize, request)
        .provide([
          [
            call(createToken, issuer, payload, {
              expiresIn: false,
              issuer
            }),
            TOKEN
          ]
        ])
        .returns({ access_token: TOKEN })
        .run()
    })
  })

  describe('mnid subject', () => {
    it('calls createToken', () => {
      return expectSaga(authorize, {
        ...request,
        client_id: mnid,
        riss: issuer
      })
        .provide([
          [
            call(createToken, issuer, payload, {
              expiresIn: false,
              issuer
            }),
            TOKEN
          ]
        ])
        .returns({ access_token: TOKEN })
        .run()
    })
  })
})
