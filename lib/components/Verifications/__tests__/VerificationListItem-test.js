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
import { TouchableHighlight } from 'react-native'
import React from 'react'
import { toClj } from 'mori'
import VerificationListItem, {extractClaims, extractClaimType} from '../VerificationListItem'
import FakeProvider from '../../testHelpers/FakeProvider'
import renderer from 'react-test-renderer'
jest.mock('uPortMobile/lib/components/Verifications/ExpirationItem', () => 'ExpirationItem')
const issuer = {
  name: 'issuerName'
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
  iat: 1482268217248,
  exp: null,
  token: 'tokenstring',
  issuer
}

const pending = {
  sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  claimType: 'employer',
  iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  issuer
}

const complexVerification = {
  sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  claim: {
    identityVerification: {
      name: 'Bob Van Duck',
      postalCode: 'BH15 12Q'
    }
  },
  iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  iat: 1482268217248,
  exp: 1482354617248,
  token: 'tokenstring'
}

function handleClaimClick () {}

describe('render VerificationListItem', () => {
  it('with expiration', () => {
    const tree = renderer.create(
      <VerificationListItem
        verification={verification}
        selectVerification={handleClaimClick}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('without expiration', () => {
    const tree = renderer.create(
      <VerificationListItem
        verification={verificationNoExpiration}
        selectVerification={handleClaimClick}
      />
     ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('pending]', () => {
    const tree = renderer.create(
      <VerificationListItem
        verification={pending}
        selectVerification={handleClaimClick}
      />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('returns the verification claimType from the verification', () => {
    expect(extractClaimType(pending)).toEqual('employer')
  })

  it('extractClaims from the verification', () => {
    expect(extractClaims(complexVerification)).toEqual('Bob Van Duck, BH15 12Q')
  })

  it('calls navigator.push from TouchableHighlight onPress', () => {
    const selectVerification = jest.fn()
    this.wrapper = global.shallow(
      <VerificationListItem
        verification={complexVerification}
        selectVerification={selectVerification}
      />
    )
    this.wrapper.find(TouchableHighlight).first().props().onPress()
    expect(selectVerification).toHaveBeenCalled()
  })

  // it('calls navigator.showLightBox when the edit button is pressed', () => {
  //   const navigator = new global.FakeNavigator()
  //   navigator.showLightBox = jest.fn()
  //   const request = {
  //     postback: false,
  //     id: 14819973609293640,
  //     callback_url: 'https://testapp.uport.me',
  //     type: 'attestation',
  //     to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
  //   }
  //   this.wrapper = global.shallow(
  //     <VerificationCard
  //       request={request}
  //       showActions
  //       verification={complexVerification}
  //       title='identityVerification'
  //       issuer={issuer}
  //       claims={[
  //         {
  //           key: 'name',
  //           value: 'Bob Van Duck'
  //         }, {
  //           key: 'postalCode',
  //           value: 'BH15 12Q'
  //         }]}
  //       navigator={navigator} />)
  //   const instance = this.wrapper.instance()
  //   instance.onNavigatorEvent({id: 'edit', type: 'NavBarButtonPress'})
  //   expect(navigator.showLightBox).toHaveBeenCalled()
  // })
})
