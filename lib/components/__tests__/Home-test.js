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
import React from 'react'
import { TouchableOpacity } from 'react-native'
import ConnectedHome, { Home } from '../Home'
import FakeNavigator from '../testHelpers/FakeNavigator'
import FakeProvider from '../testHelpers/FakeProvider'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import renderer from 'react-test-renderer'
import { toClj } from 'mori'
jest.useFakeTimers()

const withIdentity = {
  uport: toClj({
    currentIdentity: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
    byAddress: {
      '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a': {
        controllerAddress: '0xff708db3af14fbd9b125ac88d3f7c1c03e6bc36f',
        deviceAddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
        publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
        publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
        network: 'ropsten',
        recoveryAddress: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
        address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
        own: {
          name: 'Alice',
          phone: '555-555-5555',
          description: 'Always part of any transaction',
          avatar: { uri: '/ipfs/avatar' },
          banner: { uri: '/ipfs/banner' },
          connections: {
            knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02']
          }
        }
      }
    }
  })
}
const withActivities = {
  uport: toClj({
    currentIdentity: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
    byAddress: {
      '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a': {
        controllerAddress: '0xff708db3af14fbd9b125ac88d3f7c1c03e6bc36f',
        deviceAddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
        publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
        publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
        network: 'ropsten',
        recoveryAddress: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
        address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
        own: {
          name: 'Bob',
          connections: {
            knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02']
          }
        },
        activities: {
          '10': {
            id: 10,
            type: 'sign',
            authorizedAt: 14834004807621990,
            client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
            to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
          },
          '11': {
            id: 11,
            type: 'connect',
            authorizedAt: 14834004807621990,
            to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
          },
          '12': {
            id: 12,
            type: 'disclosure',
            client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc03'
          },
          '13': {
            id: 13,
            type: 'attestation',
            iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'
          },
          '18': {
            id: '18',
            type: 'attestation',
            authorizedAt: 14834004807621990,
            opened: true,
            attestations: [{name: 'Bob'}]
          },
          '19': {
            id: '19',
            type: 'attestation',
            authorizedAt: 14834004807621990,
            attestations: [{name: 'Bob'}]
          }
        }
      }
    }
  })
}

describe('Home Component', () => {
  it('home screen rendering without activities', () => {
    const tree = renderer.create(
      <FakeProvider state={withIdentity}>
        <ConnectedHome navigator={new FakeNavigator()} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('home screen rendering with activities', () => {
    const tree = renderer.create(
      <FakeProvider state={withActivities}>
        <ConnectedHome navigator={new FakeNavigator()} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('calls navigator.push from TouchableOpacity onPress', () => {
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <Home
        navigator={navigator}
      />
    )
    // this.wrapper.instance().photoSelection = photoSelection
    this.wrapper.find(TouchableOpacity).first().props().onPress()
    this.wrapper.find(TouchableOpacity).last().props().onPress()
    this.wrapper.find(TouchableOpacity).at(1).props().onPress()
    expect(navigator.push).toHaveBeenCalled()
  })

  it('sets buttons when the component mounts', () => {
    const navigator = new global.FakeNavigator()
    navigator.setButtons = jest.fn()
    Icon.getImageSource = jest.fn(() => Promise.resolve(true))
    this.wrapper = global.shallow(
      <Home
        navigator={navigator}
      />
    )
    const instance = this.wrapper.instance()
    instance.componentDidMount()
    expect(Icon.getImageSource).toHaveBeenCalled()
  })

  it('calls navigator.push when the menu button is pressed', () => {
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <Home
        navigator={navigator}
      />
    )
    const instance = this.wrapper.instance()
    instance.onNavigatorEvent({id: 'menu', type: 'NavBarButtonPress'})
    expect(navigator.push).toHaveBeenCalled()
  })
})
