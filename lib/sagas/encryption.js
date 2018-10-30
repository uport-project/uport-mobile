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
import { encryptionKeyPair, encryptionSecretKey } from './keychain'
import { randomBytes } from 'uPortMobile/lib/helpers/random_bytes'
import { all, call, select, cps } from 'redux-saga/effects'
import nacl from 'uPortMobile/lib/vendor/nacl-fast'
import naclutil from 'uPortMobile/lib/vendor/nacl-util'
import { hdAccountIndex } from '../selectors/hdWallet'

const BLOCK_SIZE = 64
export const ASYNC_ENC_ALGORITHM = 'x25519-xsalsa20-poly1305'

export function pad (message) {
  return message.padEnd(Math.ceil(message.length / BLOCK_SIZE) * BLOCK_SIZE, '\0')
}

export function unpad (padded) {
  return padded.replace(/\0+$/, '')
}

export function * encryptMessage (message, boxPub) {
  const secret = yield cps(randomBytes, 32)
  const { publicKey, secretKey } = nacl.box.keyPair.fromSecretKey(naclutil.decodeBase64(secret.toString('base64')))
  const nonce = yield cps(randomBytes, 24)
  const padded = pad(message)
  const ciphertext = nacl.box(naclutil.decodeUTF8(padded), naclutil.decodeBase64(nonce.toString('base64')), naclutil.decodeBase64(boxPub), secretKey)
  return {
    version: ASYNC_ENC_ALGORITHM,
    nonce: naclutil.encodeBase64(nonce),
    ephemPublicKey: naclutil.encodeBase64(publicKey),
    ciphertext: naclutil.encodeBase64(ciphertext)
  }
}

export function * decryptMessage ({ciphertext, nonce, ephemPublicKey}, address) {
  // TODO lookup idIndex and actIndex based on passed in address
  const accountIndex = yield select(hdAccountIndex, address)
  const kp = yield call(encryptionKeyPair, { idIndex: 0, actIndex: accountIndex })
  const decrypted = nacl.box.open(
    naclutil.decodeBase64(ciphertext),
    naclutil.decodeBase64(nonce),
    naclutil.decodeBase64(ephemPublicKey),
    kp.secretKey)
  return unpad(naclutil.encodeUTF8(decrypted))
}

export function * decryptLegacy ({from, nonce, ciphertext}, address) {
  // TODO lookup idIndex and actIndex based on passed in address
  const accountIndex = yield select(hdAccountIndex, address)
  const kp = yield call(encryptionKeyPair, { idIndex: 0, actIndex: accountIndex })
  const decodedFrom = naclutil.decodeBase64(from)
  const decodedNonce = naclutil.decodeBase64(nonce)
  const decodedCiphertext = naclutil.decodeBase64(ciphertext)
  const decrypted = nacl.box.open(decodedCiphertext, decodedNonce, decodedFrom, kp.secretKey)

  return naclutil.encodeUTF8(decrypted)
}

export function * encryptEvent (event, address) {
  const accountIndex = yield select(hdAccountIndex, address)
  const secret = yield call(encryptionSecretKey, { idIndex: 0, actIndex: accountIndex })
  const nonce = yield cps(randomBytes, 24)
  const payload = naclutil.decodeUTF8(JSON.stringify(event))
  const ciphertext = nacl.secretbox(payload, nonce, secret)
  return `${naclutil.encodeBase64(ciphertext)}.${naclutil.encodeBase64(nonce)}`
}

export function * decryptEvent (encrypted, address) {
  const accountIndex = yield select(hdAccountIndex, address)
  const secret = yield call(encryptionSecretKey, { idIndex: 0, actIndex: accountIndex })
  const parts = encrypted.split('.')
  const decodedCiphertext = naclutil.decodeBase64(parts[0])
  const decodedNonce = naclutil.decodeBase64(parts[1])
  const decrypted = nacl.secretbox.open(decodedCiphertext, decodedNonce, secret)
  const event = JSON.parse(naclutil.encodeUTF8(decrypted))
  return event
}

function * encryptionSaga () {
  yield all([
  ])
}

export default encryptionSaga
