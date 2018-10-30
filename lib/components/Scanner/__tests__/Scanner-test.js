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
jest.mock('react-native-camera', () => {
  const RNC = {}

  RNC.RNCamera = (props) => (
    <div {...props}>{props.children}</div>
  )
  RNC.RNCamera.constants = {}
  RNC.RNCamera.constants.Aspect = {}
  return RNC
})

// Permissions.request = jest.fn(() => Promise.resolve('authorized'))

import { Platform, TouchableOpacity, Vibration } from 'react-native'
import React from 'react'
import ConnectedScanner, { Scanner } from '../index.js'
import toJson from 'enzyme-to-json'
import renderer from 'react-test-renderer'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import { RNCamera } from 'react-native-camera'
import Permissions from 'react-native-permissions'

const currentIdentity = {
  avatar: {
    uri: 'https://ipfs.infura.io/ipfs/QmaJBgr3xHfY94MTzCUY23UWSpRBdTnBJaN3WrERJkgdGb'
  },
  name: 'Jeff PictureTest',
  publicKey: '0x04c164b7e86e75d41a74964dc5864facd1a7e472d011b33a84a1365b47d30d7752e26446752cf928056ad903377d2002a30d71f967b3ae348231a2ad1a0e92d3a1'
}
describe('Scanner', () => {
  it('renders correctly when enabled', () => {
    Permissions.check = jest.fn(() => Promise.resolve('authorized'))
    const tree = renderer.create(
      <Scanner
        publicUport={currentIdentity}
        enabled
        authorization={{cameraAuthorized: 'authorized'}} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders error message if not authorized', () => {
    Permissions.check = jest.fn(() => Promise.resolve('denied'))
    const tree = renderer.create(
      <Scanner
        authorization={{cameraAuthorized: 'denied'}}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  // const wrapper = shallow(<MyComponent foo="bar" />);
  // expect(spy.calledOnce).to.equal(false);
  // wrapper.setProps({ foo: 'foo' });
  // expect(spy.calledOnce).to.equal(true);
  it('handles a nextProps enabled', () => {
    const setState = jest.fn()
    const navigator = FakeNavigator
    navigator.toggleDrawer = jest.fn()
    const wrapper = global.shallow(
      <Scanner
        publicUport={currentIdentity}
        enabled={false}
        authorization={{cameraAuthorized: 'authorized'}} />
    )
    const instance = wrapper.instance()
    instance.setState = setState
    wrapper.setProps({enabled: true})
    expect(setState).toHaveBeenCalled()
    expect(instance.hasBarcode).toEqual(false)
  })

  it('handles a nextProps disabled', () => {
    const setState = jest.fn()
    const navigator = FakeNavigator
    navigator.toggleDrawer = jest.fn()
    const wrapper = global.shallow(
      <Scanner
        publicUport={currentIdentity}
        enabled
        authorization={{cameraAuthorized: 'authorized'}} />
    )
    const instance = wrapper.instance()
    instance.setState = setState
    wrapper.setProps({enabled: false})
    expect(setState).toHaveBeenCalled()
    expect(instance.hasBarcode).toEqual(true)
  })
  it('handles nextProps and currentProps enabled to be false', () => {
    const setState = jest.fn()
    const navigator = FakeNavigator
    navigator.toggleDrawer = jest.fn()
    const wrapper = global.shallow(
      <Scanner
        publicUport={currentIdentity}
        enabled
        authorization={{cameraAuthorized: 'authorized'}} />
    )
    const instance = wrapper.instance()
    instance.setState = setState
    wrapper.setProps({enabled: true})
    expect(setState).toHaveBeenCalled()
    expect(instance.hasBarcode).toEqual(false)
  })
    // 36,38,39,81
  it('handles a barcode read correctly', () => {
    const scanURL = jest.fn()
    const setState = jest.fn()
    const navigator = FakeNavigator
    navigator.pop = jest.fn()
    const wrapper = global.shallow(
      <Scanner
        navigator={navigator}
        scanURL={scanURL}
        scanError={false}
        cameraEnabled
        publicUport={currentIdentity}
        enabled
        authorization={{cameraAuthorized: 'authorized'}} />
    )
    wrapper.setState({scan: true, currentAppState: 'active'})
    wrapper.instance().setState = setState
    wrapper.find(RNCamera).props().onBarCodeRead()
    expect(scanURL).toHaveBeenCalled()
    expect(setState).toHaveBeenCalled()
    expect(navigator.pop).toHaveBeenCalled()
  })
  it('renders a DisabledScanner with a scanError correctly', () => {
    const wrapper = global.shallow(
      <Scanner
        publicUport={currentIdentity}
        enabled
        scanError
        authorization={{cameraAuthorized: 'authorized'}} />
    )
    wrapper.setState({scan: false})
    expect(toJson(wrapper)).toMatchSnapshot()
  })
  it('renders a DisabledScanner correctly', () => {
    Platform.OS = 'android'
    const wrapper = global.shallow(
      <Scanner
        publicUport={currentIdentity}
        enabled
        scanError={false}
        authorization={{cameraAuthorized: 'authorized'}} />
    )
    wrapper.setState({scan: false})
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('renders a Scanner correctly', () => {
    const wrapper = global.shallow(
      <Scanner
        scanError={false}
        cameraEnabled
        publicUport={currentIdentity}
        enabled
        authorization={{cameraAuthorized: 'authorized'}} />
    )
    wrapper.setState({scan: true, currentAppState: 'active'})
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('calls navigator from the TouchableOpacity', () => {
    Platform.OS = 'android'
    const navigator = FakeNavigator
    navigator.pop = jest.fn()
    const wrapper = global.shallow(
      <Scanner
        scanError={false}
        cameraEnabled
        publicUport={currentIdentity}
        enabled
        navigator={navigator}
        authorization={{cameraAuthorized: 'authorized'}} />
    )
    wrapper.setState({scan: true, currentAppState: 'active'})
    wrapper.find(TouchableOpacity).first().props().onPress()
    expect(navigator.pop).toHaveBeenCalled()
  })

  it('calls scanURL correctly', () => {
    Vibration.vibrate = jest.fn()
    const initialState = {
      scanner: {
        cameraEnabled: true
      }
    }
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()

    const wrapper = global.shallow(
      <ConnectedScanner
        publicUport={currentIdentity}
        enabled
        authorization={{cameraAuthorized: 'authorized'}} />,
      { context: { store: store } },
    )
    wrapper.props().scanURL({data: true})
    expect(store.dispatch).toHaveBeenCalled()
  })

  it('calls clearError correctly', () => {
    const initialState = {
      scanner: {
        cameraEnabled: true
      }
    }
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const wrapper = global.shallow(
      <ConnectedScanner
        publicUport={currentIdentity}
        enabled
        authorization={{cameraAuthorized: 'authorized'}} />,
      { context: { store: store } },
    )
    wrapper.props().clearError()
    expect(store.dispatch).toHaveBeenCalled()
  })
})
