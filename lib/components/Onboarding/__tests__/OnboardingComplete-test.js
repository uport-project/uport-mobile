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
import React from 'react'
import FakeProvider from '../../testHelpers/FakeProvider'
import { Button } from 'uPortMobile/lib/components/shared/Button'
import ConnectedOnboardingComplete, { OnboardingComplete, mapDispatchToProps } from '../OnboardingComplete'
jest.mock('../../../start', () => {
  return {
    startMain: () => true
  }
})

import renderer from 'react-test-renderer'
import { toClj } from 'mori'

const empty = {
  status: toClj({}),
  networking: {}
}

const completed = {
  uport: toClj({
    currentIdentity: 'did:ethr:0x123123'
  }),
  networking: {}
}

describe('OnboardingComplete', () => {
  it('renders disabled button by default', () => {
    const tree = renderer.create(
      <FakeProvider state={empty}>
        <ConnectedOnboardingComplete />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders enabled button when complete', () => {
    const tree = renderer.create(
      <FakeProvider state={completed}>
        <ConnectedOnboardingComplete />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should call this.props.finishOnboarding when the button is clicked', () => {
    const finishOnboarding = jest.fn()
    const trackSegment = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingComplete
        userData={{}}
        navigator={new global.FakeNavigator()}
        trackSegment={trackSegment}
        segmentId={''}
        finishOnboarding={finishOnboarding}
      />
    )
    this.wrapper.find(Button).props().onPress()
    expect(finishOnboarding).toHaveBeenCalled()
  })

  it('should call dispatch when the finishOnboarding function is called', () => {
    const dispatchMock = jest.fn()
    const trackSegment = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingComplete
        userData={{}}
        navigator={new global.FakeNavigator()}
        trackSegment={trackSegment}
        segmentId={''}
        finishOnboarding={mapDispatchToProps(dispatchMock).finishOnboarding}
      />
    )
    this.wrapper.find(Button).props().onPress()
    expect(dispatchMock).toHaveBeenCalled()
  })
  it('should call dispatch when the addImageOnboarding function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).registerDeviceForNotifications()
    expect(dispatchMock).toHaveBeenCalled()
  })
})
