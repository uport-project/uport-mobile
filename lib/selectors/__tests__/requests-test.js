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
import uportReducer from 'uPortMobile/lib/reducers/uportReducer'
import { storeIdentity } from 'uPortMobile/lib/actions/uportActions'

import { currentRequestId, currentRequest, hasRequest, currentRequestType, currentRequestAuthorized,
          destinationProfile, clientProfile, activities, fetchRequest } from 'uPortMobile/lib/selectors/requests'
import { toJs, toClj, assocIn } from 'mori'
import { massage } from 'uPortMobile/lib/sagas/stateSaver'
import MockDate from 'mockdate'
const NOW = 1485321133
MockDate.set(NOW * 1000)

const uport = massage(toClj({
  byAddress: {
    '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a': {
      address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
      activities: {
        '10': {
          id: '10',
          type: 'sign',
          client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
          to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
        },
        '11': {
          id: '11',
          type: 'connect',
          authorizedAt: new Date(),
          to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
        },
        '12': {
          id: '12',
          type: 'disclosure',
          client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc03'
        },
        '13': {
          id: '13',
          type: 'attestation',
          iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'
        }

      },
      stats: {
        '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02': {
          request: 3,
          sign: 1
        }
      }
    }
  },
  currentIdentity: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
  external: {
    '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01': {
      address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      name: 'Coinbase'
    },
    '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02': {
      address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
      name: 'Gnosis'
    }
  }
}))

const selectedIdentity = '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'

const otherIdentity = {
  network: 'kovan',
  address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
  own: {
    name: 'Alice Kovan',
    phone: '555-555-5555',
  },
  activities: {
    '14': {
      id: '14',
      type: 'sign',
      authorizedAt: 14834004807621990,
      client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
    },
    '15': {
      id: '15',
      type: 'connect',
      authorizedAt: 14834004807621990,
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc04',
    }
  }
}

const multi = uportReducer(uport, storeIdentity(otherIdentity))

it('returns currentRequestId', () => {
  expect(currentRequestId({})).toBeNull()
  expect(currentRequestId({request: 10})).toBe(10)
})

it('returns hasRequest', () => {
  expect(hasRequest({})).toBeFalsy()
  expect(hasRequest({request: 10})).toBeTruthy()
})

it('returns currentRequest', () => {
  expect(currentRequest({})).toBeNull()
  expect(currentRequest({request: 10, uport})).toMatchSnapshot()
  expect(currentRequest({request: 10, uport: multi})).toMatchSnapshot()
  expect(currentRequest({request: 14, uport: multi})).toMatchSnapshot()
})

it('returns specific request', () => {
  expect(fetchRequest({})).toBeNull()
  expect(fetchRequest({request: 10, uport}, 10)).toMatchSnapshot()
  expect(fetchRequest({request: 10, uport}, 11)).toMatchSnapshot()
  expect(fetchRequest({request: 10, uport}, 110)).toBeNull()
  expect(fetchRequest({request: 10, uport: multi}, 10)).toMatchSnapshot()
  expect(fetchRequest({request: 14, uport: multi}, 11)).toMatchSnapshot()
})

it('returns currentRequestAuthorized', () => {
  expect(currentRequestAuthorized({})).toBeFalsy()
  expect(currentRequestAuthorized({request: 10, uport})).toBeFalsy()
  expect(currentRequestAuthorized({request: 11, uport})).toBeTruthy()
})

it('returns currentRequestType', () => {
  expect(currentRequestType({})).toBeNull()
  expect(currentRequestType({request: 10, uport})).toEqual('sign')
  expect(currentRequestType({request: 11, uport})).toEqual('connect')
})

it('returns destinationProfile', () => {
  expect(destinationProfile({})).toBeNull()
  expect(destinationProfile({request: 10, uport}, selectedIdentity)).toMatchSnapshot()
  expect(destinationProfile({request: 11, uport}, selectedIdentity)).toMatchSnapshot()
  expect(destinationProfile({request: 12, uport})).toMatchSnapshot()
  expect(destinationProfile({request: 13, uport})).toMatchSnapshot()
  expect(destinationProfile({request: 10, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 11, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 12, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 13, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 14, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 15, uport: multi})).toMatchSnapshot()
})

it('returns clientProfile', () => {
  expect(clientProfile({})).toBeNull()
  expect(destinationProfile({request: 10, uport}, selectedIdentity)).toMatchSnapshot()
  expect(destinationProfile({request: 11, uport}, selectedIdentity)).toMatchSnapshot()
  expect(destinationProfile({request: 12, uport})).toMatchSnapshot()
  expect(destinationProfile({request: 13, uport})).toMatchSnapshot()
  expect(destinationProfile({request: 10, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 11, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 12, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 13, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 14, uport: multi})).toMatchSnapshot()
  expect(destinationProfile({request: 15, uport: multi})).toMatchSnapshot()
})

it('returns activities', () => {
  expect(activities({})).toMatchSnapshot()
  expect(activities({uport})).toMatchSnapshot()
  expect(activities({uport: multi})).toMatchSnapshot()
})
