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
/* globals it, expect */
import 'react-native'
import React from 'react'
import ConnectedCard, { NetworkCard } from '../NetworkCard.js'
import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'
import FakeNavigator from '../../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

const address = '5vZ6nCrJqwhb9nizRBxuPSddrzCBY3mXbu78KMa'
const network = '0xdeadbeef'
const requestId = 14819973609293640

const networkRequest = {
  postback: false,
  id: requestId,
  callback_url: 'https://testapp.uport.me',
  subIdentity: {
    address,
    network
  },
  type: 'net',
  clientId: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
}

const client = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  name: 'Brazil Ministry of Finance'
}

const currentIdentity = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  name: 'Roberto Carlos'
}

const clear = () => null
const cancel = () => {}
const authorize = () => {}

describe('NetworkCard', () => {
  it('renders new request correctly', () => {
    const tree = renderer.create(
      <NetworkCard
        requestId={networkRequest.id}
        address={address}
        network={network}
        currentIdentity={currentIdentity}
        client={client}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders authorized request correctly', () => {
    const tree = renderer.create(
      <NetworkCard
        requestId={networkRequest.id}
        address={address}
        network={network}
        authorized
        currentIdentity={currentIdentity}
        client={client}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders request with errors', () => {
    const tree = renderer.create(
      <NetworkCard
        requestId={networkRequest.id}
        address={address}
        network={network}
        error={'This doesnt work for some reason'}
        currentIdentity={currentIdentity}
        client={client}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders a connected Network Card index as expected', () => {
    const initialState = {}
    const wrapper = global.shallow(
      <ConnectedCard
        request={networkRequest}
        navigator={new FakeNavigator()}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('calls clearRequest correctly', () => {
    const initialState = {}
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const wrapper = global.shallow(
      <ConnectedCard
        navigator={new FakeNavigator()}
      />,
      { context: { store: store } },
    )
    wrapper.props().clearRequest()
    expect(store.dispatch).toHaveBeenCalled()
    // expect(wrapper.dive()).toMatchSnapshot()
  })
  it('calls authorizeRequest correctly', () => {
    const initialState = {}
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const wrapper = global.shallow(
      <ConnectedCard
        navigator={new FakeNavigator()}
      />,
      { context: { store: store } },
    )
    wrapper.props().authorizeRequest(networkRequest)
    expect(store.dispatch).toHaveBeenCalled()
    // expect(wrapper.dive()).toMatchSnapshot()
  })
  it('calls cancelRequest correctly', () => {
    const initialState = {}
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const wrapper = global.shallow(
      <ConnectedCard
        navigator={new FakeNavigator()}
      />,
      { context: { store: store } },
    )
    wrapper.props().cancelRequest(networkRequest)
    expect(store.dispatch).toHaveBeenCalled()
    // expect(wrapper.dive()).toMatchSnapshot()
  })
  it('calls authorizeRequest from the onAccept press', () => {
    const authorizeRequest = jest.fn()
    this.wrapper = global.shallow(
      <NetworkCard
        requestId={networkRequest.id}
        address={address}
        network={network}
        client={client}
        cancelRequest={cancel}
        interactionStats={{share: 1}}
        clear={clear}
        authorizeRequest={authorizeRequest}
        />)
    this.wrapper.find(AcceptCancelGroup).props().onAccept()
    expect(authorizeRequest).toHaveBeenCalled()
  })

  it('calls cancelRequest from the onCancel press', () => {
    const cancelRequest = jest.fn()
    this.wrapper = global.shallow(
      <NetworkCard
        requestId={networkRequest.id}
        address={address}
        network={network}
        client={client}
        cancelRequest={cancelRequest}
        interactionStats={{share: 1}}
        clear={clear}
        authorizeRequest={authorize}
        />)
    this.wrapper.find(AcceptCancelGroup).props().onCancel()
    expect(cancelRequest).toHaveBeenCalled()
  })
})
