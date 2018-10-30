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
import DisclosureNotification from '../Types/DisclosureNotification'
import renderer from 'react-test-renderer'

function lookupIssuer (address) {
  return {address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02', name: '0x1bc5cbf7...'}
}

const activity = {
  id: 13,
  type: 'disclosure',
  client_id: true
}

const authorizedActivity = {
  id: 13,
  type: 'disclosure',
  authorizedAt: Date.now(),
  client_id: true
}

const canceledActivity = {
  id: 13,
  type: 'disclosure',
  canceledAt: Date.now(),
  client_id: true
}

const requested = (claims) => ({'employer': 'Uport AG'})

describe('Disclosure Notification', () => {
  it('renders an disclosure notification correctly', () => {
    const tree = renderer.create(
      <DisclosureNotification
        activity={activity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
        requested={requested}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an disclosure notification that has been canceled correctly', () => {
    const tree = renderer.create(
      <DisclosureNotification
        activity={canceledActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
        requested={requested}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an disclosure notification that has been authorized correctly', () => {
    const tree = renderer.create(
      <DisclosureNotification
        activity={authorizedActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
        requested={requested}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('calls props.authorize when the notification is accepted', () => {
    const authorize = jest.fn()
    this.notification = global.shallow(
      <DisclosureNotification
        activity={authorizedActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={authorize}
        requested={requested}
      />
    )
    this.notification.props().accept()
    expect(authorize).toHaveBeenCalled()
  })

  it('calls props.cancel when the notification is cancelled', () => {
    const cancel = jest.fn()
    this.notification = global.shallow(
      <DisclosureNotification
        activity={authorizedActivity}
        issuer={lookupIssuer}
        cancel={cancel}
        authorize={() => true}
        requested={requested}
      />
    )
    this.notification.props().cancel()
    expect(cancel).toHaveBeenCalled()
  })

  it('calls props.selectRequest when the card is pressed', () => {
    const selectRequest = jest.fn()
    this.notification = global.shallow(
      <DisclosureNotification
        activity={authorizedActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
        selectRequest={selectRequest}
        requested={requested}
      />
    )
    this.notification.props().cardPress()
    expect(selectRequest).toHaveBeenCalled()
  })
})
