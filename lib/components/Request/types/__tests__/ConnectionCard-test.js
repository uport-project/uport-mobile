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
import ConnectedCard, { ConnectionCard } from '../ConnectionCard.js'
import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'
import renderer from 'react-test-renderer'
import FakeNavigator from '../../../testHelpers/FakeNavigator'
import { authorizeRequest, cancelRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'
// jest.mock('uPortMobile/lib/actions/requestActions', () => {
//   return {
//     author
//     startMain: () => true
//   }
// })

const request = {
  postback: false,
  id: 14819973609293640,
  callback_url: 'https://testapp.uport.me',
  type: 'connect',
  to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
}

const contact = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  name: 'Joanna Hayek',
  '@type': 'Person'
}

const clear = () => null
const cancel = () => {}
const authorize = () => {}
describe('ConnectionCard', () => {
  it('renders correctly with an unkown contact', () => {
    const tree = renderer.create(
      <ConnectionCard
        request={request}
        currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
        contact={{}}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a complete profile', () => {
    const tree = renderer.create(
      <ConnectionCard
        request={request}
        currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
        contact={contact}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('renders correctly with a cancelled Request', () => {
    const cancelledRequest = request
    cancelledRequest.canceledAt = true
    const tree = renderer.create(
      <ConnectionCard
        request={cancelledRequest}
        currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
        contact={contact}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a authorizedAt Request', () => {
    const authorizedRequest = request
    authorizedRequest.authorizedAt = true
    const tree = renderer.create(
      <ConnectionCard
        request={authorizedRequest}
        currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
        contact={contact}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a existing Request', () => {
    const existingRequest = request
    existingRequest.existing = true
    const tree = renderer.create(
      <ConnectionCard
        request={existingRequest}
        currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
        contact={contact}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a contact that is me', () => {
    const meContact = contact
    meContact.address = '0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
    const tree = renderer.create(
      <ConnectionCard
        request={request}
        currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
        contact={contact}
        cancelRequest={cancel}
        clear={clear}
        authorizeRequest={authorize}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders a connected Connection Card index as expected', () => {
    const initialState = {
      request: request
    }
    const wrapper = global.shallow(
      <ConnectedCard
        navigator={new FakeNavigator()}

      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('calls clearRequest correctly', () => {
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const initialState = {}
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
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const initialState = {}
    const wrapper = global.shallow(
      <ConnectedCard
        navigator={new FakeNavigator()}

      />,
      { context: { store: store } },
    )
    wrapper.props().authorizeRequest(request)
    expect(store.dispatch).toHaveBeenCalled()
    // expect(wrapper.dive()).toMatchSnapshot()
  })
  it('calls cancelRequest correctly', () => {
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const initialState = {}
    const wrapper = global.shallow(
      <ConnectedCard
        navigator={new FakeNavigator()}

      />,
      { context: { store: store } },
    )
    wrapper.props().cancelRequest(request)
    expect(store.dispatch).toHaveBeenCalled()
    // expect(wrapper.dive()).toMatchSnapshot()
  })

  it('calls authorizeRequest from the onAccept press', () => {
    const navigator = new global.FakeNavigator()
    const authorizeRequest = jest.fn()
    const request = {
      postback: false,
      id: 14819973609293640,
      callback_url: 'https://testapp.uport.me',
      type: 'connect',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
    }
    this.wrapper = global.shallow(
      <ConnectionCard
        contact={contact}
        request={request}
        navigator={navigator}
        authorizeRequest={authorizeRequest}
      />)
    this.wrapper.find(AcceptCancelGroup).props().onAccept()
    expect(authorizeRequest).toHaveBeenCalled()
  })

  it('calls cancelRequest from the onCancel press', () => {
    const navigator = new global.FakeNavigator()
    const cancelRequest = jest.fn()
    const request = {
      postback: false,
      id: 14819973609293640,
      callback_url: 'https://testapp.uport.me',
      type: 'connect',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
    }
    this.wrapper = global.shallow(
      <ConnectionCard
        contact={contact}
        request={request}
        navigator={navigator}
        cancelRequest={cancelRequest}
      />)
    this.wrapper.find(AcceptCancelGroup).props().onCancel()
    expect(cancelRequest).toHaveBeenCalled()
  })
})
