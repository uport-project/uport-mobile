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
module.exports = function MockNativeModule (signerAddress, privateKey, publicKey, root) {
  const keccak256 = require('js-sha3').keccak_256
  const secp256k1 = require('secp256k1')
  const naclutil = require('uPortMobile/lib/vendor/nacl-util')
  
  return {
    NativeModules: {
      NativeSignerModule: {
        signTx: (address, tx, message) => new Promise((resolve, reject) => {
          if (address !== signerAddress) return reject(new Error('Unsupported address'))
          const signature = secp256k1.sign((Buffer.from(keccak256(Buffer.from(tx, 'base64')), 'hex')), Buffer.from(privateKey.slice(2), 'hex'))
          resolve({
            v: 27 + signature.recovery,
            r: signature.signature.slice(0, 32).toString('base64'),
            s: signature.signature.slice(32, 64).toString('base64')
          })
        }),
        createKeyPair: (level) => Promise.resolve({
          address: signerAddress,
          pubKey: Buffer.from(publicKey, 'hex').toString('base64')
        }),
        importKey: (key, level) => Promise.resolve({
          address: signerAddress,
          pubKey: Buffer.from(publicKey, 'hex').toString('base64')
        }),
        allAddresses: () => Promise.resolve([signerAddress])
      },
      NativeHDSignerModule: {
        signTx: (address, path, tx, message) => new Promise((resolve, reject) => {
          if (address !== root) return reject(new Error('Unsupported address'))
          const signature = secp256k1.sign((Buffer.from(keccak256(Buffer.from(tx, 'base64')), 'hex')), Buffer.from(privateKey.slice(2), 'hex'))
          resolve({
            v: 27 + signature.recovery,
            r: signature.signature.slice(0, 32).toString('base64'),
            s: signature.signature.slice(32, 64).toString('base64')
          })
        }),
        createSeed: (level) => Promise.resolve({
          address: signerAddress,
          pubKey: Buffer.from(publicKey, 'hex').toString('base64')
        }),
        importSeed: (seed, level) => Promise.resolve({
          address: signerAddress,
          pubKey: Buffer.from(publicKey, 'hex').toString('base64')
        }),
        addressForPath: (rootAddress, hdPath, prompt) => Promise.resolve({
          address: signerAddress,
          pubKey: Buffer.from(publicKey, 'hex').toString('base64')
        }),
        privateKeyForPath: (rootAddress, hdPath, prompt) => Promise.resolve('Qgigj54O7CsQOhR5vLTfqSQyD3zmq/Gb8ukID7XvC3o='),
        listSeedAddresses: () => Promise.resolve([signerAddress]),
        hasSeed: () => Promise.resolve(true)
      },
      RNRandomBytes: {
        randomBytes: (length, cb) => cb(null, naclutil.decodeBase64('Qgigj54O7CsQOhR5vLTfqSQyD3zmq/Gb8ukID7XvC3o='))
      }
    },
    RNUportSigner: {
      signTx: (address, tx, message) => new Promise((resolve, reject) => {
        if (address !== signerAddress) return reject(new Error('Unsupported address'))
        const signature = secp256k1.sign((Buffer.from(keccak256(Buffer.from(tx, 'base64')), 'hex')), Buffer.from(privateKey.slice(2), 'hex'))
        resolve({
          v: 27 + signature.recovery,
          r: signature.signature.slice(0, 32).toString('base64'),
          s: signature.signature.slice(32, 64).toString('base64')
        })
      }),
      createKeyPair: (level) => Promise.resolve({
        address: signerAddress,
        pubKey: new Buffer(publicKey, 'hex').toString('base64')
      }),
      importKey: (key, level) => Promise.resolve({
        address: signerAddress,
        pubKey: new Buffer(publicKey, 'hex').toString('base64')
      }),
      allAddresses: () => Promise.resolve([signerAddress])
    },
    RNUportHDSigner: {
      signTx: (address, path, tx, message) => new Promise((resolve, reject) => {
        if (address !== root) return reject(new Error('Unsupported address'))
        const signature = secp256k1.sign((Buffer.from(keccak256(Buffer.from(tx, 'base64')), 'hex')), Buffer.from(privateKey.slice(2), 'hex'))
        resolve({
          v: 27 + signature.recovery,
          r: signature.signature.slice(0, 32).toString('base64'),
          s: signature.signature.slice(32, 64).toString('base64')
        })
      }),
      createSeed: (level) => Promise.resolve({
        address: signerAddress,
        pubKey: new Buffer(publicKey, 'hex').toString('base64')
      }),
      importSeed: (seed, level) => Promise.resolve({
        address: signerAddress,
        pubKey: new Buffer(publicKey, 'hex').toString('base64')
      }),
      addressForPath: (rootAddress, hdPath, prompt) => Promise.resolve({
        address: signerAddress,
        pubKey: new Buffer(publicKey, 'hex').toString('base64')
      }),
      privateKeyForPath: (rootAddress, hdPath, prompt) => Promise.resolve('Qgigj54O7CsQOhR5vLTfqSQyD3zmq/Gb8ukID7XvC3o=')
    },
  }
}
