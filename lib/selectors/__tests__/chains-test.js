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
jest.mock('uPortMobile/lib/utilities/native_signer', () => {
  return function NativeSigner (address, hdpath, root) {
    return { type: 'native_signer', address, hdpath, root }
  }
})

jest.mock('uPortMobile/lib/utilities/native_meta_signer', () => {
  return function NativeMetaSigner (address, hdpath, root) {
    return { type: 'native_meta_signer', address, hdpath, root }
  }
})

jest.mock('ethjs/dist/ethjs.min.js', () => {
  return require('ethjs')
})

import {
  networkSettings,
  networkSettingsForAddress,
  currentNetwork,
  fuelToken,
  fuelTokenForAddress,
  deviceAddress,
  hexAddressForAddress,
  deviceAddressForAddress,
  txRelayAddressForAddress,
  deviceSignerForAddress,
  nativeSignerForAddress,
  deviceMetaSignerForAddress,
  proxySignerForAddress,
  identityManagerSignerForAddress,
  metaIdentityManagerSignerForAddress,
  metaTxMIMSignerForAddress,
  recoverySeedSignerForAddress,
  recoveryAddress,
  recoveryAddressForAddress,
  recoveryType,
  recoveryTypeForAddress,
  defaultWeb3,
  web3ForNetwork,
  web3ForAddress,
  gasPrice,
  deviceAddresses,
  keychainSecurityLevel,
  securityLevelForAddress,
  securityLevel,
  onboardingNetwork
} from 'uPortMobile/lib/selectors/chains'
import { defaultNetwork } from 'uPortMobile/lib/utilities/networks'
import { toClj, hashMap, assoc } from 'mori'
// import { massage } from 'uPortMobile/lib/store/stateSaver'

const uport = toClj({
  byAddress: {
    '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a': {
      network: 'ropsten',
      securityLevel: 'simple',
      address: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
      hexaddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
      controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6b',
      txRelayAddress: '0x12376dce9e9a85e6f9df7b09b2354da44cb44324',
      deviceAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6c',
      recoveryAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6d',
      recoveryType: 'seed',
      fuelToken: 'SENSUIFUELTOKENA',
      nonce: 12,
      fuel: 1231231,
      balance: 13241341234
    },
    '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX': {
      network: 'kovan',
      securityLevel: 'prompt',
      address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
      hexaddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad60',
      controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad61',
      txRelayAddress: '0x98776dce9e9a85e6f9df7b09b2354da44cb42345',
      deviceAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad62',
      recoveryAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63',
      recoveryType: 'social',
      fuelToken: 'SENSUIFUELTOKENB',
      nonce: 2,
      fuel: 31231231,
      balance: 53241341234
    },
    '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY': {
      network: 'kovan',
      securityLevel: 'prompt',
      address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY',
      deviceAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63',
      parent: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
      fuelToken: 'SENSUIFUELTOKENC',
      rpcUrl: 'https://brazil.uport.me/rpc',
      registry: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad78',
      faucetUrl: 'https://brazil.uport.me/faucet',
      relayUrl: 'https://brazil.uport.me/relay',
      controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad69',
      txRelayAddress: '0xda8c6dce9e9a85e6f9df7b09b2354da44cb48331'
    }
  },
  currentIdentity: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
})

const hduport = toClj({
  byAddress: {
    '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX': {
      network: 'kovan',
      hdindex: 0,
      securityLevel: 'prompt',
      address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY',
      deviceAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63',
      hexaddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63',
      parent: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
      fuelToken: 'SENSUIFUELTOKENC',
      controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad69'
    },
    '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY': {
      network: 'kovan',
      hdindex: 1,
      parent: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
      securityLevel: 'prompt',
      address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY',
      deviceAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad64',
      hexaddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad64',
      fuelToken: 'SENSUIFUELTOKENC',
      controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad69'
    }
  },
  currentIdentity: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'
})
const hdwallet = toClj({
  root: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63',
  identities: [1]
})

it('returns default networkSettings', () => {
  expect(networkSettings({})).toMatchSnapshot()
  expect(networkSettings({uport})).toMatchSnapshot()
  expect(networkSettings({uport: assoc(uport, 'currentIdentity', '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')})).toMatchSnapshot()
})

