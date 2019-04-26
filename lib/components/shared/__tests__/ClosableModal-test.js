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
import { TouchableHighlight } from 'react-native'
import React from 'react'
import ClosableModal from '../ClosableModal'

import renderer from 'react-test-renderer'

jest.mock('react-native-navigation', () => {
  return {
    Navigation: {
      dismissModal: jest.fn,
    },
  }
})

describe('ClosableModal', () => {
  it('renders without title', () => {
    const tree = renderer.create(<ClosableModal componentId={'TESTID'} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders with title', () => {
    const tree = renderer.create(<ClosableModal componentId={'TESTID'} title='Select your country' />).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('calls onClose and navigator.dismissModal from the TouchableHighlight', () => {
    const onClose = jest.fn()
    this.wrapper = global.shallow(<ClosableModal componentId={'TESTID'} onClose={onClose} />)
    this.wrapper
      .find(TouchableHighlight)
      .props()
      .onPress()
    expect(onClose).toHaveBeenCalled()
  })
})
