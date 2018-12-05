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
// Adapted from https://github.com/ethjs/ethjs-signer/blob/master/src/index.js
import { NativeModules } from 'react-native'
import rlp from 'rlp'
import { partial } from 'mori'
const keccak256 = require('js-sha3').keccak_256

// const stripHexPrefix = require('strip-hex-prefix');

function stripZeros (buffer) {
  var i = 0; // eslint-disable-line
  for (i = 0; i < buffer.length; i++) {
    if (buffer[i] !== 0) { break }
  }
  return (i > 0) ? buffer.slice(i) : buffer
}

function padToEven (str) {
  return str.length % 2 ? `0${str}` : str
}

function getSignatureAsHexComponents(signature) {
  return {
    v: signature.v,
    r: `0x${Buffer.from(signature.r, 'base64').toString('hex')}`,
    s: `0x${Buffer.from(signature.s, 'base64').toString('hex')}`,
  } 
}

export function bnToBuffer (bn) {
  return stripZeros(Buffer.from(padToEven(bn.toString(16)), 'hex'))
}

class NativeSigner {
  constructor (address, hdpath, root) {
    this.address = address
    this.hdpath = hdpath
    this.root = root
    this.signTypedData = this.signTypedData.bind(this)
    this.personalSign = this.personalSign.bind(this)
  }

  getAddress () {
    return this.address
  }

  getDelegateSigning() {
    return this.hdpath
      ? partial(NativeModules.NativeHDSignerModule.signTx, this.root, this.hdpath)
      : partial(NativeModules.NativeSignerModule.signTx, this.address)
  }

  signRawTx (rawTx, callback) {
    const tx = Buffer.from(rawTx, 'hex')
    const raw = rlp.decode(tx).slice(0, 6)
    // console.log(`tx payload: ${rlp.encode(raw).toString('base64')}`)
    // picks the correct signing method
    const delegateSigning = this.getDelegateSigning()
    delegateSigning(rlp.encode(raw).toString('base64'), 'Please sign transaction').then(signature => {
      // console.log(`signature:`)
      // console.log(signature)
      try {
        raw.push(bnToBuffer(signature.v))
        raw.push(Buffer.from(signature.r, 'base64'))
        raw.push(Buffer.from(signature.s, 'base64'))
        callback(null, rlp.encode(raw).toString('hex'))
      } catch (error) {
        callback(error)
      }
    }, error => callback(error))
  }

  signTypedData (typedData, callback) {
    const delegateSigning = this.getDelegateSigning()
    delegateSigning(typedData.toString('base64'), 'Please sign ERC 712 request').then(signature => {
      try {
        const sig = getSignatureAsHexComponents(signature)
        callback(null, sig)
      } catch (error) {
        callback(error)
      }
    }, error => callback(error))
  }

  personalSign(data, callback) {
    const delegateSigning = this.getDelegateSigning()

    const message = Buffer.from(data, 'utf-8')
    const prefix = Buffer.from(`\u0019Ethereum Signed Message:\n${message.length.toString()}`, 'utf8')
    const messageWithPrefix = Buffer.concat([prefix, message])

    delegateSigning(messageWithPrefix.toString('base64'), 'Please sign personal sign request').then(signature => {
      try {
        const sig = getSignatureAsHexComponents(signature)
        callback(null, sig)
      } catch (error) {
        callback(error)
      }
    }, error => callback(error))
  }
  
}

export default NativeSigner
