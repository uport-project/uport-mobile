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
import { TextInput, TouchableHighlight } from 'react-native'
import React from 'react'
import Editor from '../Editor'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

describe('MyInformation Component', () => {
  it('renders info correctly', () => {
    const tree = renderer.create(
      <Editor navigator={new FakeNavigator()}
        avatar={{uri: 'https://ipfs.infura.io/ipfs/QmaJBgr3xHfY94MTzCUY23UWSpRBdTnBJaN3WrERJkgdGb'}}
        name='Greg'
        userData={{
          email: 'test@test.com',
          country: 'US',
          phone: '+15555551234'
        }}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls photoSelection from TouchableHighlight onPress', () => {
    const navigator = new global.FakeNavigator()
    const photoSelection = jest.fn()
    this.wrapper = global.shallow(
      <Editor
        navigator={navigator}
        photoSelection={photoSelection}
      />
    )
    this.wrapper.find(TouchableHighlight).first().props().onPress()
    expect(photoSelection).toHaveBeenCalled()
  })

  it('calls handleChange from the TextInputs', () => {
    const navigator = new global.FakeNavigator()
    const handleChange = jest.fn()
    this.wrapper = global.shallow(
      <Editor
        navigator={navigator}
        handleChange={handleChange}
      />
    )
    this.wrapper.find(TextInput).first().props().onChangeText()
    this.wrapper.find(TextInput).at(1).props().onChangeText()
    this.wrapper.find(TextInput).at(2).props().onChangeText()
    this.wrapper.find(TextInput).last().props().onChangeText()
    expect(handleChange).toHaveBeenCalled()
  })
})
