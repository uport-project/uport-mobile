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
import { toClj } from 'mori'
import VerificationList from '../VerificationList'
import FakeProvider from '../../testHelpers/FakeProvider'
import renderer from 'react-test-renderer'
jest.mock('uPortMobile/lib/components/Verifications/ExpirationItem', () => 'ExpirationItem')
const issuer = {
  name: 'testName'
}

const emptyState = {
  uport: toClj({}),
  status: toClj({}),
  networking: {}
}

const verification = {
  sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  claim: { employer: 'Consensys AG' },
  iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  iat: 1482268217248,
  exp: 1482354617248,
  token: 'tokenstring',
  issuer
}

const verificationNoExpiration = {
  sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  claim: { employer: 'Consensys AG' },
  iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  iat: 1482268217249,
  exp: null,
  token: 'tokenstring',
  issuer
}

function handleClaimClick () {}

describe('rendering', () => {
  it('empty', () => {
    const tree = renderer.create(
      <VerificationList
        verifications={[]}
        selectVerification={handleClaimClick}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('with data', () => {
    const tree = renderer.create(
      <FakeProvider state={emptyState}>
        <VerificationList
          verifications={[verification, verificationNoExpiration]}
          selectVerification={handleClaimClick}
        />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

})

