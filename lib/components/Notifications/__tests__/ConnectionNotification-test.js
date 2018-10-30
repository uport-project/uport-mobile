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
import 'react-native'
import React from 'react'
import ConnectionNotification from '../Types/ConnectionNotification'
import renderer from 'react-test-renderer'

function lookupIssuer (address) {
  return {address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02', name: '0x1bc5cbf7...'}
}

const activity = {
  id: 13,
  type: 'connect',
  to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'
}

const authorizedActivity = {
  id: 13,
  type: 'connect',
  to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  authorizedAt: Date.now()
}

const canceledActivity = {
  id: 13,
  type: 'connect',
  to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  canceledAt: Date.now()
}
describe('Connection Notification', () => {
  it('renders an connection notification correctly', () => {
    const tree = renderer.create(
      <ConnectionNotification
        activity={activity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an connection notification that has been canceled correctly', () => {
    const tree = renderer.create(
      <ConnectionNotification
        activity={canceledActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an connection notification that has been authorized correctly', () => {
    const tree = renderer.create(
      <ConnectionNotification
        activity={authorizedActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls props.authorize when the notification is accepted', () => {
    const authorize = jest.fn()
    this.notification = global.shallow(
      <ConnectionNotification
        activity={authorizedActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={authorize}
      />
    )
    this.notification.props().accept()
    expect(authorize).toHaveBeenCalled()
  })

  it('calls props.cancel when the notification is cancelled', () => {
    const cancel = jest.fn()
    this.notification = global.shallow(
      <ConnectionNotification
        activity={authorizedActivity}
        issuer={lookupIssuer}
        cancel={cancel}
        authorize={() => true}
      />
    )
    this.notification.props().cancel()
    expect(cancel).toHaveBeenCalled()
  })

  it('calls props.selectRequest when the card is pressed', () => {
    const selectRequest = jest.fn()
    this.notification = global.shallow(
      <ConnectionNotification
        activity={authorizedActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
        selectRequest={selectRequest}
      />
    )
    this.notification.props().cardPress()
    expect(selectRequest).toHaveBeenCalled()
  })
})
