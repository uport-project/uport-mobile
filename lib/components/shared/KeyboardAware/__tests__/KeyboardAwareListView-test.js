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
import { FlatList } from 'react-native'
import React from 'react'
import KeyboardAwareListView from '../KeyboardAwareListView'
import renderer from 'react-test-renderer'

describe('KeyboardAwareListView', () => {
  it('renders the KeyboardAwareListView', () => {
    const tree = renderer.create(<KeyboardAwareListView dataSource={{ rowIdentities: [] }} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('calls onKeyboardAwareViewLayout from onLayout', () => {
    this.wrapper = global.shallow(<KeyboardAwareListView dataSource={{ rowIdentities: [] }} />)
    const instance = this.wrapper.instance()
    instance._onKeyboardAwareViewLayout = jest.fn()
    this.wrapper
      .find(FlatList)
      .props()
      .onLayout({ nativeEvent: true })
    expect(instance._onKeyboardAwareViewLayout).toHaveBeenCalled()
  })
  it('calls onKeyboardAwareViewScroll from onScroll', () => {
    const onScroll = jest.fn()
    this.wrapper = global.shallow(<KeyboardAwareListView dataSource={{ rowIdentities: [] }} onScroll={onScroll} />)
    const instance = this.wrapper.instance()
    instance._onKeyboardAwareViewScroll = jest.fn()
    this.wrapper
      .find(FlatList)
      .props()
      .onScroll({ nativeEvent: true })
    expect(instance._onKeyboardAwareViewScroll).toHaveBeenCalled()
    expect(onScroll).toHaveBeenCalled()
  })
  it('calls updateKeyboardAwareViewContentSize from onContentSizeChange', () => {
    this.wrapper = global.shallow(<KeyboardAwareListView dataSource={{ rowIdentities: [] }} />)
    const instance = this.wrapper.instance()
    instance._updateKeyboardAwareViewContentSize = jest.fn()
    this.wrapper
      .find(FlatList)
      .props()
      .onContentSizeChange()
    expect(instance._updateKeyboardAwareViewContentSize).toHaveBeenCalled()
  })
})
