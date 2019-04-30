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
import { 
  unread, 
  unreadCount, 
  history, 
  historyCount, 
  activities, 
  notifications,
  notificationCount,
  activitiesForAddress, 
  activitiesByAddress, 
  unconfirmedTransactions 
} from 'uPortMobile/lib/selectors/activities'
import { toJs, toClj, assocIn, vector } from 'mori'
import { massage } from 'uPortMobile/lib/sagas/stateSaver'
import { storeIdentity } from 'uPortMobile/lib/actions/uportActions'

const uport = massage(toClj({
  byAddress: {
    '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a': {
      address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
      activities: {
        '10': {
          id: 10,
          type: 'sign',
          authorizedAt: 14834004807621990,
          client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
          to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
        },
        '11': {
          id: 11,
          type: 'connect',
          authorizedAt: 14834004807621990,
          to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
        },
        '12': {
          id: 12,
          type: 'disclosure',
          client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc03'
        },
        '13': {
          id: 13,
          type: 'attestation',
          iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'
        },
        '18': {
          id: '18',
          type: 'attestation',
          authorizedAt: 14834004807621990,
          opened: true,
          attestations: [{name: 'Bob'}],
        },
        '19': {
          id: '19',
          type: 'attestation',
          authorizedAt: 14834004807621990,
          attestations: [{name: 'Bob'}],
        }
      },
      stats: {
        '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01': {
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

const withIdentity = {uport}

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
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
    }
  }
}
 
const withMultipleIdentities = {
  uport: uportReducer(withIdentity.uport, storeIdentity(otherIdentity))
}

const identityWithTransactions = {
  network: 'ropsten',
  address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
  own: {
    name: 'Ropsten User',
    phone: '555-555-5555',
  },
  activities: {
    '16': {
      id: '14',
      type: 'sign',
      txhash: 'abcd',
      blockNumber: 1231,
      authorizedAt: 14834004807621990,
      client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
    },
    '17': {
      id: '15',
      type: 'sign',
      txhash: 'abcd',
      authorizedAt: 14834004807621990,
      to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
    }
  }
}

const withTransactions = {
  uport: uportReducer(withIdentity.uport, storeIdentity(identityWithTransactions))
}

it('returns history', () => {
  expect(history({})).toEqual([])
  expect(history({})).toMatchSnapshot()
  expect(history(withIdentity)).toMatchSnapshot()
  expect(history(withMultipleIdentities)).toMatchSnapshot()
})

it('returns historyCount', () => {
  expect(historyCount({})).toEqual(0)
  expect(historyCount({})).toEqual(0)
  expect(historyCount(withIdentity)).toEqual(4)
  expect(historyCount(withMultipleIdentities)).toEqual(2)
})

it('returns unreadCount', () => {
  expect(unreadCount({})).toEqual(0)
  expect(unreadCount({})).toEqual(0)
  expect(unreadCount(withIdentity)).toEqual(2)
  expect(unreadCount(withMultipleIdentities)).toEqual(0)
})

it('returns unread', () => {
  expect(toJs(unread({}))).toEqual([])
  expect(toJs(unread({}))).toMatchSnapshot()
  expect(toJs(unread(withIdentity))).toMatchSnapshot()
  expect(toJs(unread(withMultipleIdentities))).toMatchSnapshot()
})

it('returns notifications', () => {
  expect(toJs(notifications({}))).toEqual([])
  expect(toJs(notifications({}))).toMatchSnapshot()
  expect(toJs(notifications(withIdentity))).toMatchSnapshot()
  expect(toJs(notifications(withMultipleIdentities))).toMatchSnapshot()
})

it('returns notificationCount', () => {
  expect(notificationCount({})).toEqual(0)
  expect(notificationCount({})).toEqual(0)
  expect(notificationCount(withIdentity)).toEqual(3)
  expect(notificationCount(withMultipleIdentities)).toEqual(0)
})

it('returns activities', () => {
  expect(toJs(activities({}))).toEqual([])
  expect(toJs(activities({}))).toMatchSnapshot()
  expect(toJs(activities(withIdentity))).toMatchSnapshot()
  expect(toJs(activities(withMultipleIdentities))).toMatchSnapshot()
})

it('returns activitiesForAddress', () => {
  expect(toJs(activitiesForAddress({}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'))).toEqual([])
  expect(toJs(activitiesForAddress({}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'))).toMatchSnapshot()
  expect(toJs(activitiesForAddress(withMultipleIdentities, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'))).toMatchSnapshot()
  expect(toJs(activitiesForAddress(withMultipleIdentities, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'))).toMatchSnapshot()
})

it('returns activitiesByAddress', () => {
  expect(activitiesByAddress({}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toEqual([])
  expect(activitiesByAddress({}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(activitiesByAddress(withIdentity, '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01')).toMatchSnapshot()
  expect(activitiesByAddress(withIdentity, '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02')).toMatchSnapshot()
  expect(activitiesByAddress(withIdentity, '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc03')).toMatchSnapshot()
})

it('returns unconfirmedTransactions', () => {
  expect(toJs(unconfirmedTransactions({}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'))).toEqual([])
  expect(toJs(unconfirmedTransactions({}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'))).toMatchSnapshot()
  expect(toJs(unconfirmedTransactions(withIdentity, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'))).toMatchSnapshot()
  expect(toJs(unconfirmedTransactions(withTransactions, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'))).toMatchSnapshot()
})
