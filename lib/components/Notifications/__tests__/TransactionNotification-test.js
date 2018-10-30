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
import TransactionNotification from '../Types/TransactionNotification'
import renderer from 'react-test-renderer'

function lookupIssuer (address) {
  return {address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02', name: '0x1bc5cbf7...', avatar: {}}
}

const activity = {
  id: 13,
  type: 'sign',
  target: true,
  client_id: true,
  to: true
}

const updateUportActivity = {
  id: 13,
  type: 'sign',
  target: true,
  client_id: true,
  to: true,
  fnSig: '6737c877'
}

const txActivity = {
  id: 13,
  type: 'sign',
  target: true,
  client_id: true,
  to: true,
  fnSig: 'c877',
  txhash: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  abi: {
    name: '0x1bc5cbf7...'
  }
}

const sendEtherActivity = {
  id: 13,
  type: 'sign',
  target: true,
  client_id: true,
  to: true,
  fnSig: 'c877',
  txhash: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  value: 35
}

const authorizedActivity = {
  id: 13,
  type: 'sign',
  target: true,
  client_id: true,
  to: true,
  authorizedAt: Date.now()
}

const canceledActivity = {
  id: 13,
  type: 'sign',
  target: true,
  client_id: true,
  to: true,
  canceledAt: Date.now()
}
describe('Transaction Notification', () => {
  it('renders an transaction notification correctly', () => {
    const tree = renderer.create(
      <TransactionNotification
        activity={activity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an update uport transaction notification correctly', () => {
    const tree = renderer.create(
      <TransactionNotification
        activity={updateUportActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an txhash notification correctly', () => {
    const tree = renderer.create(
      <TransactionNotification
        activity={txActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an send ether notification correctly', () => {
    const tree = renderer.create(
      <TransactionNotification
        activity={sendEtherActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an transaction notification that has been canceled correctly', () => {
    const tree = renderer.create(
      <TransactionNotification
        activity={canceledActivity}
        issuer={lookupIssuer}
        cancel={() => true}
        authorize={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an transaction notification that has been authorized correctly', () => {
    const tree = renderer.create(
      <TransactionNotification
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
      <TransactionNotification
        activity={activity}
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
      <TransactionNotification
        activity={activity}
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
      <TransactionNotification
        activity={activity}
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
