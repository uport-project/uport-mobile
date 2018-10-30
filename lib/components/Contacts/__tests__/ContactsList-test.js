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
import ConnectedContactsList, { ContactsList } from '../ContactsList'
import Icon from 'react-native-vector-icons/Ionicons'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

const connections = [
  { name: 'Testy McTesterson',
    address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
    avatar: {}
  }
]
describe('ContactsList', () => {
  it('renders ContactsList screen', () => {
    const tree = renderer.create(
      <ContactsList navigator={new FakeNavigator()} connections={connections} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders an empty ContactsList screen', () => {
    const tree = renderer.create(
      <ContactsList navigator={new FakeNavigator()} connections={[]} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('renders a connected ContactsList as expected', () => {
    const initialState = {}
    const wrapper = global.shallow(
      <ConnectedContactsList
        navigator={new FakeNavigator()}
        hexaddress='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        address='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        balance={0}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('calls navigator.push when the back button is pressed', () => {
    const navigator = new global.FakeNavigator()
    navigator.pop = jest.fn()
    this.wrapper = global.shallow(
      <ContactsList
        navigator={navigator}
      />
    )
    const instance = this.wrapper.instance()
    instance.onNavigatorEvent({id: 'back', type: 'NavBarButtonPress'})
    expect(navigator.pop).toHaveBeenCalled()
  })

  it('sets buttons when the component mounts', () => {
    const navigator = new global.FakeNavigator()
    navigator.setButtons = jest.fn()
    Icon.getImageSource = jest.fn(() => Promise.resolve(true))
    this.wrapper = global.shallow(
      <ContactsList
        navigator={navigator}
      />
    )
    const instance = this.wrapper.instance()
    instance.componentDidMount()
    expect(Icon.getImageSource).toHaveBeenCalled()
  })
})
