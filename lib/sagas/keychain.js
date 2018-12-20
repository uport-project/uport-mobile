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
import { call, cps, select, put, takeEvery, all } from 'redux-saga/effects'
import {
  hdRootAddress, lastIdentityIndex, lastAccountIndex, hdIdentityIndex
} from 'uPortMobile/lib/selectors/hdWallet'
import { storeIdentity } from 'uPortMobile/lib/actions/uportActions'
import {
  saveError
} from 'uPortMobile/lib/actions/processStatusActions'
import { storeRootAddress, incIdentityIndex, incAccountIndex } from 'uPortMobile/lib/actions/HDWalletActions'
import { NativeModules } from 'react-native'
import { set, isSubset } from 'mori'
import nacl from 'uPortMobile/lib/vendor/nacl-fast'
import naclutil from 'uPortMobile/lib/vendor/nacl-util'

import EthSigner from 'eth-signer/dist/eth-signer.js'
import { randomBytes } from '../helpers/random_bytes'
import { currentIdentity } from '../selectors/identities';
const Random = EthSigner.generators.Random
const KeyPair = EthSigner.generators.KeyPair
// import bip39 from 'uPortMobile/lib/browserified/bip39'

// import { defaultNetwork } from 'uPortMobile/lib/utilities/networks'

Random.setProvider(randomBytes)

// ANDROID OPTIONS
//
// `singleprompt` - Prompt is only asked once per session or period of time
// `prompt`       - Prompt every time
// `simple`       - Not hardware protected but you don't loose your key if you change pin
// `cloud`        - Backed up in some cloud storage

export const DEFAULT_LEVEL = 'simple'

export function autoPrompt (level = DEFAULT_LEVEL) {
  level = level || DEFAULT_LEVEL
  return !!level.match(/prompt/)
}

export function * resetKey (key, hd) {
  //yield call(Keychain.resetGenericPassword, key)
  if (hd) {
    yield call(NativeModules.NativeHDSignerModule.deleteSeed, key)
  } else {
    yield call(NativeModules.NativeHDSignerModule.deleteKey, key)
  }
}

export function * createSeed () {
  const {address, pubKey} = yield call(NativeModules.NativeHDSignerModule.createSeed, DEFAULT_LEVEL)
  const publicKeyHex = Buffer.from(pubKey, 'base64').toString('hex')
  yield put(storeRootAddress(address))
  return {hdindex: 0, address, publicKey: `0x${publicKeyHex.slice(0, 2) === '04' ? publicKeyHex : `04${publicKeyHex}`}`}
}

export function * selectOrCreateSeed () {
  const root = yield select(hdRootAddress)
  if (root) return root
  const kp = yield call(createSeed)
  // console.log(kp)
  return kp.address
}

export function * importSeed (phrase) {
  const {address, pubKey} = yield call(NativeModules.NativeHDSignerModule.importSeed, phrase, DEFAULT_LEVEL)
  const publicKey = Buffer.from(pubKey, 'base64').toString('hex')
  yield put(storeRootAddress(address))
  const publicEncKey = yield call(encryptionPublicKey, {idIndex: 0, actIndex: 0})
  return {
    deviceAddress: address,
    hdindex: 0,
    address: `did:ethr:${address}`,
    publicEncKey,
    publicKey,
    own: {name: 'uPort User'},
    securityLevel: DEFAULT_LEVEL,
    network: 'mainnet'
  }
}

export function * addressFor (hdindex = 0, acctIndex = 0) {
  const root = yield select(hdRootAddress)
  const {address, pubKey} = yield call(NativeModules.NativeHDSignerModule.addressForPath, root, `m/7696500'/${hdindex}'/${acctIndex}'/0'`, 'Create new identity')
  const publicKeyHex = Buffer.from(pubKey, 'base64').toString('hex')
  return {address, publicKey: `0x${publicKeyHex.slice(0, 2) === '04' ? publicKeyHex : `04${publicKeyHex}`}`}
}

