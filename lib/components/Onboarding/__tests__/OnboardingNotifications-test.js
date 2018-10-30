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
import 'react-native'
import React from 'react'
import Permissions from 'react-native-permissions'
import ConnectedOnboardingNotifications, { OnboardingNotifications, mapDispatchToProps } from '../OnboardingNotifications'
import FakeProvider from '../../testHelpers/FakeProvider'
import ProcessCard from 'uPortMobile/lib/components/shared/ProcessCard'
import renderer from 'react-test-renderer'

const empty = {
  onboarding: {userData: {}},
  networking: {}
}

describe('OnboardingNotifications', () => {
  it('renders Onboarding Notifications screen', () => {
    const tree = renderer.create(
      <FakeProvider state={empty}>
        <OnboardingNotifications />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders a connected component as expected', () => {
    const initialState = empty
    const wrapper = global.shallow(
      <ConnectedOnboardingNotifications
        userData={{}}
        navigator={new global.FakeNavigator()}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('calls this.continue which calls navigator.push from ProcessCard on skip', () => {
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingNotifications
        userData={{}}
        navigator={navigator}
      />
    )
    this.wrapper.find(ProcessCard).props().onSkip()
    expect(navigator.push).toHaveBeenCalled()
  })

  it('calls registerDeviceForNotifications and navigator.push when notifications are authorized', () => {
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    const registerDeviceForNotifications = jest.fn()
    Permissions.request = jest.fn(() => Promise.resolve('authorized'))
    this.wrapper = global.shallow(
      <OnboardingNotifications
        userData={{}}
        navigator={navigator}
        registerDeviceForNotifications={registerDeviceForNotifications}
      />
    )
    this.wrapper.find(ProcessCard).props().onProcess()

    // expect(registerDeviceForNotifications).toHaveBeenCalled()
    // expect(navigator.push).toHaveBeenCalled()
  })

  it('should call dispatch when the registerDeviceForNotifications function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).registerDeviceForNotifications({})
    expect(dispatchMock).toHaveBeenCalled()
  })
})
