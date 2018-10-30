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
import reducer from 'uPortMobile/lib/reducers/index.js'
import { resetDevice } from 'uPortMobile/lib/actions/globalActions.js'
import { hashMap, toClj, queue } from 'mori'

const withData = {
  uport: toClj({
    byAddress: {
      '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a': {
        controllerAddress: '0xff708db3af14fbd9b125ac88d3f7c1c03e6bc36f',
        deviceAddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
        publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
        network: 'ropsten',
        recoveryAddress: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
        address:'0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
        own: {
          name: 'Alice',
          phone: '555-555-5555',
          connections: {
            knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01']
          }
        }
      }
    }
  }),
  hub: hashMap('head', 'bcdefg', 'events', queue({type: 'HELLO'}))
}

it('initializes all reducers', () => {
  expect(reducer(undefined, {type: 'IGNORE'})).toMatchSnapshot()
  expect(reducer({}, {type: 'IGNORE'})).toMatchSnapshot()
})

it('resetDevice()', () => {
  expect(reducer(undefined, resetDevice())).toMatchSnapshot()
  expect(reducer({}, resetDevice())).toMatchSnapshot()
  expect(reducer(withData, resetDevice())).toMatchSnapshot()
})
