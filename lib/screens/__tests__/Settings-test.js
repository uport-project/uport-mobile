/***
 *  Copyright (C) 2018 ConsenSys AG
 *
 *  This file is part of uPort Mobile App
 *  uPort Mobile App is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  uPort Mobile App is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  ERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ***/

import 'react-native'
import React from 'react'
import ConnectedSettingsRoot, { SettingsRoot } from '../Settings'
import FakeNavigator from '../../components/testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'
jest.mock('react-native-device-info', () => {
  const DI = {}
  DI.getBuildNumber = () => {
    return '256'
  }
  return DI
})
describe('SettingsRoot', () => {
  it('renders Settings screen with', () => {
    const tree = renderer.create(<SettingsRoot navigator={new FakeNavigator()} version='256' />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders a connected SettingsRoot as expected', () => {
    const initialState = {}
    const wrapper = global.shallow(<ConnectedSettingsRoot navigator={new FakeNavigator()} version='256' />, {
      context: { store: global.mockStore(initialState) },
    })
    expect(wrapper.dive()).toMatchSnapshot()
  })
})
