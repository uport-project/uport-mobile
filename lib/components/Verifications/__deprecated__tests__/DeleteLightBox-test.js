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
import {TouchableHighlight} from 'react-native'
import React from 'react'
import DeleteLightbox from '../DeleteLightbox'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

const title = 'Delete this Verification?'
const content = 'Are you absolutely sure?'
function onClose () {}
function onDelete () {}

describe('DeleteLightbox', () => {
  it('renders DeleteLightbox', () => {
    const tree = renderer.create(
      <DeleteLightbox
        title={title}
        content={content}
        onClose={onClose}
        onDelete={onDelete}
        navigator={new FakeNavigator()} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls photoSelection from TouchableHighlight onPress', () => {
    const onDelete = jest.fn()
    const onClose = jest.fn()
    this.wrapper = global.shallow(
      <DeleteLightbox
        title={title}
        content={content}
        onClose={onClose}
        onDelete={onDelete}
        navigator={new FakeNavigator()} />
    )
    this.wrapper.find(TouchableHighlight).first().props().onPress()
    this.wrapper.find(TouchableHighlight).last().props().onPress()
    expect(onDelete).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
