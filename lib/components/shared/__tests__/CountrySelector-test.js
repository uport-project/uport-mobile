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
import CountrySelector, { Country } from '../CountrySelector'

import renderer from 'react-test-renderer'

describe('CountrySelector', () => {
  it('renders without country selected', () => {
    const tree = renderer.create(
      <CountrySelector
        onSelect={() => true}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders with country selected', () => {
    const tree = renderer.create(
      <CountrySelector
        selectedCountry='AL'
        onSelect={() => true}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  describe('Country', () => {
    it('calls onSelect from TouchableHighlight onPress', () => {
      const onSelect = jest.fn()
      this.wrapper = global.shallow(
        <Country
          onSelect={onSelect}
        />
      )
      this.wrapper.find(TouchableHighlight).props().onPress()
      expect(onSelect).toHaveBeenCalled()
    })
  })
})