it('returns networkSettingsForAddress', () => {
  expect(networkSettingsForAddress({}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(networkSettingsForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(networkSettingsForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toMatchSnapshot()
  expect(networkSettingsForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toMatchSnapshot()
})

it('returns default currentNetwork', () => {
  expect(currentNetwork({})).toEqual('rinkeby')
  expect(currentNetwork({uport})).toEqual('ropsten')
  expect(currentNetwork({uport: assoc(uport, 'currentIdentity', '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')})).toEqual('kovan')
})

it('returns deviceAddress', () => {
  expect(deviceAddress({})).toBeNull()
  expect(deviceAddress({uport})).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6c')
  expect(deviceAddress({uport: assoc(uport, 'currentIdentity', '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')})).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad62')
})

it('returns deviceAddressForAddress', () => {
  expect(deviceAddressForAddress({})).toBeNull()
  expect(deviceAddressForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6c')
  expect(deviceAddressForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad62')
  expect(deviceAddressForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
})

it('returns hexAddressForAddress', () => {
  expect(hexAddressForAddress({})).toBeNull()
  expect(hexAddressForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')
  expect(hexAddressForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad60')
  expect(hexAddressForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
  expect(hexAddressForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad64')
})

it('returns txRelayAddressForAddress', () => {
  expect(txRelayAddressForAddress({})).toBeNull()
  expect(txRelayAddressForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toEqual('0x12376dce9e9a85e6f9df7b09b2354da44cb44324')
  expect(txRelayAddressForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('0x98776dce9e9a85e6f9df7b09b2354da44cb42345')
  expect(txRelayAddressForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toEqual('0xda8c6dce9e9a85e6f9df7b09b2354da44cb48331')
})

it('returns recoveryAddress', () => {
  expect(recoveryAddress({})).toBeNull()
  expect(recoveryAddress({uport})).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6d')
  expect(recoveryAddress({uport: assoc(uport, 'currentIdentity', '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')})).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
})

it('returns recoveryAddressForAddress', () => {
  expect(recoveryAddressForAddress({})).toBeNull()
  expect(recoveryAddressForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6d')
  expect(recoveryAddressForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
})

it('returns recoveryType', () => {
  expect(recoveryType({})).toBeNull()
  expect(recoveryType({uport})).toEqual('seed')
  expect(recoveryType({uport: assoc(uport, 'currentIdentity', '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')})).toEqual('social')
})

it('returns recoveryTypeForAddress', () => {
  expect(recoveryTypeForAddress({})).toBeNull()
  expect(recoveryTypeForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toEqual('seed')
  expect(recoveryTypeForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('social')
})

it('returns fuelToken', () => {
  expect(fuelToken({})).toBeNull()
  expect(fuelToken({uport})).toEqual('SENSUIFUELTOKENA')
  expect(fuelToken({uport: assoc(uport, 'currentIdentity', '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')})).toEqual('SENSUIFUELTOKENB')
})

it('returns fuelTokenForAddress', () => {
  expect(fuelTokenForAddress({})).toBeNull()
  expect(fuelTokenForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toEqual('SENSUIFUELTOKENA')
  expect(fuelTokenForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('SENSUIFUELTOKENB')
  expect(fuelTokenForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toEqual('SENSUIFUELTOKENC')
})

it('returns deviceSignerForAddress', () => {
  expect(deviceSignerForAddress({})).toEqual(undefined)
  expect(deviceSignerForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toMatchSnapshot()
  expect(deviceSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(deviceSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toMatchSnapshot()

  expect(deviceSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX').hdpath).toEqual(`m/7696500'/0'/0'/0'`)
  expect(deviceSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY').hdpath).toEqual(`m/7696500'/0'/1'/0'`)
  expect(deviceSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX').root).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
  expect(deviceSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX').root).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
  expect(deviceSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY').root).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
  expect(deviceSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX').root).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
  expect(deviceSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY').root).toEqual('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63')
})

it('returns deviceMetaSignerForAddress', () => {
  expect(deviceMetaSignerForAddress({})).toEqual(undefined)
  expect(deviceMetaSignerForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toMatchSnapshot()
  expect(deviceMetaSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(deviceMetaSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toMatchSnapshot()
})

it('returns nativeSignerForAddress', () => {
  expect(nativeSignerForAddress({})).toEqual(undefined)
  expect(nativeSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(nativeSignerForAddress({uport: hduport, hdwallet}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toMatchSnapshot()
})

it('returns proxySignerForAddress', () => {
  expect(proxySignerForAddress({})).toEqual(undefined)
  expect(proxySignerForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toMatchSnapshot()
  expect(proxySignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(proxySignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toMatchSnapshot()
})

it('returns identityManagerSignerForAddress', () => {
  expect(identityManagerSignerForAddress({})).toEqual(undefined)
  expect(identityManagerSignerForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toMatchSnapshot()
  expect(identityManagerSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(identityManagerSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toMatchSnapshot()
})

it('returns metaIdentityManagerSignerForAddress', () => {
  expect(metaIdentityManagerSignerForAddress({})).toEqual(undefined)
  expect(metaIdentityManagerSignerForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toMatchSnapshot()
  expect(metaIdentityManagerSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(metaIdentityManagerSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toMatchSnapshot()
})

it('returns metaTxMIMSignerForAddress', () => {
  expect(metaTxMIMSignerForAddress({})).toEqual(undefined)
  expect(metaTxMIMSignerForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toMatchSnapshot()
  expect(metaTxMIMSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
  expect(metaTxMIMSignerForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toMatchSnapshot()
})

it('returns defaultWeb3', () => {
  expect(defaultWeb3({}).currentProvider.host).toEqual('https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c')
  expect(defaultWeb3(uport).currentProvider.host).toEqual('https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c')
  expect(defaultWeb3({uport: assoc(uport, 'currentIdentity', '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')}).currentProvider.host).toEqual('https://kovan.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c')
})

it('returns web3ForNetwork', () => {
  expect(web3ForNetwork({uport}, 'ropsten').currentProvider.host).toEqual('https://ropsten.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c')
  expect(web3ForNetwork({uport}, 'kovan').currentProvider.host).toEqual('https://kovan.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c')
})

it('returns web3ForAddress', () => {
  expect(web3ForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a').currentProvider.host).toEqual('https://ropsten.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c')
  expect(web3ForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX').currentProvider.host).toEqual('https://kovan.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c')
  expect(web3ForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY').currentProvider.host).toEqual('https://brazil.uport.me/rpc')
})

it('returns gasPrice', () => {
  expect(gasPrice({networking: {gasPrice: 12345}})).toEqual(12345)
})

it('returns all deviceAddresses', () => {
  expect(deviceAddresses({})).toEqual([])
  expect(deviceAddresses({uport: {}})).toEqual([])
  expect(deviceAddresses({uport})).toEqual(['0x9df0e9759b17f34e9123adbe6d3f25d54b72ad62', '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad63', '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6c'])
})

it('keychainSecurityLevel returns avatar of current identity', () => {
  expect(keychainSecurityLevel({})).toBeNull()
  expect(keychainSecurityLevel({uport})).toBeNull()
  expect(keychainSecurityLevel({uport: toClj({keychainSecurityLevel: 'touch'})})).toEqual('touch')
})

it('returns securityLevelForAddress', () => {
  expect(securityLevelForAddress({uport}, '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a')).toEqual('simple')
  expect(securityLevelForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('prompt')
  expect(securityLevelForAddress({uport}, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDY')).toEqual('prompt')
})

it('returns securityLevel', () => {
  expect(securityLevel({uport})).toEqual('simple')
  expect(securityLevel({uport: hashMap()})).toEqual('simple')
})

describe('onboardingNetwork()', () => {
  it('returns selected network', () => {
    expect(onboardingNetwork({onboarding: {network: 'tezos'}})).toEqual('tezos')
  })

  it('returns default network if not selected', () => {
    expect(onboardingNetwork({onboarding: {}})).toEqual(defaultNetwork.name)
  })
})
