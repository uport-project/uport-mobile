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
import { OnboardingTerms } from '../OnboardingTerms'
import { OnboardingButton } from '../../shared/Button'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

describe('OnboardingTerms', () => {
  it('renders Onboarding Terms screen', () => {
    const tree = renderer.create(
      <OnboardingTerms navigator={new FakeNavigator()} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  describe('onboarding button press', () => {
    it('calls navigator.push and createIdentity', () => {
      const createIdentity = jest.fn()
      const navigator = new global.FakeNavigator()
      navigator.push = jest.fn()
      this.wrapper = global.shallow(
        <OnboardingTerms
          navigator={navigator}
          createIdentity={createIdentity}
        />)
      this.wrapper.find(OnboardingButton).props().onPress()
      expect(navigator.push).toHaveBeenCalled()
      expect(createIdentity).toHaveBeenCalled()
    })

    it('calls navigator.push but not createIdentity if we are recovering', () => {
      const createIdentity = jest.fn()
      const navigator = new global.FakeNavigator()
      navigator.push = jest.fn()
      this.wrapper = global.shallow(
        <OnboardingTerms
          navigator={navigator}
          address={'0x1234'}
          createIdentity={createIdentity}
        />)
      this.wrapper.find(OnboardingButton).props().onPress()
      expect(navigator.push).toHaveBeenCalled()
      expect(createIdentity).toHaveBeenCalledTimes(0)
    })

  })
})
