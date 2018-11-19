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
import { Clipboard } from 'react-native'
import React from 'react'
import { toClj } from 'mori'
import UportIdConnect, { UportId, mapDispatchToProps } from '../UportId'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'
import { OnboardingButton } from 'uPortMobile/lib/components/shared/Button'
import FakeNavigator from '../../testHelpers/FakeNavigator'
import renderer from 'react-test-renderer'
import 'jsdom-global/register'
const connectedState = {
  uport: toClj({
    currentIdentity: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
    byAddress: {
      '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a': {
        controllerAddress: '0xff708db3af14fbd9b125ac88d3f7c1c03e6bc36f',
        deviceAddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
        publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
        publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
        network: 'rinkeby',
        recoveryAddress: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
        address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
        own: {
          name: 'Alice',
          phone: '555-555-5555',
          description: 'Always part of any transaction',
          avatar: { uri: '/ipfs/avatar' },
          banner: { uri: '/ipfs/banner' },
          connections: {
            knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02']
          }
        }
      }
    }
  })
}
describe('Advanced - UportId', () => {
  it('renders uPortId data', () => {
    const tree = renderer.create(
      <UportId navigator={new FakeNavigator()}
        address='34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'
        hexaddress='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
        ipfsAddress='QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y7o'
        explorerUrl='https://ronkeby.etherscan.io'
        resetIdentity={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('doesnt break when empty', () => {
    const tree = renderer.create(
      <UportId navigator={new FakeNavigator()}
        resetIdentity={() => true}
      />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
  it('renders a button that OnClick calls savePublicUport', () => {
    const savePublicUportMock = jest.fn()
    const uportContainer = global.shallow(<UportId
      store={global.mockStore({})}
      navigator={new FakeNavigator()}
      address='34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'
      hexaddress='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
      ipfsProfile='QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y7o'
      explorerUrl='https://ronkeby.etherscan.io'
      resetIdentity={() => true}
      savePublicUport={savePublicUportMock}
    />)
    uportContainer.find(OnboardingButton).first().props().onPress()
    expect(savePublicUportMock).toHaveBeenCalled()
  })
  it('renders a MenuItem that call Clipboard.setString onPress', () => {
    Clipboard.setString = jest.fn()
    const uportContainer = global.shallow(<UportId
      store={global.mockStore({})}
      navigator={new FakeNavigator()}
      address='34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'
      hexaddress='0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
      ipfsProfile='QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y7o'
      explorerUrl='https://ronkeby.etherscan.io'
      resetIdentity={() => true}
      savePublicUport={() => true}
    />)
    uportContainer.find(MenuItem).first().props().onPress()
    expect(Clipboard.setString).toHaveBeenCalled()
  })

  it('should call dispatch when the resetIdentity function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).resetIdentity()
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('should call dispatch when the savePublicUport function is called', () => {
    const dispatchMock = jest.fn()
    mapDispatchToProps(dispatchMock).savePublicUport()
    expect(dispatchMock).toHaveBeenCalled()
  })

  it('renders a connected component as expected', () => {
    const initialState = connectedState
    const wrapper = global.shallow(
      <UportIdConnect
        navigator={new FakeNavigator()}
      />,
      { context: { store: global.mockStore(initialState) } },
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })
})
