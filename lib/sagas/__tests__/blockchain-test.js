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
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { select, call } from 'redux-saga/effects'

import { resolveMetaNonce, fetchMetaNonce } from '../blockchain'

describe('resolveMetaNonce', () => {
  it('chooses network nonce when local nonce undefined', () => {
    return expectSaga(resolveMetaNonce, {address: null, deviceAddress: null, metaNonce: undefined})
        .provide([
            [call(fetchMetaNonce, { address: null, deviceAddress: null }), 1]
        ])
        .call(fetchMetaNonce, { address: null, deviceAddress: null })
        .returns(1)
        .run()
  })

  it('chooses local nonce when greater than network nonce & younger than 20 seconds', () => {
    return expectSaga(resolveMetaNonce, {address: null, deviceAddress: null, metaNonce: {nonce: 2, timestamp: Date.now() - 5000}})
        .provide([
            [call(fetchMetaNonce, { address: null, deviceAddress: null }), 1]
        ])
        .call(fetchMetaNonce, { address: null, deviceAddress: null })
        .returns(2)
        .run()
  })

  it('chooses local nonce when greater than network nonce & older than 20 seconds', () => {
    return expectSaga(resolveMetaNonce, {address: null, deviceAddress: null, metaNonce: {nonce: 2, timestamp: Date.now() - 21000}})
        .provide([
            [call(fetchMetaNonce, { address: null, deviceAddress: null }), 1]
        ])
        .call(fetchMetaNonce, { address: null, deviceAddress: null })
        .returns(1)
        .run()
  })
})
