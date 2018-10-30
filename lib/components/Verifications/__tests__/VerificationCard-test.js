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
import ConnectedVerificationCard, { VerificationCard } from '../VerificationCard'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import FakeProvider from '../../testHelpers/FakeProvider'
import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'
import renderer from 'react-test-renderer'
jest.mock('uPortMobile/lib/components/Verifications/ExpirationItem', () => 'ExpirationItem')
const initState = {}

const issuer = {
  name: 'testName'
}

const issuerWithLogo = {
  name: 'testName',
  avatar: {
    uri: 'http:/image.hello.jpg'
  }
}

const verification = {
  sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  claim: { employer: 'Consensys AG' },
  iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  iat: 1482268217248,
  exp: 1482354617248,
  token: 'tokenstring'
}

const complexVerification = {
  sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  claim: {
    identityVerification: {
      name: 'Bob Van Duck',
      postalCode: 'BH15 12Q'
    }
  },
  iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  iat: 1482268217248,
  exp: 1482354617248,
  token: 'tokenstring'
}

describe('VerificationCard', () => {
  it('renders VerificationCard', () => {
    const tree = renderer.create(
      <FakeProvider state={initState}>
        <VerificationCard
          verification={verification}
          title='employer'
          issuer={issuerWithLogo}
          claims={[{ key: 'employer', value: 'Consensys AG' }]}
          navigator={new FakeNavigator()} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders VerificationCard without logo', () => {
    const tree = renderer.create(
      <FakeProvider state={initState}>
        <VerificationCard
          verification={verification}
          title='employer'
          issuer={issuer}
          claims={[{ key: 'employer', value: 'Consensys AG' }]}
          navigator={new FakeNavigator()} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders VerificationCard with no issuer', () => {
    const tree = renderer.create(
      <FakeProvider state={initState}>
        <VerificationCard
          verification={verification}
          title='employer'
          issuer={{}}
          claims={[{ key: 'employer', value: 'Consensys AG' }]}
          navigator={new FakeNavigator()} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders complex VerificationCard', () => {
    const tree = renderer.create(
      <FakeProvider state={initState}>
        <VerificationCard
          verification={complexVerification}
          title='identityVerification'
          issuer={issuer}
          claims={[
            {
              key: 'name',
              value: 'Bob Van Duck'
            }, {
              key: 'postalCode',
              value: 'BH15 12Q'
            }]}
          navigator={new FakeNavigator()} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  // 6,87,89

  it('calls navigator.showModal when the edit button is pressed', () => {
    const navigator = new global.FakeNavigator()
    navigator.showModal = jest.fn()
    const request = {
      postback: false,
      id: 14819973609293640,
      callback_url: 'https://testapp.uport.me',
      type: 'attestation',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
    }
    this.wrapper = global.shallow(
      <VerificationCard
        request={request}
        showActions
        verification={complexVerification}
        title='identityVerification'
        issuer={issuer}
        claims={[
          {
            key: 'name',
            value: 'Bob Van Duck'
          }, {
            key: 'postalCode',
            value: 'BH15 12Q'
          }]}
        navigator={navigator} />)
    const instance = this.wrapper.instance()
    instance.onNavigatorEvent({id: 'edit', type: 'NavBarButtonPress'})
    expect(navigator.showModal).toHaveBeenCalled()
  })

  it('calls removeAttestation, navigator.dismissModal, and navigator.pop from deleteVerification', () => {
    const navigator = new global.FakeNavigator()
    navigator.dismissModal = jest.fn()
    navigator.pop = jest.fn()
    const removeAttestation = jest.fn()
    this.wrapper = global.shallow(
      <VerificationCard
        removeAttestation={removeAttestation}
        verification={complexVerification}
        issuer={issuer}
        navigator={navigator} />)
    const instance = this.wrapper.instance()
    instance.deleteVerification()
    expect(navigator.dismissModal).toHaveBeenCalled()
    expect(navigator.pop).toHaveBeenCalled()
    expect(removeAttestation).toHaveBeenCalled()
  })

  it('calls authorizeRequest from the onAccept press', () => {
    const authorizeRequest = jest.fn()
    const request = {
      postback: false,
      id: 14819973609293640,
      callback_url: 'https://testapp.uport.me',
      type: 'attestation',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
    }
    this.wrapper = global.shallow(
      <VerificationCard
        request={request}
        showActions
        authorizeRequest={authorizeRequest}
        verification={complexVerification}
        title='identityVerification'
        issuer={issuer}
        claims={[
          {
            key: 'name',
            value: 'Bob Van Duck'
          }, {
            key: 'postalCode',
            value: 'BH15 12Q'
          }]}
        navigator={new FakeNavigator()} />)
    this.wrapper.find(AcceptCancelGroup).props().onAccept()
    expect(authorizeRequest).toHaveBeenCalled()
  })

  it('calls cancelRequest from the onCancel press', () => {
    const cancelRequest = jest.fn()
    const request = {
      postback: false,
      id: 14819973609293640,
      callback_url: 'https://testapp.uport.me',
      type: 'attestation',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
    }
    this.wrapper = global.shallow(
      <VerificationCard
        request={request}
        showActions
        cancelRequest={cancelRequest}
        verification={complexVerification}
        title='identityVerification'
        issuer={issuer}
        claims={[
          {
            key: 'name',
            value: 'Bob Van Duck'
          }, {
            key: 'postalCode',
            value: 'BH15 12Q'
          }]}
        navigator={new FakeNavigator()} />)
    this.wrapper.find(AcceptCancelGroup).props().onCancel()
    expect(cancelRequest).toHaveBeenCalled()
  })

  it('renders a connected component as expected', () => {
    // const initialState = empty
    const wrapper = global.shallow(
      <ConnectedVerificationCard
        verification={verification}
        issuer={issuer}
        navigator={new global.FakeNavigator()}
      />,
      { context: { store: global.mockStore({}) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('calls removeAttestation correctly', () => {
    const store = global.mockStore(initState)
    store.dispatch = jest.fn()
    this.wrapper = global.shallow(
      <ConnectedVerificationCard
        verification={complexVerification}
        title='identityVerification'
        issuer={issuer}
        claims={[
          {
            key: 'name',
            value: 'Bob Van Duck'
          }, {
            key: 'postalCode',
            value: 'BH15 12Q'
          }]}
        navigator={new FakeNavigator()} />,
      { context: { store: store } },
    )
    this.wrapper.props().removeAttestation()
    expect(store.dispatch).toHaveBeenCalled()
  })
  it('calls authorizeRequest correctly', () => {
    const store = global.mockStore(initState)
    store.dispatch = jest.fn()
    this.wrapper = global.shallow(
      <ConnectedVerificationCard
        verification={complexVerification}
        title='identityVerification'
        issuer={issuer}
        claims={[
          {
            key: 'name',
            value: 'Bob Van Duck'
          }, {
            key: 'postalCode',
            value: 'BH15 12Q'
          }]}
        navigator={new FakeNavigator()} />,
      { context: { store: store } },
    )
    this.wrapper.props().authorizeRequest({})
    expect(store.dispatch).toHaveBeenCalled()
  })
  it('calls cancelRequest correctly', () => {
    let store = global.mockStore(initState)
    store.dispatch = jest.fn()
    this.wrapper = global.shallow(
      <ConnectedVerificationCard
        verification={complexVerification}
        title='identityVerification'
        issuer={issuer}
        claims={[
          {
            key: 'name',
            value: 'Bob Van Duck'
          }, {
            key: 'postalCode',
            value: 'BH15 12Q'
          }]}
        navigator={new FakeNavigator()} />,
      { context: { store: store } },
    )
    this.wrapper.props().cancelRequest({})
    expect(store.dispatch).toHaveBeenCalled()
  })
})
