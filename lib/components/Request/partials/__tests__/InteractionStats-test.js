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
import InteractionStats from '../InteractionStats.js'

import renderer from 'react-test-renderer'

const namedParty = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  name: 'Coinbase'
}

const unnamedParty = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
}
describe('InteractionStats', () => {
  it('renders you have never if no stats', () => {
    const tree = renderer.create(
      <InteractionStats
        actionText='shared your details'
        counterParty={namedParty}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders you have never if 0 stats', () => {
    const tree = renderer.create(
      <InteractionStats
        actionText='shared your details'
        counterParty={namedParty}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders with "once" if exactly 1 as stats', () => {
    const tree = renderer.create(
      <InteractionStats
        actionText='shared your details'
        stats={{share: 1}}
        counterParty={namedParty}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders with "2 times" if exactly 2 as stats', () => {
    const tree = renderer.create(
      <InteractionStats
        stats={{share: 2}}
        actionText='shared your details'
        counterParty={namedParty}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders nothing if no counter party', () => {
    const tree = renderer.create(
      <InteractionStats
        stats={2}
        actionText='shared your details'
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders short address if no name is present', () => {
    const tree = renderer.create(
      <InteractionStats
        stats={2}
        actionText='shared your details'
        counterParty={unnamedParty}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
