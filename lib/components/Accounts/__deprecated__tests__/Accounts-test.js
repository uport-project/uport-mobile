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
import { TouchableOpacity } from 'react-native'
import React from 'react'
import { toClj } from 'mori'
import AccountsConnect, { Accounts, AccountItem, keyExtractor } from '../index.js'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

const accounts = [
  {
    address: '2ojpABYpUQNz6yr9JJABfbbC5LPnxyhrd9J',
    network: 'rinkeby'
  },
  {
    address: '2ojpABYpPQDz6yr9JJABfbbC5LPnxyhrd9J',
    network: 'kovan'
  }
]

describe('Accounts Index', () => {
  it('renders accounts correctly', () => {
    const tree = renderer.create(
      <Accounts
        navigator={new FakeNavigator()}
        notificationsCount={0}
        accounts={toClj(accounts.slice(0, 1))}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders multiple accounts correctly', () => {
    const tree = renderer.create(
      <Accounts
        navigator={new FakeNavigator()}
        notificationsCount={0}
        accounts={toClj(accounts)}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls navigator.pop from the onNavigatorEvent function', () => {
    const navigator = new FakeNavigator()
    navigator.pop = jest.fn()
    this.accountInfo = global.shallow(
      <Accounts
        navigator={navigator}
        notificationsCount={0}
        accounts={toClj(accounts)}
      />
    )
    this.accountInfo.instance().onNavigatorEvent({type: 'NavBarButtonPress', id: 'back'})
    expect(navigator.pop).toHaveBeenCalled()
  })

  it('renders a connected Accounts index as expected', () => {
    const initialState = {}
    const wrapper = global.shallow(
      <AccountsConnect
        navigator={new FakeNavigator()}
        notificationsCount={0}
        accounts={toClj(accounts)}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('extracts keys', () => {
    const item = {address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'}
    const index = 0
    expect(keyExtractor(item, index)).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')
  })

  describe('Account Item', () => {
    it('renders an item correctly', () => {
      this.accountInfo = global.shallow(
        <Accounts
          navigator={new FakeNavigator()}
          notificationsCount={0}
          accounts={toClj(accounts)}
        />
      )
      const tree = renderer.create(this.accountInfo.instance().renderItem({item: {address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a', network: 'rinkeby'}})).toJSON()
      expect(tree).toMatchSnapshot()
    })
    it('calls navigator.push from TouchableOpacity onPress', () => {
      const navigator = new FakeNavigator()
      navigator.push = jest.fn()
      this.wrapper = global.shallow(
        <AccountItem
          navigator={navigator}
          item={{}}
          networkName={'rinkeby'}
        />
      )
      // this.wrapper.instance().photoSelection = photoSelection
      this.wrapper.find(TouchableOpacity).last().props().onPress()
      expect(navigator.push).toHaveBeenCalled()
    })
  })
})
