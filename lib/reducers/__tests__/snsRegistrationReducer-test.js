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

import reducer from 'uPortMobile/lib/reducers/snsRegistrationReducer.js'
import {storeEndpointArn, storeDeviceToken, skipPushNotifications} from 'uPortMobile/lib/actions/snsRegistrationActions.js'

const empty = {}
const withEndpointArn = {endpointArn: 'aws:arn:b'}
const withDeviceToken = {deviceToken: 'yyyyyy'}
const skippedPushNotifications = {skippedPushNotifications: true}

it('sets endpoint arn', () => {
  expect(reducer(null, storeEndpointArn('aws:arn:a'))).toMatchSnapshot()
  expect(reducer(empty, storeEndpointArn('aws:arn:a'))).toMatchSnapshot()
  expect(reducer(withEndpointArn, storeEndpointArn('aws:arn:a'))).toMatchSnapshot()
  expect(reducer(withDeviceToken, storeEndpointArn('aws:arn:a'))).toMatchSnapshot()
  expect(reducer(null, storeEndpointArn('aws:arn:a'))).toMatchSnapshot()
})

it('sets device token', () => {
  expect(reducer(null, storeDeviceToken('xxxxxx'))).toMatchSnapshot()
  expect(reducer(empty, storeDeviceToken('xxxxxx'))).toMatchSnapshot()
  expect(reducer(withEndpointArn, storeDeviceToken('xxxxxx'))).toMatchSnapshot()
  expect(reducer(withDeviceToken, storeDeviceToken('xxxxxx'))).toMatchSnapshot()
  expect(reducer(null, storeDeviceToken('xxxxxx'))).toMatchSnapshot()
})

it('sets skipPushNotifications', () => {
  expect(reducer(null, skipPushNotifications())).toMatchSnapshot()
  expect(reducer(empty, skipPushNotifications())).toMatchSnapshot()
  expect(reducer(withEndpointArn, skipPushNotifications())).toMatchSnapshot()
  expect(reducer(withDeviceToken, skipPushNotifications())).toMatchSnapshot()
  expect(reducer(null, skipPushNotifications())).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(reducer(empty, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(reducer(withEndpointArn, {type: 'UNSUPPORTED'})).toEqual(withEndpointArn)
  expect(reducer(withDeviceToken, {type: 'UNSUPPORTED'})).toEqual(withDeviceToken)
  expect(reducer(skippedPushNotifications, {type: 'UNSUPPORTED'})).toEqual(skippedPushNotifications)
})
