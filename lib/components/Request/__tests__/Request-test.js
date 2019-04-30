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
import React from 'react'
import ConnectedRequest, { Request, mapDispatchToProps } from '../index'
import ConnectionCard from '../types/ConnectionCard'
import VerificationCard from '../types/VerificationCard'
import FakeProvider from '../../testHelpers/FakeProvider'
import renderer from 'react-test-renderer'
jest.useFakeTimers()
const emptyState = {
  networking: {
    online: true,
  },
}

describe('Request Component', () => {
  it('renders a request without a type', () => {
    const tree = renderer
      .create(
        <FakeProvider state={emptyState}>
          <ConnectedRequest />
        </FakeProvider>,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
  // it('calls cancelRequest when the cancelRequest button is pressed.', () => {
  //   const cancelRequest = jest.fn()
  //   this.wrapper = global.shallow(<Request cancelRequest={cancelRequest} />)
  //   expect(cancelRequest).toHaveBeenCalled()
  // })

  it('returns a ConnectionCard when the request type is connect', () => {
    const tree = renderer
      .create(
        <FakeProvider state={emptyState}>
          <ConnectedRequest componentId={'TestID'} requestType={'connect'} />
        </FakeProvider>,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
    this.wrapper = global.shallow(<Request componentId={'TestID'} requestType={'connect'} />)
    const card = this.wrapper.instance().pickCard()
    expect(tree).toMatchSnapshot()
    expect(card).toEqual(<ConnectionCard componentId={'TestID'} />)
  })

  it('returns a AttestationCard when the request type is attestation', () => {
    const tree = renderer
      .create(
        <FakeProvider state={emptyState}>
          <ConnectedRequest componentId={'TestID'} requestType={'attestation'} />
        </FakeProvider>,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
    this.wrapper = global.shallow(<Request componentId={'TestID'} requestType={'attestation'} />)
    const card = this.wrapper.instance().pickCard()
    expect(tree).toMatchSnapshot()
    expect(card).toEqual(<VerificationCard componentId={'TestID'} />)
  })

  it('should call dispatch when the authorizeRequest function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).authorizeRequest({})
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('should call dispatch when the clearRequest function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).clearRequest({})
    expect(dispatchMock).toHaveBeenCalled()
  })
})
