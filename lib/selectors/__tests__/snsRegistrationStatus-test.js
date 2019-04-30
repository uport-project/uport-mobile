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
import {endpointArn, deviceToken, skippedPushNotifications} from 'uPortMobile/lib/selectors/snsRegistrationStatus'
const empty = {
  sns: {}
}

const existingData = {
  sns: {
    endpointArn: 'arn://dddd',
    deviceToken: 'device-token',
    skippedPushNotifications: true
  }
}

it('returns correct endpointArn', () => {
  expect(endpointArn(existingData)).toEqual('arn://dddd')
  expect(endpointArn(empty)).toBeUndefined()
})

it('returns correct deviceToken', () => {
  expect(deviceToken(existingData)).toEqual('device-token')
  expect(deviceToken(empty)).toBeUndefined()
})

it('returns skippedPushNotifications', () => {
  expect(skippedPushNotifications(existingData)).toBeTruthy()
  expect(skippedPushNotifications(empty)).toBeFalsy()
})
