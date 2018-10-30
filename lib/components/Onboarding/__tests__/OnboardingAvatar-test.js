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
import { Platform, TouchableHighlight } from 'react-native'
import React from 'react'
import ConnectedOnboardingAvatar, { OnboardingAvatar, mapDispatchToProps } from '../OnboardingAvatar'
import FakeProvider from '../../testHelpers/FakeProvider'
import renderer from 'react-test-renderer'
import { TextInput } from 'uPortMobile/lib/components/shared'

const empty = {
  authorization: {cameraAuthorized: 'authorized'},
  onboarding: {userData: {}},
  networking: {}
}
describe('OnboardingAvatar', () => {
  const trackSegment = jest.fn()
  it('renders Onboarding Avatar screen', () => {
    const tree = renderer.create(
      <FakeProvider state={empty}>
        <OnboardingAvatar userData={{}} trackSegment={trackSegment} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders Onboarding Avatar screen with an avatar', () => {
    const trackSegment = jest.fn()
    const tree = renderer.create(
      <FakeProvider state={empty}>
        <OnboardingAvatar userData={{avatar: {uri: ''}}} trackSegment={trackSegment} />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders a connected component as expected', () => {
    const initialState = empty
    const wrapper = global.shallow(
      <ConnectedOnboardingAvatar
        userData={{}}
        navigator={new global.FakeNavigator()}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  it('passes and calls the correct functions to the onProcess function', () => {
    const addData = jest.fn()
    const storeClaims = jest.fn()
    const continuefn = jest.fn()
    const trackSegment = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        addData={addData}
        storeClaims={storeClaims}
        userData={{}}
        navigator={new global.FakeNavigator()}
        trackSegment={trackSegment}
      />
    )
    const instance = this.wrapper.instance()
    instance.continue = continuefn
    instance.onProcess()
    expect(addData).toHaveBeenCalled()
    expect(storeClaims).toHaveBeenCalled()
    expect(continuefn).toHaveBeenCalled()
  })

  it('calls onComplete correctly', () => {
    const continuefn = jest.fn()
    const trackSegment = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        userData={{}}
        navigator={new global.FakeNavigator()}
        trackSegment={trackSegment}
        segmentId={''}
      />
    )
    const instance = this.wrapper.instance()
    instance.continue = continuefn
    instance.onComplete()
    expect(continuefn).toHaveBeenCalled()
  })

  it('handleCancel correctly', () => {
    const addData = jest.fn()
    const trackSegment = jest.fn()
    const storeClaims = jest.fn()
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        addData={addData}
        storeClaims={storeClaims}
        userData={{}}
        trackSegment={trackSegment}
        navigator={navigator}
      />
    )
    this.wrapper.instance().handleCancel()
    expect(addData).toHaveBeenCalled()
  })

  it('handles the continue function on ios correctly', () => {
    const navigator = new global.FakeNavigator()
    const trackSegment = jest.fn()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        platform={'ios'}
        userData={{}}
        trackSegment={trackSegment}
        navigator={navigator}
      />
    )
    this.wrapper.instance().continue()
    expect(navigator.push).toHaveBeenCalled()
    expect(navigator.push).toBeCalledWith({
      screen: 'onboarding.notifications',
      navigatorStyle: {
        navBarHidden: true
      }
    })
  })

  it('handles the continue function on android correctly', () => {
    Platform.OS = 'android'
    const navigator = new global.FakeNavigator()
    const trackSegment = jest.fn()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        userData={{}}
        trackSegment={trackSegment}
        navigator={navigator}
      />
    )
    this.wrapper.instance().continue()
    expect(navigator.push).toHaveBeenCalled()
    expect(navigator.push).toBeCalledWith({
      screen: 'onboarding.testnetWarning',
      navigatorStyle: {
        navBarHidden: true
      }
    })
  })
  it('handles photoSelection correctly', () => {
    const mocked = jest.mock('uPortMobile/lib/utilities/photoSelection', () => {
      return jest.fn()
    })
    const photoSelectionHandler = jest.fn()
    const trackSegment = jest.fn()
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        userData={{}}
        trackSegment={trackSegment}
        navigator={navigator}
      />
    )
    this.wrapper.instance().photoSelection()
    // expect(photoSelectionHandler).toHaveBeenCalled()
    // expect(mocked).toHaveBeenCalled()
  })

  it('calls photoSelection from the TouchableHighlight onPress', () => {
    const photoSelection = jest.fn()
    const trackSegment = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        userData={{}}
        navigator={new global.FakeNavigator()}
        trackSegment={trackSegment}
        segmentId={''}
      />
    )
    this.wrapper.instance().photoSelection = photoSelection
    this.wrapper.find(TouchableHighlight).props().onPress()
    expect(photoSelection).toHaveBeenCalled()
  })
  // onProcess () {
  //   if (this.props.segmentId) analytics.track({userId: this.props.segmentId, event: '[MOBILE] Onboarding Avatar Submit'})
  //   this.props.addData(this.props.userData)
  //   this.props.storeClaims(this.props.address, this.props.userData)
  //   this.continue()
  // }

  it('should call dispatch when the addData function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).addData({})
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('should call dispatch when the storeClaims function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).storeClaims({})
    expect(dispatchMock).toHaveBeenCalled()
  })
  it('should call dispatch when the addImageOnboarding function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).addImageOnboarding({})
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('calls this.handleChange on change in the text input', () => {
    const handleChange = jest.fn()
    const trackSegment = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        userData={{}}
        navigator={new global.FakeNavigator()}
        trackSegment={trackSegment}
        segmentId={''}
      />
    )
    const instance = this.wrapper.instance()
    instance.handleChange = handleChange
    this.wrapper.find(TextInput).props().onChangeText()
    expect(handleChange).toHaveBeenCalled()
  })

  it('calls this.setState from handleChange', () => {
    const setState = jest.fn()
    const trackSegment = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        userData={{}}
        navigator={new global.FakeNavigator()}
        trackSegment={trackSegment}
        segmentId={''}
      />
    )
    const instance = this.wrapper.instance()
    instance.setState = setState
    this.wrapper.find(TextInput).props().onChangeText()
    expect(setState).toHaveBeenCalled()
  })

  it('calls addData, storeClaims, and continue from onProcess', () => {
    const navigator = new global.FakeNavigator()
    navigator.push = jest.fn()
    const addData = jest.fn()
    const storeClaims = jest.fn()
    const continuefn = jest.fn()
    const trackSegment = jest.fn()
    this.wrapper = global.shallow(
      <OnboardingAvatar
        userData={{}}
        navigator={navigator}
        trackSegment={trackSegment}
        segmentId={''}
        addData={addData}
        storeClaims={storeClaims}
      />
    )
    const instance = this.wrapper.instance()
    instance.continue = continuefn
    instance.onProcess()
    expect(addData).toHaveBeenCalled()
    expect(storeClaims).toHaveBeenCalled()
    expect(continuefn).toHaveBeenCalled()
  })

  // it('should call dispatch when the hideRequest function is called', () => {
  //   const dispatchMock = jest.fn()
  //   mapDispatchToProps(dispatchMock).hideRequest({id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'})
  //   expect(dispatchMock).toHaveBeenCalled()
  // })
})
