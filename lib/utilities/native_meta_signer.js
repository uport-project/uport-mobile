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
import RLP from 'ethers-utils/rlp'
import leftPad from 'left-pad'
import { txutils } from 'eth-signer/dist/eth-signer-simple.js'
import { TxRelay } from 'uport-identity'
import { partial } from 'mori'
import { RNUportSigner, RNUportHDSigner } from 'react-native-uport-signer'

const txRelayAbi = TxRelay.v2.abi

// TODO - make whitelist configurable, or default to sensui (0x0) is not secure
const DEFAULT_WHITELIST = '0x0000000000000000000000000000000000000000'

function stripZeros (buffer) {
  let i = 0; // eslint-disable-line
  for (i = 0; i < buffer.length; i++) {
    if (buffer[i] !== 0) { break }
  }
  return (i > 0) ? buffer.slice(i) : buffer
}

function padToEven (str) {
  return str.length % 2 ? `0${str}` : str
}

function padTo64 (n) {
  n = stripHexPrefix(n)
  return leftPad(n, '64', '0')
}

function stripHexPrefix (str) {
  if (str.startsWith('0x')) {
    return str.slice(2)
  }
  return str
}

function addHexPrefix (str) {
  if (str.startsWith('0x')) {
    return str
  }
  return '0x' + str
}

export function bnToBuffer (bn) {
  return stripZeros(Buffer.from(padToEven(bn.toString(16)), 'hex'))
}

class NativeMetaSigner {
  constructor (address, hdpath, root, relayAddress, whitelistOwner = DEFAULT_WHITELIST) {
    this.address = address
    this.txRelayAddress = relayAddress
    this.whitelistOwner = whitelistOwner
    this.hdpath = hdpath
    this.root = root
  }

  getAddress () {
    return this.address
  }

  signRawTx (rawTx, callback) {
    let [
      raw_nonce,
      raw_gasPrice,
      raw_gasLimit,
      raw_to,
      raw_value,
      raw_data
    ] = RLP.decode(addHexPrefix(rawTx))

    let to = stripHexPrefix(raw_to)
    let data = stripHexPrefix(raw_data)
    let nonce
    if (raw_nonce === '0x') {
      nonce = '0'
    } else {
      nonce = parseInt(raw_nonce, 16).toString(16)
    }
    let wrapperTx = {
      'gasPrice': raw_gasPrice,
      'gasLimit': raw_gasLimit,
      'value': 0,
      'to': this.txRelayAddress
    }

    // Tight packing, as Solidity keccak256 does
    let hashInput = '1900' + stripHexPrefix(this.txRelayAddress)
                    + stripHexPrefix(this.whitelistOwner) + padTo64(nonce) + to + data
    let encodedHashInput = Buffer.from(hashInput, 'hex').toString('base64')

    let delegateSigning
    if (this.hdpath) {
      delegateSigning = partial(RNUportHDSigner.signTx, this.root, this.hdpath)
    } else {
      delegateSigning = partial(RNUportSigner.signTx, this.address)
    }
    delegateSigning(encodedHashInput, 'Please sign transaction').then(signature => {
      let rawMetaSignedTx = txutils.functionTx(txRelayAbi, 'relayMetaTx', [
        signature.v,
        addHexPrefix(Buffer.from(signature.r, 'base64').toString('hex')),
        addHexPrefix(Buffer.from(signature.s, 'base64').toString('hex')),
        raw_to,
        raw_data,
        addHexPrefix(this.whitelistOwner)
      ], wrapperTx)

      callback(null, rawMetaSignedTx)
    }, error => callback(error))
  }
}

export default NativeMetaSigner
