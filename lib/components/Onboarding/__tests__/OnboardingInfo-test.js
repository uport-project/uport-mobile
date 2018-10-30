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
import { ScrollView, TouchableHighlight } from 'react-native'
import React from 'react'
import ConnectedOnboardingInfo, { OnboardingInfo } from '../OnboardingInfo'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'

describe('OnboardingInfo', () => {
  it('renders Onboarding Info screen', () => {
    const tree = renderer.create(
      <ConnectedOnboardingInfo navigator={new FakeNavigator()} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should call navigator.push when the TouchableHighlight is clicked', () => {
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingInfo
        navigator={navigator}
      />
    )
    this.wrapper.find(TouchableHighlight).props().onPress()
    expect(navigator.push).toHaveBeenCalled()
  })

  it('handles Scrolling correctly', () => {
    const navigator = new global.FakeNavigator()
    this.wrapper = global.shallow(
      <OnboardingInfo
        navigator={navigator}
      />
    )
    this.wrapper.find(ScrollView).simulate('scroll', ({nativeEvent: { contentOffset: { x: 380 } }}))
    expect(this.wrapper.instance().state.panel).toEqual(1)
    // this.wrapper.find(ScrollView).simulate('scroll', ({nativeEvent: { contentOffset: { x: 380 } }}))
  })
})
