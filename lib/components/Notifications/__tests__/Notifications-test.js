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
import 'react-native'
import React from 'react'
import NotificationsConnect, { Notifications, mapDispatchToProps } from '../index'
import { toClj, toJs } from 'mori'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'

function lookupIssuer (address) {
  return {address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02', name: '0x1bc5cbf7...'}
}

// dummy function for the time being
const requested = (claims) => claims

const notifications = [
  {
    id: 10,
    type: 'sign',
    client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
    to: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'
  },
  {
    id: 13,
    type: 'attestation',
    attestations: [{
      iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
      claim: {
        'Zug Citizenship': {
          name: 'Gudrund Müesli'
        }
      }
    }]
  },
  {
    id: 14,
    type: 'disclosure'
  },
  {
    id: 15,
    type: 'connect'
  },
  {
    id: 16,
    type: 'recover'
  },
  {
    id: 17,
    type: 'net'
  }
]
describe('Notifications', () => {
  it('renders correctly without notifications', () => {
    const tree = renderer.create(
      <Notifications
        navigator={new FakeNavigator()}
        notifications={toClj([])}
        lookupIssuer={lookupIssuer}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with notifications', () => {
    const tree = renderer.create(
      <Notifications
        navigator={new FakeNavigator()}
        notifications={toClj(notifications)}
        lookupIssuer={lookupIssuer}
        requested={requested}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls navigator.dismissModal from the onNavigatorEvent function', () => {
    const navigator = new FakeNavigator()
    navigator.dismissModal = jest.fn()
    this.notifications = global.shallow(
      <Notifications
        navigator={navigator}
        notifications={toClj(notifications)}
        lookupIssuer={lookupIssuer}
        requested={requested}
      />
    )
    this.notifications.instance().onNavigatorEvent({type: 'NavBarButtonPress', id: 'close'})
    expect(navigator.dismissModal).toHaveBeenCalled()
  })

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
  it('should call dispatch when the selectRequest function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).selectRequest({})
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('should call dispatch when the hideRequest function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).hideRequest({id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02'})
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('calls lookupIssuer as expected', () => {
    const initialState = {}
    const wrapper = global.shallow(
      <NotificationsConnect
        navigator={new FakeNavigator()}
        address='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.props().lookupIssuer(wrapper.props().address)).toEqual(toJs(externalProfile(initialState, wrapper.props().address)))
  })
  it('calls requested as expected', () => {
    const activity = {
      id: 12,
      type: 'disclosure',
      client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc03'
    }
    const initialState = {}
    const wrapper = global.shallow(
      <NotificationsConnect
        navigator={new FakeNavigator()}
        address='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    console.log(wrapper.props().requested(activity))
    expect(wrapper.props().requested(activity)).toEqual({})
  })

  it('renders a connected component as expected', () => {
    const initialState = {}
    const wrapper = global.shallow(
      <NotificationsConnect
        navigator={new FakeNavigator()}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })
})
