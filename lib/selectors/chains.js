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
import { createSelector } from 'reselect'
import { selectKeys, toJs, get, getIn, assoc, map, sort } from 'mori'
import { currentIdentity, selectedIdentity, accountsByAddress, allAccounts } from './identities'
import {
  hdRootAddress, hdPathFor
} from 'uPortMobile/lib/selectors/hdWallet'

import EthSigner from 'eth-signer/dist/eth-signer.js'

const Eth = require('ethjs/dist/ethjs.min.js')

import NativeSigner from 'uPortMobile/lib/utilities/native_signer'
import NativeMetaSigner from 'uPortMobile/lib/utilities/native_meta_signer'
import { networksByName, defaultNetwork } from '../utilities/networks'
import { DEFAULT_LEVEL } from '../sagas/keychain';
const Signer = EthSigner.signer
const ProxySigner = EthSigner.signers.ProxySigner
const IMProxySigner = EthSigner.signers.IMProxySigner
const MIMProxySigner = EthSigner.signers.MIMProxySigner

export const selectedNetwork = (state, network) => (network || defaultNetwork.name)

export const gasPrice = (state) => state.networking.gasPrice
export const onboardingNetwork = state => state.onboarding.network || defaultNetwork.name

export function createProvider ({rpcUrl}) {
  return new Eth(new Eth.HttpProvider(rpcUrl))
}
// Returns a JS object with the following structure:
/* { balance: { negative: 0, words: [ 0,  ], length: 1, red: null },
  fuel:
   { negative: 0,
     words: [ 37990400, 44849631, 21,  ],
     length: 3,
     red: null },
  controllerAddress: '0xd35c4800b1f121185f32e43f886e96a6d32a6021',
  deviceAddress: '0xf8560d31daa5d9e033d082945395ffc65abbc3df',
  network: 'rinkeby',
  recoveryAddress: '0xf974a3dee42a1f8638948513793d6ce77da5d1da',
  address: '2oxo6Sb56dcQgHunK1WLNjo9xcTV4gGbP9k',
  recoveryType: 'seed',
  nonce: 2,
  fuelToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiJuaXNhYmEudXBvcnQubWUiLCJpYXQiOjE1MDI0NTQ3NTcsImV4cCI6MTUwMjQ1NTA1Nywic3ViIjoiMHhmODU2MGQzMWRhYTVkOWUwMzNkMDgyOTQ1Mzk1ZmZjNjVhYmJjM2RmIiwiYXVkIjpbIm5pc2FiYS51cG9ydC5tZSIsInVubnUudXBvcnQubWUiLCJzZW5zdWkudXBvcnQubWUiXSwicGhvbmVOdW1iZXIiOiIrMTMxMDQwNDE1ODYifQ.udCvdFvRe-PuiknpEllkdgLre_GSn5UjVHwolYZzVl3KvT2sTrylcsy5LQyUdyyWjUsBjlAkfm9GzZgYPITmnw',
  hexaddress: '0xda7d527872a94acf363b9b43caae1bdd6ff577c5' }
*/
export const networkSettings = createSelector(
  [currentIdentity],
  (identity) => toJs(selectKeys(identity, ['address', 'hexaddress', 'deviceAddress', 'controllerAddress', 'txRelayAddress', 'recoveryAddress', 'recoveryType', 'signerType', 'network', 'nonce', 'metaNonce', 'fuelToken', 'fuel', 'balance', 'parent', 'rpcUrl', 'registry', 'faucetUrl', 'relayUrl']))
)

// Returns a mori object of network settings for the selected identity and any parent identities.
export const networkSettingsForAddressMap = createSelector(
  [selectedIdentity, accountsByAddress],
  (identity, identities) => {
    const main = selectKeys(identity, ['address', 'hexaddress', 'hdindex', 'deviceAddress', 'controllerAddress', 'txRelayAddress', 'recoveryAddress', 'recoveryType', 'signerType', 'network', 'nonce', 'metaNonce', 'fuelToken', 'fuel', 'balance', 'parent', 'rpcUrl', 'registry', 'faucetUrl', 'relayUrl'])
    return main
  }
)
// Returns a JS object of the networkSettingsForAddressMap
export const networkSettingsForAddress = createSelector(
  [networkSettingsForAddressMap],
  (settings) => toJs(settings)
)

export const isHD = createSelector(
  [selectedIdentity],
  id => typeof get(id, 'hdindex') === 'number'
)

export const currentNonce = createSelector(
  [selectedIdentity],
  (identity) => toJs(get(identity, 'nonce'))
)

// Returns a string of the currentNetwork that the currentIdentity is on
export const currentNetwork = createSelector(
  [currentIdentity, selectedNetwork],
  (identity, network) => get(identity, 'network') || network
)

// Returns a string of the fuelToken for the currentIdentity
export const fuelToken = createSelector(
  [currentIdentity],
  (identity) => get(identity, 'fuelToken')
)

// Returns a string of the current identities securityLevel
export const securityLevelForAddress = createSelector(
  [selectedIdentity],
  (identity) => get(identity, 'securityLevel')
)

export const securityLevel = createSelector(
  [currentIdentity],
  (identity) => get(identity, 'securityLevel') || DEFAULT_LEVEL
)
// Returns a string of the fuelToken for the selectedAddress
// Returns null if no address is selected
export const fuelTokenForAddress = createSelector(
  [networkSettingsForAddressMap],
  (identity) => get(identity, 'fuelToken')
)

