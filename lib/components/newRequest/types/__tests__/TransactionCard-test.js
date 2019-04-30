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
import { Button, Linking, TouchableOpacity } from 'react-native'
import React from 'react'
import ConnectedCard, { TransactionCard, formatBytes } from '../TransactionCard.js'
import { AcceptCancelGroup, CancelButton, PrimaryButton } from 'uPortMobile/lib/components/shared/Button'
import FakeNavigator from '../../../testHelpers/FakeNavigator'

import renderer from 'react-test-renderer'
import BN from 'bn.js'
import base58 from 'bs58'

jest.useFakeTimers()

const request = {
  id: 10,
  type: 'transaction',
  client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  network: '0x4',
  to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  balance: {ethBalance: 0, usdBalance: 0},
  gasCost: 0.002

}

const requestWithAbi = {
  id: 10,
  type: 'transaction',
  network: '0x4',
  client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  fn: 'updateStuff()',
  abi: {name: 'updateStuff', types: ['uint', 'address', 'bytes', 'bytes32'], args: [123, '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02', `hello\rthere`, 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz']}
}

const updatePublicUport = {
  id: 10,
  type: 'transaction',
  client_id: '0xb9C1598e24650437a3055F7f66AC1820c419a679',
  to: '0xb9C1598e24650437a3055F7f66AC1820c419a679',
  fnSig: '6737c877',
  fn: 'setAttributes()',
  changes: {name: 'Natoshi Sakamoto', image: {contentUrl: '/ipfs/afadfadf'}},
  abi: {name: 'setAttributes', types: ['bytes'], args: ['afadfadf']}
}

const requestWithAbiWithoutArgsButWithValue = {
  id: 10,
  network: '0x3',
  type: 'transaction',
  client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  fn: 'buyTokens()',
  abi: {name: 'buyTokens', types: [], args: null},
  value: 1010000000000000000
}

const client = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  name: 'Coinbase'
}

const destination = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  name: 'Gnosis'
}

const cancel = () => {}
const authorize = () => {}
const clear = () => {}

describe('TransactionCard', () => {
  it('renders correctly with only request', () => {
    const tree = renderer.create(
      <TransactionCard request={request} cancelRequest={cancel}
        authorizeRequest={authorize} clear={clear}
        validDestination />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with both client and destination', () => {
    const tree = renderer.create(
      <TransactionCard request={request} client={client} destination={destination} clear={clear}
        cancelRequest={cancel} authorizeRequest={authorize} validDestination />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with destination being validated', () => {
    const tree = renderer.create(
      <TransactionCard request={request} client={client} destination={destination} clear={clear}
        cancelRequest={cancel} authorizeRequest={authorize} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with destination being invalid destination', () => {
    const tree = renderer.create(
      <TransactionCard request={request} client={client} destination={destination} clear={clear}
        cancelRequest={cancel} authorizeRequest={authorize} validDestination={false} network='ropsten'
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with request and a value', () => {
    const tree = renderer.create(
      <TransactionCard request={{...request, value: 100000}} balance={0} cancelRequest={cancel} authorizeRequest={authorize} clear={clear}
        validDestination />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with request and a value with insufficient balance', () => {
    const tree = renderer.create(
      <TransactionCard request={{...request, value: 100001}} balance={0} cancelRequest={cancel} authorizeRequest={authorize} clear={clear}
        validDestination />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with request and a 0 value', () => {
    const tree = renderer.create(
      <TransactionCard
        request={{...request, value: 0}}
        cancelRequest={cancel}
        authorizeRequest={authorize}
        clear={clear}
        validDestination />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with abi with args and a no value', () => {
    const tree = renderer.create(
      <TransactionCard request={requestWithAbi} cancelRequest={cancel} authorizeRequest={authorize} clear={clear}
        validDestination />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with abi without args and value', () => {
    const tree = renderer.create(
      <TransactionCard request={requestWithAbiWithoutArgsButWithValue} cancelRequest={cancel} authorizeRequest={authorize} clear={clear}
        validDestination />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with publicUportTransaction', () => {
    const tree = renderer.create(
      <TransactionCard request={updatePublicUport} cancelRequest={cancel} authorizeRequest={authorize} clear={clear}
        validDestination />
    ).toJSON()
    expect(tree).toMatchSnapshot()
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
    wrapper.props().authorizeRequest(request)
    expect(store.dispatch).toHaveBeenCalled()
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
    wrapper.props().cancelRequest(request)
    expect(store.dispatch).toHaveBeenCalled()
  })
  it('calls authorizeRequest from the onAccept press', () => {
    const authorizeRequest = jest.fn()
    const recoveryRequest = request
    recoveryRequest.authorizedAt = false
    this.wrapper = global.shallow(
      <TransactionCard
        request={{...request, value: 0, authorizedAt: false}}
        cancelRequest={cancel}
        authorizeRequest={authorizeRequest}
        gasCost={0.2}
        balance={1}
        validDestination />)
    this.wrapper.find(PrimaryButton).props().onPress()
    expect(authorizeRequest).toHaveBeenCalled()
  })

  it('calls linking open from a Button press', () => {
    Linking.openURL = jest.fn()
    const txRequest = request
    txRequest.authorizedAt = false
    txRequest.txhash = '0x3532'
    this.wrapper = global.shallow(
      <TransactionCard
        request={txRequest}
        cancelRequest={cancel}
        authorizeRequest={authorize}
        validDestination
        />)
    this.wrapper.find(Button).first().props().onPress()
    expect(Linking.openURL).toHaveBeenCalled()
  })
  // it('returns correct bytes format from hex', () => {
  //   const buffer = new Buffer('1220abc657def8abc657def8abc657def8abc657def8abc657def8abc657def8')
  //   expect(formatBytes('1220abc657def8abc657def8abc657def8abc657def8abc657def8abc657def8')).toEqual(base58.encode(buffer))
  // })
})
