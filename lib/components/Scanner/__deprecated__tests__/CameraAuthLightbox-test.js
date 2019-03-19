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
import React from 'react'
import { Linking, Platform, TouchableOpacity } from 'react-native'
import CameraAuthLightbox from '../CameraAuthLightbox'
import renderer from 'react-test-renderer'

describe('CameraAuthLightbox', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <CameraAuthLightbox />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls onClose and Linking from TouchableOpacitys on ios', () => {
    Platform.OS = 'ios'
    Linking.openURL = jest.fn()
    const onClose = jest.fn()
    this.wrapper = global.shallow(
      <CameraAuthLightbox
        onClose={onClose}
      />
    )
    // this.wrapper.instance().photoSelection = photoSelection
    this.wrapper.find(TouchableOpacity).first().props().onPress()
    this.wrapper.find(TouchableOpacity).last().props().onPress()
    expect(Linking.openURL).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose from TouchableOpacitys on android', () => {
    Platform.OS = 'android'
    const onClose = jest.fn()
    this.wrapper = global.shallow(
      <CameraAuthLightbox
        onClose={onClose}
      />
    )
    // this.wrapper.instance().photoSelection = photoSelection
    this.wrapper.find(TouchableOpacity).first().props().onPress()
    expect(onClose).toHaveBeenCalled()
  })
})
