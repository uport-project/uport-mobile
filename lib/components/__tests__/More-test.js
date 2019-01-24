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
import ConnectedMore, { More } from '../More'
import FakeNavigator from '../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

describe('More', () => {
  it('renders more screen with 0 contacts', () => {
    const tree = renderer.create(
      <More navigator={new FakeNavigator()} connections={[]} pendingMigrations={[]} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders more screen with 2 contacts', () => {
    const tree = renderer.create(
      <More navigator={new FakeNavigator()} connections={[{}, {}, {}]} pendingMigrations={[]} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  describe('account backup', () => {
    describe('without hd wallet', () => {
      it('renders without backup option', () => {
        const tree = renderer.create(
          <More navigator={new FakeNavigator()} connections={[]} pendingMigrations={[]} />
        ).toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
    describe('with hd wallet', () => {
      describe('with no completed backup', () => {
        it('renders with backup option and warning', () => {
          const tree = renderer.create(
            <More navigator={new FakeNavigator()} hasHDWallet connections={[]} pendingMigrations={[]} />
          ).toJSON()
          expect(tree).toMatchSnapshot()
        })
      })
      describe('with completed backup', () => {
        it('renders backup option without warning', () => {
          const tree = renderer.create(
            <More navigator={new FakeNavigator()} hasHDWallet seedConfirmed connections={[]} pendingMigrations={[]} />
          ).toJSON()
          expect(tree).toMatchSnapshot()
        })
      })
    })
  })

  describe('migrations', () => {
    it('renders migration steps', () => {
      const tree = renderer.create(
        <More navigator={new FakeNavigator()} hasHDWallet connections={[]} pendingMigrations={['PreHD']} />
      ).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  it('renders a connected component as expected', () => {
    // const initialState = empty
    const wrapper = global.shallow(
      <ConnectedMore
        navigator={new global.FakeNavigator()}
      />,
      { context: { store: global.mockStore({migrations: { targets: [] }})}}
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })
})
