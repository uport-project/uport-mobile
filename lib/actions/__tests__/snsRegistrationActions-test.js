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
import {
  registerDeviceForNotifications,
  storeEndpointArn,
  receiveDeviceToken,
  storeDeviceToken,
  sendLocalNotification,
  updateBadgeCount,
  checkForNotifications,
  pollForNotifications,
  handleEncryptedMessage,
  initNotifications
 } from 'uPortMobile/lib/actions/snsRegistrationActions.js'

it('creates a REGISTER_DEVICE_FOR_NOTIFICATIONS action', () => {
  expect(registerDeviceForNotifications()).toMatchSnapshot()
})

it('creates a STORE_ENDPOINT_ARN action containing the arn', () => {
  expect(storeEndpointArn('aws:arn:dddd')).toMatchSnapshot()
})

it('creates a RECEIVE_DEVICE_TOKEN action containing the token', () => {
  expect(receiveDeviceToken('xxxxxx')).toMatchSnapshot()
})

it('creates a STORE_DEVICE_TOKEN action containing the token', () => {
  expect(storeDeviceToken('xxxxxx')).toMatchSnapshot()
})

it('creates a SEND_LOCAL_NOTIFICATION action containing the activity id and message', () => {
  expect(sendLocalNotification(123, 'You received a message')).toMatchSnapshot()
})

it('creates a UPDATE_BADGE_COUNT action', () => {
  expect(updateBadgeCount()).toMatchSnapshot()
})

it('creates a CHECK_FOR_NOTIFICATIONS action containing the token', () => {
  expect(checkForNotifications()).toMatchSnapshot()
})

it('creates a POLL_FOR_NOTIFICATIONS action containing the token', () => {
  expect(pollForNotifications()).toMatchSnapshot()
})

it('creates a HANDLE_ENCRYPTED_MESSAGE action containing the token', () => {
  expect(handleEncryptedMessage('012314')).toMatchSnapshot()
})

it('creates a INIT_NOTIFICATIONS action', () => {
  expect(initNotifications()).toMatchSnapshot()
})