export function * createIdentityAddress () {
  const root = yield select(hdRootAddress)
  if (!root) return yield createSeed()
  yield put(incIdentityIndex())
  const hdindex = yield select(lastIdentityIndex)
  const {address, pubKey} = yield call(NativeModules.NativeHDSignerModule.addressForPath, root, `m/7696500'/${hdindex}'/0'/0'`, 'Create new identity')
  const publicKeyHex = Buffer.from(pubKey, 'base64').toString('hex')
  return {hdindex, address, publicKey: `0x${publicKeyHex.slice(0, 2) === '04' ? publicKeyHex : `04${publicKeyHex}`}`}
}

export function * createSubAccountAddress (idIndex) {
  const root = yield call(selectOrCreateSeed)
  yield put(incAccountIndex(idIndex || 0))
  const hdindex = yield select(lastAccountIndex, idIndex || 0)
  const {address, pubKey} = yield call(NativeModules.NativeHDSignerModule.addressForPath, root, `m/7696500'/${idIndex || 0}'/${hdindex || 1}'/0'`, 'Create new account')
  const publicKeyHex = Buffer.from(pubKey, 'base64').toString('hex')
  return {hdindex, address, publicKey: `0x${publicKeyHex.slice(0, 2) === '04' ? publicKeyHex : `04${publicKeyHex}`}`}
}

export function * createRecoveryAddress (idIndex, acctIndex = 0) {
  const root = yield select(hdRootAddress)
  const {address} = yield call(NativeModules.NativeHDSignerModule.addressForPath, root, `m/7696500'/${idIndex || 0}'/${acctIndex}'/1'`, 'Create new recovery account')
  return address
}

export function * createKeyPair () {
  const {address, pubKey} = yield call(NativeModules.NativeSignerModule.createKeyPair, DEFAULT_LEVEL)
  const publicKeyHex = Buffer.from(pubKey, 'base64').toString('hex')
  return {address, publicKey: `0x${publicKeyHex.slice(0, 2) === '04' ? publicKeyHex : `04${publicKeyHex}`}`}
}

export function * createAccountDeviceKey (idAddress) {
  const idindex = yield select(hdIdentityIndex, idAddress)
  return yield call(createSubAccountAddress, idindex)
}

export function * encryptionKeyPair ({idIndex, actIndex}) {
  let rawKey
  const root = yield select(hdRootAddress)
  rawKey = yield call(NativeModules.NativeHDSignerModule.privateKeyForPath, root, `m/7696500'/${idIndex}'/${actIndex || 0}'/2'`, 'Create new encryption key')
  return nacl.box.keyPair.fromSecretKey(naclutil.decodeBase64(rawKey))
}

export function * encryptionSecretKey ({idIndex, actIndex}) {
  const root = yield call(selectOrCreateSeed)
  const rawKey = yield call(NativeModules.NativeHDSignerModule.privateKeyForPath, root, `m/7696500'/${idIndex || 0}'/${actIndex || 0}'/3'`, 'Create new encryption key')
  return naclutil.decodeBase64(rawKey)
}

export function * encryptionPublicKey ({idIndex, actIndex}) {
  const kp = yield call(encryptionKeyPair, {idIndex, actIndex})
  return naclutil.encodeBase64(kp.publicKey)
}

export function * createIdentityKeyPair () {
  try {
    const kp = yield call(createIdentityAddress)
    const recoveryAddress = yield call(createRecoveryAddress, kp.hdindex)
    const publicEncKey = yield call(encryptionPublicKey, {idIndex: kp.hdindex, actIndex: 0})
    const identity = {
      deviceAddress: kp.address,
      hdindex: kp.hdindex,
      address: `did:ethr:${kp.address}`,
      publicKey: kp.publicKey,
      publicEncKey,
      recoveryAddress,
      own: {name: 'uPort User'},
      securityLevel: DEFAULT_LEVEL,
      network: 'mainnet'
    }
    yield put(storeIdentity(identity))
    return identity
  } catch (e) {
    console.log(e)
    yield put(saveError('keychain', 'Error creating Device Key'))
  }
}

function * keychainSaga () {

}

export async function listSeedAddresses () {
  if (NativeModules.NativeHDSignerModule.listSeedAddresses) {
    return NativeModules.NativeHDSignerModule.listSeedAddresses()
  } else return []
}

export default keychainSaga
