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
const MNID = require('uPortMobile/lib/browserified/mnid')

export const networks = {
  '0x1': {
    name: 'mainnet',
    supported: true,
    network_id: '0x1',
    registry: MNID.encode({address: '0xab5c8051b9a1df1aab0149f8b0630848b7ecabf6', network: '0x1'}),
    rpcUrl: 'https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
    explorerUrl: 'https://etherscan.io',
    // faucetUrl: 'https://api.uport.me/sensui/fund',
    // relayUrl: 'https://api.uport.me/sensui/relay'
  },
  '0x3': {
    name: 'ropsten',
    supported: true,
    faucet: true,
    network_id: '0x3',
    registry: MNID.encode({address: '0x41566e3a081f5032bdcad470adb797635ddfe1f0', network: '0x3'}),
    rpcUrl: 'https://ropsten.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
    explorerUrl: 'https://ropsten.io',
    faucetUrl: 'https://api.uport.me/sensui/fund',
    relayUrl: 'https://api.uport.me/sensui/relay'
  },
  '0x2a': {
    name: 'kovan',
    supported: true,
    network_id: '0x2a',
    registry: MNID.encode({address: '0x5f8e9351dc2d238fb878b6ae43aa740d62fc9758', network: '0x2a'}),
    rpcUrl: 'https://kovan.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
    explorerUrl: 'https://kovan.etherscan.io',
    faucetUrl: 'https://api.uport.me/sensui/fund',
    relayUrl: 'https://api.uport.me/sensui/relay'
  },
  '0x16B2': {
    name: 'infuranet',
    network_id: '0x16B2',
    registry: '',
    explorerUrl: 'https://explorer.infuranet.io',
    rpcUrl: 'https://infuranet.infura.io/uport',
    faucetUrl: 'https://api.uport.me/sensui/fund',
    relayUrl: 'https://api.uport.me/sensui/relay'
  },
  '0x4': {
    name: 'rinkeby',
    supported: true,
    network_id: '0x4',
    registry: MNID.encode({address: '0x2cc31912b2b0f3075a87b3640923d45a26cef3ee', network: '0x4'}),
    explorerUrl: 'https://rinkeby.etherscan.io',
    rpcUrl: 'https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
    faucetUrl: 'https://api.uport.me/sensui/fund',
    relayUrl: 'https://api.uport.me/sensui/relay'
  }
}

export const FAUCETS = {
  rinkeby: {
    url: 'faucet.rinkeby.io'
  },
  rovan: {
    url: 'faucet.kovan.network'
  },
  ropsten: {
    url: 'faucet.ropsten.be'
  }
}

export const networksByName = Object.keys(networks).reduce((h, k) => {
  h[networks[k].name] = networks[k]
  return h
}, {})

export const defaultNetworkId = '0x4'

export function decodeAddress (address) {
  // return MNID.isMNID(address) ? MNID.decode(address) : {network: '0x4', address}
  return MNID.isMNID(address) ? MNID.decode(address) : {network: '0x3', address}
}

export const defaultNetwork = networks[defaultNetworkId]
