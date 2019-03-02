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
jest.mock('react-native', () => {
  let MockNativeModule = require('../mock_native_module.js')
  const address = '0x7f2d6bb19b6a52698725f4a292e985c51cefc315'
  const privateKey = '0x3686e245890c7f997766b73a21d8e59f6385e1208831af3862574790cbc3d158'

  return MockNativeModule(address, privateKey, undefined, '0x7f2d6bb19b6a52698725f4a292e985c51cefc319')
})

jest.mock('react-native-uport-signer', () => {
  let MockNativeModule = require('../mock_native_module.js')
  const address = '0x7f2d6bb19b6a52698725f4a292e985c51cefc315'
  const privateKey = '0x3686e245890c7f997766b73a21d8e59f6385e1208831af3862574790cbc3d158'

  return MockNativeModule(address, privateKey, undefined, '0x7f2d6bb19b6a52698725f4a292e985c51cefc319')
})
import sinon from 'sinon'

const address = '0x7f2d6bb19b6a52698725f4a292e985c51cefc315'
const root = '0x7f2d6bb19b6a52698725f4a292e985c51cefc319'
const badAddress = '0x7f2d6bb19b6a52698725f4a292e985c51cefc316'
const relayAddress = '0xf85c44a9062acddcb5b174868fc62dd1f8c9e7f9'
const whitelistOwner = '0x737f53c0cebf0acd1ea591685351b2a8580702a5'

import NativeMetaSigner from '../native_meta_signer'
import { NativeModules } from 'react-native'
import { RNUportSigner, RNUportHDSigner } from 'react-native-uport-signer'

describe('NativeMetaSigner', () => {
  describe('non-hd signer', () => {
    const signer = new NativeMetaSigner(address, undefined, undefined, relayAddress, whitelistOwner)
    it('should have the correct address', () => {
      expect(signer.getAddress()).toEqual(address)
    })

    it('should sign transaction', () => new Promise((resolve, reject) => {
      // tests same tx as EthSigner tests
      signer.signRawTx('f601850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080', (error, tx) => {
        if (error) return reject(error)
        resolve(tx)
      })
    }).then(tx => expect(tx).toEqual('f9012b80850ba43b7400832fefd894f85c44a9062acddcb5b174868fc62dd1f8c9e7f980b90104c3f44c0a000000000000000000000000000000000000000000000000000000000000001ca5ea2ebc7fdeda7dd51e730aeb375f5d1dbd9f37f64a9b58a1a8fba78b64c29c79783652dd3afa35fd1a2da566ebb7dd5fb693b58e04625bbdd1225f17d8e5e90000000000000000000000009e2068cce22de4e1e80f15cb71ef435a20a3b37c00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000737f53c0cebf0acd1ea591685351b2a8580702a500000000000000000000000000000000000000000000000000000000000000090abcdef0123456789000000000000000000000000000000000000000000000001c8080')))

    it('should use NativeMetaSignerModule.signTx()', () => new Promise((resolve, reject) => {
      sinon.spy(RNUportSigner, 'signTx')
      signer.signRawTx('f601850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080', (error, tx) => {
        if (error) return reject(error)
        resolve(tx)
      })
    }).then(tx => expect(RNUportSigner.signTx.calledOnce).toBeTruthy()))

    it('should handle unsupported address', () => new Promise((resolve, reject) => {
      const badsigner = new NativeMetaSigner(badAddress, undefined, undefined, relayAddress, whitelistOwner)
      badsigner.signRawTx('f680850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080', (error, tx) => {
        if (error) return reject(error)
        resolve(tx)
      })})
      .catch(e => expect(e.message).toEqual('Unsupported address'))
    )
  })

  describe('hd signer', () => {
    const signer = new NativeMetaSigner(address, `m/7696500'/0'/0'/0'`, root, relayAddress, whitelistOwner)
    it('should have the correct address', () => {
      expect(signer.getAddress()).toEqual(address)
    })

    it('should sign transaction', () => new Promise((resolve, reject) => {
      signer.signRawTx('f601850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080', (error, tx) => {
        if (error) return reject(error)
        resolve(tx)
      })
    }).then(tx => expect(tx).toEqual('f9012b80850ba43b7400832fefd894f85c44a9062acddcb5b174868fc62dd1f8c9e7f980b90104c3f44c0a000000000000000000000000000000000000000000000000000000000000001ca5ea2ebc7fdeda7dd51e730aeb375f5d1dbd9f37f64a9b58a1a8fba78b64c29c79783652dd3afa35fd1a2da566ebb7dd5fb693b58e04625bbdd1225f17d8e5e90000000000000000000000009e2068cce22de4e1e80f15cb71ef435a20a3b37c00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000737f53c0cebf0acd1ea591685351b2a8580702a500000000000000000000000000000000000000000000000000000000000000090abcdef0123456789000000000000000000000000000000000000000000000001c8080')))

    it('should use NativeHDSignerModule.signTx()', () => new Promise((resolve, reject) => {
      sinon.spy(RNUportHDSigner, 'signTx')
      signer.signRawTx('f601850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080', (error, tx) => {
        if (error) return reject(error)
        resolve(tx)
      })
    }).then(tx => expect(RNUportHDSigner.signTx.calledOnce).toBeTruthy())
    .then(() => expect(RNUportHDSigner.signTx.getCall(0).args[0]).toEqual(root))
    .then(() => expect(RNUportHDSigner.signTx.getCall(0).args[1]).toEqual(`m/7696500'/0'/0'/0'`)))

    it('should handle unsupported address', () => new Promise((resolve, reject) => {
      const badsigner = new NativeMetaSigner(badAddress, `m/7696500'/0'/0'/0'`, relayAddress, whitelistOwner)
      badsigner.signRawTx('f601850ba43b7400832fefd8949e2068cce22de4e1e80f15cb71ef435a20a3b37c880de0b6b3a7640000890abcdef012345678901c8080', (error, tx) => {
        if (error) return reject(error)
        resolve(tx)
      })
    }).catch(e => expect(e.message).toEqual('Unsupported address')))
  })
})