// Returns a string of the deviceAddress for the currentIdentity
export const deviceAddress = createSelector(
  [currentIdentity],
  (identity) => get(identity, 'deviceAddress')
)

export const isFullyHD = createSelector(
  [hdRootAddress, deviceAddress],
  (root, device) => root === device
)

// Returns a string of the deviceAddress for the selectedAddress
// Returns null if no address is selected
export const deviceAddressForAddress = createSelector(
  [networkSettingsForAddressMap],
  (identity) => get(identity, 'deviceAddress')
)

// Returns a string of the hexAddress for the selectedAddress
// Returns null if no address is selected
export const hexAddressForAddress = createSelector(
  [networkSettingsForAddressMap],
  (identity) => get(identity, 'hexaddress')
)

// Returns the txRelayAddress of the deviceAddress for the selectedAddress
// Returns null if no address is selected
export const txRelayAddressForAddress = createSelector(
  [networkSettingsForAddressMap],
  (identity) => get(identity, 'txRelayAddress')
)

// Returns a new NativeSigner for the device address returned for the selectedIdentity
export const deviceSignerForAddress = createSelector(
  [deviceAddressForAddress, hdPathFor, hdRootAddress],
  (address, path, root) => {
    if (address || path || root) return new NativeSigner(address, path, root)
  }
)

// Returns a new NativeMetaSigner for the device address returned for the selectedIdentity
export const deviceMetaSignerForAddress = createSelector(
  [deviceAddressForAddress, hdPathFor, hdRootAddress, txRelayAddressForAddress],
  (address, path, root, txRelayAddress) => {
    if (address || path || root) {
      return new NativeMetaSigner(address, path, root, txRelayAddress)
    }
  }
)

// Returns a new NativeSigner for the address returned for the selectedIdentity
export const nativeSignerForAddress = createSelector(
  [hexAddressForAddress, hdPathFor, hdRootAddress],
  (address, path, root) => {
    if (address || path || root) {
      return new NativeSigner(address, path, root)
    }
  }
)

// Returns a string of the recoveryAddress for the currentIdentity
export const recoveryAddress = createSelector(
  [currentIdentity],
  (identity) => get(identity, 'recoveryAddress')
)

// Returns a string of the recoveryType for the currentIdentity
export const recoveryType = createSelector(
  [currentIdentity],
  (identity) => get(identity, 'recoveryType')
)

// Returns a string of the recoveryAddress for the selectedIdentity
export const recoveryAddressForAddress = createSelector(
  [selectedIdentity],
  (identity) => get(identity, 'recoveryAddress')
)

// Returns a string of the recoveryType for the selectedIdentity
export const recoveryTypeForAddress = createSelector(
  [selectedIdentity],
  (identity) => get(identity, 'recoveryType')
)

// Returns a new ProxySigner for the selected address
export const proxySignerForAddress = createSelector(
  [networkSettingsForAddress, deviceSignerForAddress],
  (settings, device) => {
    if (device) {
      return new Signer(new ProxySigner(settings.hexaddress || settings.address, device, settings.controllerAddress))
    }
  }
)

// Returns a new IMProxySigner for the selected address
export const identityManagerSignerForAddress = createSelector(
  [networkSettingsForAddress, deviceSignerForAddress],
  (settings, deviceSigner) => {
    if (deviceSigner) {
      return new Signer(new IMProxySigner(settings.hexaddress || settings.address, deviceSigner, settings.controllerAddress))
    }
  }
)

// Returns a new MIMProxySigner for the selected address without metaTx functionality
export const metaIdentityManagerSignerForAddress = createSelector(
  [networkSettingsForAddress, deviceSignerForAddress],
  (settings, deviceSigner) => {
    if (deviceSigner) {
      return new Signer(new MIMProxySigner(settings.hexaddress || settings.address, deviceSigner, settings.controllerAddress))
    }
  }
)

// Returns a new MIMProxySigner for the selected address with metaTx functionality
export const metaTxMIMSignerForAddress = createSelector(
  [networkSettingsForAddress, deviceMetaSignerForAddress],
  (settings, deviceSigner) => {
    if (deviceSigner) {
      return new Signer(new MIMProxySigner(settings.hexaddress || settings.address, deviceSigner, settings.controllerAddress))
    }
  }
)

// This should mostly not be used as we should almost always know the network
// Returns a provider for the current network
export const defaultWeb3 = createSelector(
  [currentNetwork],
  (network) => {
    const settings = networksByName[network]
    return createProvider(settings)
  }
)

// Use this when interacting with a specific network
// Returns a provider for the selected network
export const web3ForNetwork = createSelector(
  [selectedNetwork],
  (network) => {
    const settings = networksByName[network]
    return createProvider(settings)
  }
)

// Returns a provider for a network and the settings
export const web3ForAddress = createSelector(
  [networkSettingsForAddress],
  (settings) => {
    const network = networksByName[settings.network] || settings
    return createProvider({...network, ...settings})
  }
)

// Return a JS object of all device addresses
export const deviceAddresses = createSelector(
  [allAccounts],
  accounts => toJs(sort(map(i => get(i, 'deviceAddress'), accounts)))
)

export const keychainSecurityLevel = (state) => get(state.uport, 'keychainSecurityLevel')
