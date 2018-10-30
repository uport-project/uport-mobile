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
import Avatar from '../Avatar.js'

import renderer from 'react-test-renderer'

const sourceWithUri = {
  uri: 'http:/image.hello.jpg',
  name: 'Bill Jeffries Smith'
}

const sourceWithAvatar = {
  avatar: {
    uri: 'http:/image.hello.jpg'
  },
  name: 'Bill Jeffries Smith'
}

const sourceWithName = {
  name: 'Bill Jeffries Smith'
}

const sourceWithAddress = {
  addres: '0xceaaac60d36d2cb52ac727a93ad5ea301afc89dc'
}

it('renders image if uri is passed in', () => {
  const tree = renderer.create(
    <Avatar
      source={sourceWithUri}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders image if uri is passed in and custom size', () => {
  const tree = renderer.create(
    <Avatar
      size={100}
      source={sourceWithUri}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders image if avatar is passed in', () => {
  const tree = renderer.create(
    <Avatar
      source={sourceWithAvatar}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders image if avatar is passed in and custom size', () => {
  const tree = renderer.create(
    <Avatar
      size={100}
      source={sourceWithAvatar}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders initials if only name is passed in', () => {
  const tree = renderer.create(
    <Avatar
      source={sourceWithName}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders initials if only name passed in and custom size', () => {
  const tree = renderer.create(
    <Avatar
      size={100}
      source={sourceWithName}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders address initials if only address is passed in', () => {
  const tree = renderer.create(
    <Avatar
      source={sourceWithAddress}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders address initials if only address passed in and custom size', () => {
  const tree = renderer.create(
    <Avatar
      size={100}
      source={sourceWithAddress}
      />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
