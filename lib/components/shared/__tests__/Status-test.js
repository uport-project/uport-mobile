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
import Status, { Base } from '../Status.js'

import FakeProvider from '../../testHelpers/FakeProvider'
import renderer from 'react-test-renderer'
import { toClj } from 'mori'

it('renders nothing if no status', () => {
  const tree = renderer.create(
    <Base />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders activity indicator if working', () => {
  const tree = renderer.create(
    <Base working />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders offline message if offline', () => {
  const tree = renderer.create(
    <Base offline />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders offline message in custom color if offline', () => {
  const tree = renderer.create(
    <Base offline color='white' />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders activity indicator and message if working', () => {
  const tree = renderer.create(
    <Base
      working
      message='Doing stuff' />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders message', () => {
  const tree = renderer.create(
    <Base message='Doing stuff' />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders message with custom color', () => {
  const tree = renderer.create(
    <Base message='Doing stuff' color='white' />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders activity indicator and error if working', () => {
  const tree = renderer.create(
    <Base
      working
      error='It did not work' />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders error', () => {
  const tree = renderer.create(
    <Base error='It did not work' />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

describe('container', () => {
  // Test of container
  const process = 'nisaba'
  const empty = {
    status: toClj({}),
    networking: {}
  }

  const offline = {
    status: toClj({}),
    networking: { online: false }
  }

  const working = {
    status: toClj({
      nisaba: { working: true }
    }),
    networking: {}
  }

  const workingAndMessage = {
    status: toClj({
      nisaba: {
        working: true,
        message: 'sending number'
      }
    }),
    networking: {}
  }

  const errorState = {
    status: toClj({
      nisaba: { error: 'Server is down' }
    }),
    networking: {}
  }

  it('renders empty status', () => {
    const tree = renderer.create(
      <FakeProvider state={empty}>
        <Status process={process} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders offline status', () => {
    const tree = renderer.create(
      <FakeProvider state={offline}>
        <Status process={process} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders working status', () => {
    const tree = renderer.create(
      <FakeProvider state={working}>
        <Status process={process} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders working status', () => {
    const tree = renderer.create(
      <FakeProvider state={workingAndMessage}>
        <Status process={process} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders error status', () => {
    const tree = renderer.create(
      <FakeProvider state={errorState}>
        <Status process={process} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

})
