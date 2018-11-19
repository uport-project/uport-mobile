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
import 'jsdom-global/register'
import { Clipboard, TouchableOpacity } from 'react-native'
import React from 'react'
import AccountInfoConnect, { AccountInfo, mapDispatchToProps } from '../AccountInfo'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

beforeAll(() => {
  // Clears the database and adds some testing data.
  // Jest will wait for this promise to resolve before running tests.

})
describe('AccountInfo Component', () => {
  it('renders info correctly', () => {
    const tree = renderer.create(
      <AccountInfo navigator={new FakeNavigator()}
        hexaddress='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        balance={0}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders a connected AccountInfo as expected', () => {
    const initialState = {}
    const wrapper = global.shallow(
      <AccountInfoConnect
        navigator={new FakeNavigator()}
        hexaddress='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        address='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        balance={0}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('should call dispatch when the refresh function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).refreshBalance()
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('calls props.refreshBalance from the component function refreshBalance', () => {
    const refreshBalance = jest.fn()
    this.accountInfo = global.shallow(
      <AccountInfo
        navigator={new FakeNavigator()}
        hexaddress='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        address='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        balance={0}
        refreshBalance={refreshBalance}
      />
    )
    this.accountInfo.instance().refreshBalance()
    expect(refreshBalance).toHaveBeenCalled()
  })

  it('calls copyHandler', () => {
    const refreshBalance = jest.fn()
    Clipboard.setString = jest.fn()
    const navigator = new global.FakeNavigator()
    navigator.dismissModal = jest.fn()
    this.accountInfo = global.shallow(
      <AccountInfo
        navigator={navigator}
        hexaddress='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        address='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        balance={0}
        refreshBalance={refreshBalance}
      />
    )
    this.accountInfo.instance().copyHandler()
    expect(Clipboard.setString).toHaveBeenCalled()
    expect(navigator.dismissModal).toHaveBeenCalled()
  })
})
