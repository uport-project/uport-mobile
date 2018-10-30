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
import { Notifications } from '../Notifications.js'
import { rootNavigator } from '../../Home'
import renderer from 'react-test-renderer'

describe('Notifications', () => {
  it('renders the amount of unread notifications', () => {
    const tree = renderer.create(
      <Notifications
        unread={12}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders the singular amount of unread notifications', () => {
    const tree = renderer.create(
      <Notifications
        unread={1}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders nothing with no unread notificatios', () => {
    const tree = renderer.create(
      <Notifications
        unread={0}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls showModal from TouchableOpacity onPress', () => {
    rootNavigator.showModal = jest.fn()
    this.wrapper = global.shallow(
      <Notifications
        unread={1}
        />
    )
    this.wrapper.find(TouchableOpacity).props().onPress()
    expect(rootNavigator.showModal).toHaveBeenCalled()
  })
})
