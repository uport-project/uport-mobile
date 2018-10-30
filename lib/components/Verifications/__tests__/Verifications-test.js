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
import ConnectedVerifications, { Verifications } from '../Verifications'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import FakeProvider from '../../testHelpers/FakeProvider'
jest.mock('uPortMobile/lib/components/Verifications/ExpirationItem', () => 'ExpirationItem')
import renderer from 'react-test-renderer'
import uportReducer from 'uPortMobile/lib/reducers/uportReducer'
import { storeIdentity } from 'uPortMobile/lib/actions/uportActions'

const issuer = {
  name: 'Issuer Name'
}

const pendingAttestations = [{
  sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  claim: { employer: 'Consensys AG' },
  iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
  iat: 1482268217249,
  exp: 1482354617249,
  token: 'tokenstring',
  issuer
}]

const attestations = [
  {
    sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
    claim: { employer: 'Consensys AG' },
    iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
    iat: 1482268217248,
    exp: 1482354617248,
    token: 'tokenstring',
    issuer
  },
  {
    sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
    claim: { Name: 'test' },
    iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
    iat: 1482268217247,
    exp: 1482354617247,
    token: 'tokenstring'
  }
]

const emptyState = {
  uport: toClj({}),
  status: toClj({}),
  networking: {}
}

const simpleIdentity = {
  address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
  own: {
    name: 'Alice',
    phone: '555-555-5555',
    description: 'UX Designer',
    connections: {
      knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01']
    }
  },
  attestations: {
    '0011': {
      iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      exp: 1,
      claim: {
        name: 'Alice'
      },
      token: '0011.TOKEN'
    },
    '0015': {
      iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      exp: 2,
      claim: {
        name: 'Alice'
      },
      token: '0015.TOKEN'
    },
    '0012': {
      iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
      claim: {
        name: 'Alice'
      },
      token: '0011.TOKEN'
    },
    '0013': {
      iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      claim: {
        phone: '555-555-5555'
      },
      token: '0013.TOKEN'
    },
    '0014': {
      iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      claim: {
        nationalId: 'xxx0xxxx0xxx'
      },
      token: '0014.TOKEN'
    }
  },
  pendingAttestations: {
    '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01': {
      nationalId: {applicant_id: 1234},
      name: {}
    },
    '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02': {
      nationalId: {}
    }

  }
}
const withIssuers = toClj({
  external: {
    '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01': {
      name: 'Issuer 1'
    },
    '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02': {
      name: 'Issuer 2'
    }
  }
})

const uport = uportReducer(withIssuers, storeIdentity(simpleIdentity))
const withVerifications = {...emptyState, uport}
// 47,73,105
describe('rendering', () => {
  it('both pending and issued verifications', () => {
    const tree = renderer.create(
      <FakeProvider state={emptyState}>
        <Verifications
          attestations={attestations}
          navigator={new FakeNavigator()}
        />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('only issued verifications', () => {
    const tree = renderer.create(
      <FakeProvider state={emptyState}>
        <Verifications
          attestations={attestations}
          navigator={new FakeNavigator()}
        />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('only pending verifications', () => {
    const tree = renderer.create(
      <FakeProvider state={emptyState}>
        <Verifications
          attestations={pendingAttestations}
          navigator={new FakeNavigator()}
        />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('empty', () => {
    const tree = renderer.create(
      <FakeProvider state={emptyState}>
        <Verifications
          attestations={[]}
          navigator={new FakeNavigator()}
        />
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  describe('connected', () => {
    it('empty', () => {
      const tree = renderer.create(
        <FakeProvider state={emptyState}>
          <ConnectedVerifications
            navigator={new FakeNavigator()}
          />
        </FakeProvider>
      ).toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('with verifications', () => {
      const tree = renderer.create(
        <FakeProvider state={withVerifications}>
          <ConnectedVerifications
            navigator={new FakeNavigator()}
          />
        </FakeProvider>
      ).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
