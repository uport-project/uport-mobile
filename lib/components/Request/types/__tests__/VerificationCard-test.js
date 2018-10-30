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
import { Button, Linking, TouchableOpacity } from 'react-native'
import React from 'react'
import ConnectedCard, { mapDispatchToProps } from '../VerificationCard'
import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'
import FakeNavigator from '../../../testHelpers/FakeNavigator'
import { attestationsForTypeAndValue } from 'uPortMobile/lib/selectors/attestations'
import renderer from 'react-test-renderer'

jest.mock('uPortMobile/lib/selectors/attestations', () => {
  return {
    attestationsForTypeAndValue: jest.fn()
  }
})
const request = {
  postback: false,
  id: 14819973609293640,
  callback_url: 'https://testapp.uport.me',
  type: 'network',
  to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
}

const clear = () => null
const cancel = () => {}
const authorize = () => {}
describe('VerificationCard', () => {
  it('renders a connected VerificationCard as expected', () => {
    const initialState = {}
    const wrapper = global.shallow(
      <ConnectedCard
        navigator={new FakeNavigator()}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })

  // it('calls attestationsForTypeAndValue correctly', () => {
  //   const initialState = {}
  //   let attestationsForTypeAndValue = jest.fn()
  //   const wrapper = global.shallow(
  //     <ConnectedCard
  //       navigator={new FakeNavigator()}
  //     />,
  //     { context: { store: global.mockStore(initialState) } },
  //   )
  //   let aTV = wrapper.props().attestationsForTypeAndValue
  //   aTV = attestationsForTypeAndValue
  //   aTV({type: 'employer', value: 'Consensys AG'})
  //   expect(attestationsForTypeAndValue).toHaveBeenCalled()
  // })

  it('should call dispatch when the authorizeRequest function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).authorizeRequest({})
    expect(dispatchMock).toHaveBeenCalled()
  })
  it('should call dispatch when the cancelRequest function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).cancelRequest({})
    expect(dispatchMock).toHaveBeenCalled()
  })
})
