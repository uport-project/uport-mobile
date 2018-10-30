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
import FakeNavigator from '../../testHelpers/FakeNavigator'
import ConnectedCountrySelectorModal, { CountrySelectorModal, mapDispatchToProps } from '../CountrySelectorModal'
import CountrySelector from 'uPortMobile/lib/components/shared/CountrySelector'

import renderer from 'react-test-renderer'

describe('Country Selector Modal', () => {
  it('renders without country selected', () => {
    const tree = renderer.create(
      <CountrySelectorModal
        onSelect={() => true}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders with country selected', () => {
    const tree = renderer.create(
      <CountrySelectorModal
        selectedCountry='AL'
        onSelect={() => true}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders a connected component as expected', () => {
    const initialState = {
      onboarding: {
        userData: {
          country: 'US'
        }
      }
    }
    const wrapper = global.shallow(
      <ConnectedCountrySelectorModal
        onSelect={() => true}
        navigator={new FakeNavigator()}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('passes the correct functions to the Country Selector', () => {
    const navigator = new FakeNavigator()
    navigator.dismissModal = jest.fn()
    const onSelect = jest.fn()
    const wrapper = global.shallow(
      <CountrySelectorModal
        selectedCountry='AL'
        navigator={navigator}
        onSelect={onSelect}
      />
    )
    wrapper.find(CountrySelector).props().onSelect()
    expect(onSelect).toHaveBeenCalled()
    expect(navigator.dismissModal).toHaveBeenCalled()
  })

  it('should call dispatch when the onSelect function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).onSelect()
    expect(dispatchMock).toHaveBeenCalled()
  })
})
