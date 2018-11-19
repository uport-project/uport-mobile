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

import { Platform, TouchableOpacity, Vibration } from 'react-native'
import React from 'react'
import ConnectedScanner, { Scanner } from '../index.js'
import toJson from 'enzyme-to-json'
import renderer from 'react-test-renderer'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import { RNCamera } from 'react-native-camera'
import Permissions from 'react-native-permissions'

describe('Scanner', () => {
  it('renders as disabled by default', () => {
    const wrapper = global.shallow(
      <Scanner
        navigator={new FakeNavigator()} />
    )
    wrapper.setState({scannerEnabled: false, hasCameraPermission: true})
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('renders correctly when enabled', () => {
    const wrapper = global.shallow(
      <Scanner navigator={new FakeNavigator()} />
    )
    wrapper.setState({scannerEnabled: true, hasCameraPermission: true})
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('renders error message if not authorized', () => {
    const wrapper = global.shallow(
      <Scanner navigator={new FakeNavigator()} />
    )
    wrapper.setState({scannerEnabled: false, hasCameraPermission: false})
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('calls dismiss modal on Android to close', () => {
    Platform.OS = 'android'
    const navigator = new FakeNavigator()
    navigator.dismissModal = jest.fn()
    const wrapper = global.shallow(
      <Scanner navigator={navigator} />
    )
    wrapper.setState({scannerEnabled: true, hasCameraPermission: true})
    wrapper.find(TouchableOpacity).first().props().onPress()
    expect(navigator.dismissModal).toHaveBeenCalled()
  })

  it('calls toggleDrawer on IOS to close', () => {
    Platform.OS = 'ios'
    const navigator = new FakeNavigator()
    navigator.toggleDrawer = jest.fn()
    const wrapper = global.shallow(
      <Scanner navigator={navigator} />
    )
    wrapper.setState({scannerEnabled: true, hasCameraPermission: true})
    wrapper.find(TouchableOpacity).first().props().onPress()
    expect(navigator.toggleDrawer).toHaveBeenCalled()
  })

  it('calls scanURL correctly', () => {
    Vibration.vibrate = jest.fn()
    const initialState = {}
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()

    const wrapper = global.shallow(
      <ConnectedScanner navigator={new FakeNavigator()} />,
      { context: { store: store } },
    )
    wrapper.setState({scannerEnabled: true, hasCameraPermission: true})
    wrapper.props().scanURL({data: true})
    expect(store.dispatch).toHaveBeenCalled()
  })
})
