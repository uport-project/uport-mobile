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
import ConnectedMyInfo, { MyInformation, mapDispatchToProps } from '../MyInformation'
import Icon from 'react-native-vector-icons/Ionicons'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'
jest.mock('uPortMobile/lib/utilities/photoSelection', () => {
  return () => true
})
describe('MyInformation Component', () => {
  it('renders info correctly', () => {
    const tree = renderer.create(
      <MyInformation navigator={new FakeNavigator()}
        avatar={{uri: 'https://ipfs.infura.io/ipfs/QmaJBgr3xHfY94MTzCUY23UWSpRBdTnBJaN3WrERJkgdGb'}}
        name='Greg'
        shareToken='JWT'
        userData={{
          email: 'test@test.com',
          country: 'US',
          phone: '+15555551234'
        }}
        updateShareToken={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('renders a connected Accounts index as expected', () => {
    const initialState = {
      myInfo: {
        changed: {
          avatar: {uri: 'https://ipfs.infura.io/ipfs/QmaJBgr3xHfY94MTzCUY23UWSpRBdTnBJaN3WrERJkgdGb'},
          name: 'Greg',
          email: 'test@test.com',
          country: 'US',
          phone: '+15555551234'
        },
        shareToken: 'JWT'
      }
    }
    const wrapper = global.shallow(
      <ConnectedMyInfo
        navigator={new FakeNavigator()}
        updateShareToken={() => true}
      />,
      { context: { store: global.mockStore(initialState) } }
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })
  it('calls Icon.getImageSource on mount', () => {
    const navigator = new FakeNavigator()
    Icon.getImageSource = jest.fn(() => Promise.resolve(true))
    this.wrapper = global.shallow(
      <MyInformation
        navigator={navigator}
        updateShareToken={() => true}
      />
    )
    const instance = this.wrapper.instance()
    instance.componentDidMount()
    expect(Icon.getImageSource).toHaveBeenCalled()
  })

  it('calls updateShareToken on mount', () => {
    const navigator = new FakeNavigator()
    const updateShareToken = jest.fn()
    const address = '0x1234'
    this.wrapper = global.shallow(
      <MyInformation
        navigator={navigator}
        address={address}
        updateShareToken={updateShareToken}
      />
    )
    const instance = this.wrapper.instance()
    instance.componentDidMount()
    expect(updateShareToken).toHaveBeenCalledWith(address)
  })

  it('calls Icon.getImageSource on update with editing set to false', () => {
    const navigator = new FakeNavigator()
    Icon.getImageSource = jest.fn(() => Promise.resolve(true))
    this.wrapper = global.shallow(
      <MyInformation
        navigator={navigator}
        updateShareToken={() => true}
      />
    )
    const instance = this.wrapper.instance()
    instance.componentWillUpdate(null, {editing: false})
    expect(Icon.getImageSource).toHaveBeenCalled()
  })

  it('calls navigator.setButtons on update when editing is true', () => {
    const navigator = new FakeNavigator()
    navigator.setButtons = jest.fn()
    this.wrapper = global.shallow(
      <MyInformation
        navigator={navigator}
        updateShareToken={() => true}
      />
    )
    const instance = this.wrapper.instance()
    instance.componentWillUpdate(null, {editing: true})
    expect(navigator.setButtons).toHaveBeenCalled()
  })

  it('sets state to editing when the edit button is pressed', () => {
    const navigator = new FakeNavigator()
    const setState = jest.fn()
    this.accountInfo = global.shallow(
      <MyInformation
        navigator={navigator}
        updateShareToken={() => true}
      />
    )
    const instance = this.accountInfo.instance()
    instance.setState = setState
    instance.onNavigatorEvent({type: 'NavBarButtonPress', id: 'edit'})
    expect(setState).toHaveBeenCalled()
  })

  it('calls navigator.pop when the back button is pressed', () => {
    const navigator = new FakeNavigator()
    navigator.pop = jest.fn()
    this.accountInfo = global.shallow(
      <MyInformation
        navigator={navigator}
        updateShareToken={() => true}
      />
    )
    const instance = this.accountInfo.instance()
    instance.onNavigatorEvent({type: 'NavBarButtonPress', id: 'back'})
    expect(navigator.pop).toHaveBeenCalled()
  })
  it('calls handleSubmit when the save button is pressed', () => {
    const navigator = new FakeNavigator()
    const handleSubmit = jest.fn()
    this.accountInfo = global.shallow(
      <MyInformation
        navigator={navigator}
        updateShareToken={() => true}
      />
    )
    const instance = this.accountInfo.instance()
    instance.handleSubmit = handleSubmit
    instance.onNavigatorEvent({type: 'NavBarButtonPress', id: 'save'})
    expect(handleSubmit).toHaveBeenCalled()
  })

  describe('handleCancel', () => {
    it('calls handleCancel when the cancel button is pressed', () => {
      const navigator = new FakeNavigator()
      const handleCancel = jest.fn()
      this.accountInfo = global.shallow(
        <MyInformation
          navigator={navigator}
          updateShareToken={() => true}
        />
      )
      const instance = this.accountInfo.instance()
      instance.handleCancel = handleCancel
      instance.onNavigatorEvent({type: 'NavBarButtonPress', id: 'cancel'})
      expect(handleCancel).toHaveBeenCalled()
    })

    it('resets changed data', () => {
      const navigator = new global.FakeNavigator()
      const editMyInfo = jest.fn()
      const setState = jest.fn()
      this.wrapper = global.shallow(
        <MyInformation
          editMyInfo={editMyInfo}
          navigator={navigator}
          userData={{name: 'Bill'}}
          name='Bob'
          address={'ddd'}
          updateShareToken={() => true}
        />
      )
      const instance = this.wrapper.instance()
      instance.setState = setState
      instance.handleCancel()
      expect(editMyInfo).toHaveBeenCalledWith({
        name: 'Bill',
        email: undefined,
        country: undefined,
        phone: undefined,
        avatar: undefined
      })
      expect(setState).toHaveBeenCalledWith({editing: false})
    })
  })

  it('calls handleChange which calls storeOwnClaims and setState', () => {
    const navigator = new global.FakeNavigator()
    const editMyInfo = jest.fn()
    this.wrapper = global.shallow(
      <MyInformation
        editMyInfo={editMyInfo}
        navigator={navigator}
        updateShareToken={() => true}
      />
    )
    const instance = this.wrapper.instance()
    instance.handleChange()
    expect(editMyInfo).toHaveBeenCalled()
  })

  describe('handleSubmit()', () => {
    it('should not save claims if no change', () => {
      const navigator = new global.FakeNavigator()
      const storeOwnClaim = jest.fn()
      const setState = jest.fn()
      this.wrapper = global.shallow(
        <MyInformation
          storeOwnClaim={storeOwnClaim}
          navigator={navigator}
          userData={{name: 'Bill', country: 'UK', phone: '+1123222222'}}
          name='Bill'
          country='UK'
          phone='+1123222222'
          updateShareToken={() => true}
        />
      )
      const instance = this.wrapper.instance()
      instance.setState = setState
      instance.handleSubmit()
      expect(storeOwnClaim).toHaveBeenCalledTimes(0)
      expect(setState).toHaveBeenCalledWith({editing: false})
    })

    it('should save changed', () => {
      const navigator = new global.FakeNavigator()
      const storeOwnClaim = jest.fn()
      const setState = jest.fn()
      this.wrapper = global.shallow(
        <MyInformation
          storeOwnClaim={storeOwnClaim}
          navigator={navigator}
          address='0x1234'
          userData={{name: 'Bill', country: 'UK', phone: '+1123222222'}}
          name='Bill Jones'
          country='US'
          phone='+1123222222'
          updateShareToken={() => true}
        />
      )
      const instance = this.wrapper.instance()
      instance.setState = setState
      instance.handleSubmit()
      expect(storeOwnClaim).toHaveBeenCalledWith('0x1234', {country: 'US', name: 'Bill Jones'})
      expect(setState).toHaveBeenCalledWith({editing: false})
    })

    it('calls props.addImage from handleSubmit if raw image has been set', () => {
      const navigator = new FakeNavigator()
      const addImage = jest.fn()
      this.accountInfo = global.shallow(
        <MyInformation
          navigator={navigator}
          avatar={{data: true, uri: '/ipfs/sss'}}
          userData={{}}
          addImage={addImage}
          storeOwnClaim={() => true}
          updateShareToken={() => true}
        />
      )
      const instance = this.accountInfo.instance()
      instance.handleSubmit()
      expect(addImage).toHaveBeenCalled()
    })

    it('does not call props.addImage if only uri is set', () => {
      const navigator = new FakeNavigator()
      const addImage = jest.fn()
      this.accountInfo = global.shallow(
        <MyInformation
          navigator={navigator}
          avatar={{uri: '/ipfs/fff'}}
          userData={{}}
          addImage={addImage}
          storeOwnClaim={() => true}
          updateShareToken={() => true}
        />
      )
      const instance = this.accountInfo.instance()
      instance.handleSubmit()
      expect(addImage).toHaveBeenCalledTimes(0)
    })
  })

  it('calls photoSelectionHandler from photoSelection', () => {
    const navigator = new global.FakeNavigator()
    // const storeOwnClaim = jest.fn()
    // const setState = jest.fn()
    this.wrapper = global.shallow(
      <MyInformation
        navigator={navigator}
        updateShareToken={() => true}
      />
    )
    const instance = this.wrapper.instance()
    instance.photoSelection()
    // expect(photoSelectionHandler).toHaveBeenCalled()
  })

  it('should call dispatch when the storeOwnClaim function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).storeOwnClaim({})
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('should call dispatch when the editMyInfo function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).editMyInfo({})
    expect(dispatchMock).toHaveBeenCalled()
  })
  it('should call dispatch when the addImage function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).addImage({})
    expect(dispatchMock).toHaveBeenCalled()
  })
})
