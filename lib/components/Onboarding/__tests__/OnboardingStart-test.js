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
import ConnectedOnboardingStart, { OnboardingStart, mapDispatchToProps } from '../OnboardingStart'
import { OnboardingButton } from '../../shared/Button'
import { Base as ProcessCard } from '../../shared/ProcessCard'
import renderer from 'react-test-renderer'

const empty = {
  authorization: {cameraAuthorized: 'authorized'},
  onboarding: {userData: {}},
  networking: {}
}

describe('OnboardingStart', () => {
  it('renders Onboarding Start screen', () => {
    const trackSegment = jest.fn()
    const tree = renderer.create(
      <OnboardingStart navigator={new global.FakeNavigator()} trackSegment={trackSegment}/>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders a connected component as expected', () => {
    const initialState = empty
    const trackSegment = jest.fn()
    const wrapper = global.shallow(
      <ConnectedOnboardingStart
        navigator={new global.FakeNavigator()}
        trackSegment={trackSegment}
        segmentId=''
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('calls handleCreatePress from the OnboardingButton press', () => {
    const trackSegment = jest.fn()
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingStart
        navigator={navigator}
        trackSegment={trackSegment}
      />)
    this.wrapper.find(ProcessCard).props().onContinue()
    expect(navigator.push).toHaveBeenCalled()
  })

  it('should call dispatch when the switchIdentity function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).switchIdentity({})
    expect(dispatchMock).toHaveBeenCalled()
  })
})
