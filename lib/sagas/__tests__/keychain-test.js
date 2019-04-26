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
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'

import { call, select } from 'redux-saga/effects'

jest.mock('react-native-uport-signer', () => {
  let MockNativeModule = require('../../utilities/mock_native_module.js')
  const address = '0x7f2d6bb19b6a52698725f4a292e985c51cefc315'
  const privateKey = '0x3686e245890c7f997766b73a21d8e59f6385e1208831af3862574790cbc3d158'
  const publicKey = '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'

   return MockNativeModule(address, privateKey, publicKey, '0x7f2d6bb19b6a52698725f4a292e985c51cefc319')
})

import { deviceAddress, deviceAddresses, keychainSecurityLevel, networkSettingsForAddress, isHD } from 'uPortMobile/lib/selectors/chains'
import {
  hdRootAddress, lastIdentityIndex, lastAccountIndex, hdIdentityIndex, hdAccountIndex
} from 'uPortMobile/lib/selectors/hdWallet'
import { publicEncKey, currentAddress, currentIdentity } from 'uPortMobile/lib/selectors/identities'
import { storeIdentity, storeKeyChainLevel, storeSecurityLevel } from 'uPortMobile/lib/actions/uportActions'
import { storeRootAddress, incIdentityIndex, incAccountIndex } from 'uPortMobile/lib/actions/HDWalletActions.js'
import { storeEncryptionKey } from 'uPortMobile/lib/actions/uportActions'

import {
  saveError
} from 'uPortMobile/lib/actions/processStatusActions'
import {
  autoPrompt,
  loadRawKey,
  saveKey,
  canSignFor,
  createSeed,
  importSeed,
  createIdentityAddress,
  createRecoveryAddress,
  createSubAccountAddress,
  createKeyPair,
  createLegacyEncryptionKey,
  createAccountDeviceKey,
  createIdentityKeyPair,
  encryptionKeyPair,
  encryptionPublicKey,
  encryptionSecretKey,
  hasWorkingSeed,
  migrateKeys,
  resetKey,
  fixMissingHdWalletBubu,
  DEFAULT_LEVEL,
  addressFor,
  listSeedAddresses
} from '../keychain'
import naclutil from 'uPortMobile/lib/vendor/nacl-util'
import { RNUportSigner, RNUportHDSigner } from 'react-native-uport-signer'

const address = '0x7f2d6bb19b6a52698725f4a292e985c51cefc315'
const address2 = '0x7f2d6bb19b6a52698725f4a292e985c51cefc316'
const publicKey = '0x0403fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
const recoveryAddress = '0x7f2d6bb19b6a52698725f4a292e985c51cefc316'
const ENC_KEY_PAIR = {
  secret: 'Qgigj54O7CsQOhR5vLTfqSQyD3zmq/Gb8ukID7XvC3o=',
  public: 'oGZhZ0cvwgLKslgiPEQpBkRoE+CbWEdi738efvQBsH0='
}
const ENC_SECRET_KEY = 'Qgigj54O7CsQOhR5vLTfqSQyD3zmq/Gb8ukID7XvC3o='
const KP = {
  secretKey: naclutil.decodeBase64(ENC_KEY_PAIR.secret),
  publicKey: naclutil.decodeBase64(ENC_KEY_PAIR.public)
}

describe('autoPrompt', () => {
  it('simple does not prompt', () => {
    expect(autoPrompt('simple')).toBeFalsy()
  })
  it('cloud does not prompt', () => {
    expect(autoPrompt('cloud')).toBeFalsy()
  })
  it('null does not prompt', () => {
    expect(autoPrompt(null)).toBeFalsy()
  })
  it('undefined does not prompt', () => {
    expect(autoPrompt()).toBeFalsy()
  })
  it('singleprompt does prompt', () => {
    expect(autoPrompt('singleprompt')).toBeTruthy()
  })
  it('prompt does prompt', () => {
    expect(autoPrompt('prompt')).toBeTruthy()
  })
})

describe('createSeed()', () => {
  it('creates and stores a seed', () => {
    return expectSaga(createSeed)
    .provide([])
    .call(RNUportHDSigner.createSeed, DEFAULT_LEVEL)
    .put(storeRootAddress(address))
    .returns({
      hdindex: 0,
      address,
      publicKey
    })
    .run()
  })
})

