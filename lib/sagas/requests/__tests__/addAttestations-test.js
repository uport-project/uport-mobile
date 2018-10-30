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
jest.mock('../../jwt', () => {
  return {
    verifyToken: () => {}
  }
})

import { select, put, call } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'

import { handle, addAttestations } from '../addAttestations.js'
import { verifyToken } from '../../jwt'
import { waitForUX } from 'uPortMobile/lib/utilities/performance'
import {
  updateActivity,
  removeActivity,
  updateInteractionStats,
  storeAttestation,
  removePendingAttestation
} from 'uPortMobile/lib/actions/uportActions'
import {
  sendLocalNotification
} from 'uPortMobile/lib/actions/snsRegistrationActions'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { toClj } from 'mori'

const attestation = {
  sub: '0x011',
  iss: '0x012',
  token: 'JWT',
  claim: { name: 'Joe Smith' }
}

const jwt = 'JWT'

describe('#handle()', () => {
  const request = {
    target: '0x011',
    client_id: '0x012',
    attestations: [attestation]
  }
  it('sets up correct request', () => {
    return expectSaga(handle, attestation, jwt)
      .provide([
        [select(externalProfile, '0x012'), toClj({ name: 'Bobs Bank' })]
      ])
      .put(storeAttestation({ ...attestation, token: jwt }))
      .put(updateInteractionStats('0x011', '0x012', 'attest'))
      .put(removePendingAttestation('0x011', '0x012', 'name'))
      .returns(request)
      .run()
  })
})

describe('#addAttestations()', () => {
  const request = {
    id: 123,
    target: '0x011',
    client_id: '0x012',
    attestations: [attestation]
  }

  it('sets up correct request', () => {
    return expectSaga(
      addAttestations,
      { id: 123 },
      { query: { attestations: 'JWT' } }
    )
      .provide([
        [call(waitForUX), undefined],
        [select(externalProfile, '0x012'), toClj({ name: 'Bobs Bank' })],
        [
          matchers.call.fn(verifyToken, 'JWT'),
          {
            payload: {
              sub: '0x011',
              iss: '0x012',
              claim: { name: 'Joe Smith' }
            }
          }
        ]
      ])
      .put(storeAttestation(attestation))
      .put(updateInteractionStats('0x011', '0x012', 'attest'))
      .put(removePendingAttestation('0x011', '0x012', 'name'))
      .put(updateActivity(123, request))
      .returns({ status: 'ok' })
      .run()
  })

  it('handles invalid jwt', () => {
    return expectSaga(
      addAttestations,
      { id: 123 },
      { query: { attestations: 'JWT' } }
    )
      .provide([
        [call(verifyToken, 'JWT'), throwError(new Error('Could not verify signature of request'))]
      ])
      .put(removeActivity(123))
      .returns({ error: 'invalid_verification' })
      .run()
  })

  it('handles missing jwt', () => {
    return expectSaga(
      addAttestations,
      { id: 123 },
      { query: { attestations: '' } }
    )
      .put(removeActivity(123))
      .returns({ error: 'invalid_request' })
      .run()
  })

  it('handles missing attestation parameter', () => {
    return expectSaga(addAttestations, { id: 123 }, {})
      .put(removeActivity(123))
      .returns({ error: 'invalid_request' })
      .run()
  })
})