describe('importSeed()', () => {
  const phrase = 'secret phrase'
  it('imports and stores a seed', () => {
    return expectSaga(importSeed, phrase)
    .provide([
      [select(hdRootAddress), undefined],
      [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), ENC_KEY_PAIR.public]
    ])
    .call(RNUportHDSigner.importSeed, phrase, DEFAULT_LEVEL)
    .put(storeRootAddress(address))
    .returns({
      deviceAddress: '0x7f2d6bb19b6a52698725f4a292e985c51cefc315',
      hdindex: 0,
      address: 'did:ethr:0x7f2d6bb19b6a52698725f4a292e985c51cefc315',
      publicKey: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479',
      publicEncKey: 'oGZhZ0cvwgLKslgiPEQpBkRoE+CbWEdi738efvQBsH0=',
      own: { name: 'uPort User' },
      securityLevel: 'simple',
      network: 'mainnet'
    })
    .run()
  })
})

describe('createIdentityAddress()', () => {
  describe('without existing seed', () => {
    it('creates new seed', () => {
      return expectSaga(createIdentityAddress)
      .provide([
        [select(hdRootAddress), undefined]
      ])
      // .put(incIdentityIndex())
      // .call(NativeModules.NativeSignerModule.addressForPath, rootAddress, `m/7696500'/1'/0'/0'`, 'Create new identity')
      .returns({
        hdindex: 0,
        address,
        publicKey
      })
      .run()
    })
  })
  describe('with existing seed', () => {
    const rootAddress = '0x0123456'
    it('extracts address', () => {
      return expectSaga(createIdentityAddress)
      .provide([
        [select(hdRootAddress), rootAddress],
        [select(lastIdentityIndex), 1]
      ])
      .put(incIdentityIndex())
      .call(RNUportHDSigner.addressForPath, rootAddress, `m/7696500'/1'/0'/0'`, 'Create new identity')
      .returns({
        hdindex: 1,
        address,
        publicKey
      })
      .run()
    })
  })
})

describe('createRecoveryAddress()', () => {
  const rootAddress = '0x0123456'
  it('extracts address with default account path', () => {
    return expectSaga(createRecoveryAddress, 0)
    .provide([
      [select(hdRootAddress), rootAddress],
      [call(RNUportHDSigner.addressForPath, rootAddress, `m/7696500'/0'/0'/1'`, 'Create new recovery account'), {address: recoveryAddress}]
    ])
    .call(RNUportHDSigner.addressForPath, rootAddress, `m/7696500'/0'/0'/1'`, 'Create new recovery account')
    .returns(recoveryAddress)
    .run()
  })

  it('extracts address with specific account path', () => {
    return expectSaga(createRecoveryAddress, 2, 3)
    .provide([
      [select(hdRootAddress), rootAddress],
      [call(RNUportHDSigner.addressForPath, rootAddress, `m/7696500'/2'/3'/1'`, 'Create new recovery account'), {address: recoveryAddress}]
    ])
    .call(RNUportHDSigner.addressForPath, rootAddress, `m/7696500'/2'/3'/1'`, 'Create new recovery account')
    .returns(recoveryAddress)
    .run()
  })
})

describe('createSubAccountAddress()', () => {
  describe('with existing rootAddress', () => {
    const rootAddress = '0x0123456'
    it('extracts address', () => {
      return expectSaga(createSubAccountAddress, 0)
      .provide([
        [select(hdRootAddress), rootAddress],
        [select(lastAccountIndex, 0), 2]
      ])
      .put(incAccountIndex(0))
      .call(RNUportHDSigner.addressForPath, rootAddress, `m/7696500'/0'/2'/0'`, 'Create new account')
      .returns({
        hdindex: 2,
        address,
        publicKey
      })
      .run()
    })
  })

  describe('with no existing rootAddress', () => {
    it('creates seed and extracts address', () => {
      return expectSaga(createSubAccountAddress, 0)
      .provide([
        [select(hdRootAddress), undefined],
        [select(lastAccountIndex, 0), 2]
      ])
      .put(incAccountIndex(0))
      .call(createSeed)
      .call(RNUportHDSigner.addressForPath, address, `m/7696500'/0'/2'/0'`, 'Create new account')
      .returns({
        hdindex: 2,
        address,
        publicKey
      })
      .run()
    })
  })
})

describe('createKeyPair()', () => {
  it('creates and stores key', () => {
    return expectSaga(createKeyPair)
    .provide([])
    .call(RNUportSigner.createKeyPair, DEFAULT_LEVEL)
    .returns({
      address,
      publicKey
    })
    .run()
  })
})

describe('createAccountDeviceKey()', () => {
  const rootAddress = '0x0123456'
  it('creates address using HD wallet', () => {
    return expectSaga(createAccountDeviceKey, rootAddress)
    .provide([
      [select(hdRootAddress), undefined],
      [select(hdIdentityIndex, rootAddress), 1],
      [select(lastAccountIndex, 1), 2]])
    .call(createSubAccountAddress, 1)
    .returns({
      hdindex: 2,
      address,
      publicKey
    })
    .run()
  })
})

describe('createIdentityKeyPair', () => {
  it('creates and stores key', () => {
    const identity = {
      address: `did:ethr:${address}`,
      deviceAddress: address,
      publicEncKey: ENC_KEY_PAIR.public,
      publicKey,
      hdindex: 0,
      own: {name: 'uPort User'},
      securityLevel: DEFAULT_LEVEL,
      network: 'mainnet'
    }
    return expectSaga(createIdentityKeyPair)
    .provide([
      [select(hdRootAddress), undefined],
      [call(encryptionPublicKey, { idIndex: 0, actIndex: 0 }), ENC_KEY_PAIR.public]
    ])
    .put(storeIdentity(identity))
    .returns(identity)
    .run()
  })

  describe('pass in idIndex', () => {
    it('creates and stores key', () => {
      const identity = {
        address: `did:ethr:${address}`,
        deviceAddress: address,
        publicEncKey: ENC_KEY_PAIR.public,
        publicKey,
        hdindex: 0,
        own: {name: 'uPort User'},
        securityLevel: DEFAULT_LEVEL,
        network: 'mainnet'
      }
      return expectSaga(createIdentityKeyPair, 1)
      .provide([
        [select(hdRootAddress), undefined],
        [call(encryptionPublicKey, { idIndex: 1, actIndex: 0 }), ENC_KEY_PAIR.public]
      ])
      .put(storeIdentity(identity))
      .returns(identity)
      .run()
    })  
  })

})

describe('encryptionKeyPair()', () => {
  describe('hdwallet has been setup', () => {
    it('Returns keypair', () => {
      return expectSaga(encryptionKeyPair, { idIndex: 1, actIndex: 2 })
        .provide([
          [select(hdRootAddress), address],
          [call(RNUportHDSigner.privateKeyForPath, address, `m/7696500'/1'/2'/2'`, 'Create new encryption key'), ENC_KEY_PAIR.secret]
        ])
        .call(RNUportHDSigner.privateKeyForPath, address, `m/7696500'/1'/2'/2'`, 'Create new encryption key')
        .returns(KP)
        .run()
    })
  })
  describe('legacy keys', () => {
    it('Returns keypair', () => {
      return expectSaga(encryptionKeyPair, { idIndex: 1, actIndex: null})
        .provide([
          [select(hdRootAddress), undefined],
          [select(currentAddress), address],
          [select(publicEncKey, address), ENC_KEY_PAIR.public],
          [matchers.call.fn(loadRawKey, ENC_KEY_PAIR.public), ENC_KEY_PAIR.secret]
        ])
        .returns(KP)
        .run()
    })
  })
})

describe('encryptionSecretKey()', () => {
  describe('account path values are set', () => {
    it('returns secret key', () => {
      return expectSaga(encryptionSecretKey, { idIndex: 1, actIndex: 2 })
        .provide([
          [select(hdRootAddress), address],
          [call(RNUportHDSigner.privateKeyForPath, address, `m/7696500'/1'/2'/3'`, 'Create new encryption key'), ENC_SECRET_KEY]
        ])
        .call(RNUportHDSigner.privateKeyForPath, address, `m/7696500'/1'/2'/3'`, 'Create new encryption key')
        .returns(naclutil.decodeBase64(ENC_SECRET_KEY))
        .run()
    })
  })
  describe('account path values are not yet set', () => {
    it('returns secret key', () => {
      return expectSaga(encryptionSecretKey, { idIndex: undefined, actIndex: undefined })
        .provide([
          [select(hdRootAddress), address],
          [call(RNUportHDSigner.privateKeyForPath, address, `m/7696500'/0'/0'/3'`, 'Create new encryption key'), ENC_SECRET_KEY]
        ])
        .call(RNUportHDSigner.privateKeyForPath, address, `m/7696500'/0'/0'/3'`, 'Create new encryption key')
        .returns(naclutil.decodeBase64(ENC_SECRET_KEY))
        .run()
    })
  })
})

describe('encryptionPublicKey()', () => {
  it('Returns base64 encoded public key', () => {
    return expectSaga(encryptionPublicKey, { idIndex: 1, actIndex: 2 })
      .provide([
        [select(hdRootAddress), address],
        [call(RNUportHDSigner.privateKeyForPath, address, `m/7696500'/1'/2'/2'`, 'Create new encryption key'), ENC_KEY_PAIR.secret]
      ])
      .call(RNUportHDSigner.privateKeyForPath, address, `m/7696500'/1'/2'/2'`, 'Create new encryption key')
      .returns(ENC_KEY_PAIR.public)
      .run()
  })
})

describe('canSignFor()', () => {
  const address = 'did:ethr:0x1235'
  const deviceAddress = '0x1234'
  describe('non HD account', () => {
    describe('is stored in keychain', () => {
      it('returns true', () => {
        return expectSaga(canSignFor, address)
          .provide([
            [select(networkSettingsForAddress, address), {deviceAddress}],
            [select(isHD, address), false],
            [call(RNUportSigner.allAddresses), [deviceAddress]]
          ])
          .returns(true)
          .run()
      })
    })

    describe('is not stored in keychain', () => {
      it('returns false', () => {
        return expectSaga(canSignFor, address)
          .provide([
            [select(networkSettingsForAddress, address), {deviceAddress}],
            [select(isHD, address), false],
            [call(RNUportSigner.allAddresses), []]
          ])
          .returns(false)
          .run()
      })
    })

    describe('HD account', () => {
      describe('is stored in keychain', () => {
        it('returns true', () => {
          return expectSaga(canSignFor, address)
            .provide([
              [select(networkSettingsForAddress, address), {address: deviceAddress, hdindex: 1}],
              [select(isHD, address), true],
              [select(hdIdentityIndex, address), 0],
              [select(hdAccountIndex, address), 1],
              [call(addressFor, 0, 1), {address: deviceAddress}]
            ])
            .returns(true)
            .run()
        })
      })

      describe('is not stored in keychain', () => {
        it('returns false', () => {
          return expectSaga(canSignFor, address)
            .provide([
              [select(networkSettingsForAddress, address), {address: deviceAddress, hdindex: 1}],
              [select(isHD, address), true],
              [select(hdIdentityIndex, address), 0],
              [select(hdAccountIndex, address), 1],
              [call(addressFor, 0, 1), {address: '0xfake'}]
            ])
            .returns(false)
            .run()
        })
      })
    })
  })

  describe('hasWorkingSeed()', () => {
    const root = '0xabcd'
    describe('no seed', () => {
      it('returns false', () => {
        return expectSaga(hasWorkingSeed)
          .provide([
            [select(hdRootAddress), undefined]
          ])
          .returns(false)
          .run()
      })
    })

    describe('has seed stored in hdreducer', () => {
      describe('that is not in keychain', () => {
        it('returns false', () => {
          return expectSaga(hasWorkingSeed)
            .provide([
              [select(hdRootAddress), root],
              [call(listSeedAddresses), []]
            ])
            .returns(false)
            .run()
        })
      })
      describe('that is not in keychain', () => {
        it('returns false', () => {
          return expectSaga(hasWorkingSeed)
            .provide([
              [select(hdRootAddress), root],
              [call(listSeedAddresses), [root]]
            ])
            .returns(true)
            .run()
        })
      })  
    })

  })
})
