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
import { call, select, cps } from 'redux-saga/effects'
// import * as matchers from 'redux-saga-test-plan/matchers'
import { randomBytes } from 'uPortMobile/lib/helpers/random_bytes'
import { encryptionKeyPair, encryptionSecretKey } from '../keychain'
import { pad, unpad, encryptMessage, decryptMessage, decryptLegacy, encryptEvent, decryptEvent } from '../encryption'
import { hdAccountIndex } from 'uPortMobile/lib/selectors/hdWallet'
import naclutil from 'uPortMobile/lib/vendor/nacl-util'

const boxPub = 'oGZhZ0cvwgLKslgiPEQpBkRoE+CbWEdi738efvQBsH0='
const KEY_PAIR = {
  secret: 'Qgigj54O7CsQOhR5vLTfqSQyD3zmq/Gb8ukID7XvC3o=',
  public: boxPub
}
const KP = {
  secretKey: naclutil.decodeBase64(KEY_PAIR.secret),
  publicKey: naclutil.decodeBase64(KEY_PAIR.public)
}
const message = 'hello'
const VALID_ENCRYPTED_PAYLOAD = {
  ciphertext: 'xdP3d9e9sQhTB4FP/Omf3N68GRSb5u/vHlkhFUTcj+58UjQ6aBJc/DLjG3ArNS/UPpO+XnKB/Dc8tXram6Xc6OD5Qpnyfn/txoqPudc0XkM=',
  ephemPublicKey: 'oGZhZ0cvwgLKslgiPEQpBkRoE+CbWEdi738efvQBsH0=',
  nonce: '/20Dn2PowBiZu5kw42pO7F/wiKvkecM3',
  version: 'x25519-xsalsa20-poly1305'
}
const VALID_ENCRYPTED_LEGACY_PAYLOAD = {
  from: 'tDdA9XmkctFyPw4+gAKtm7gPskKWbo83Alze7ppuRAI=',
  nonce: 'AZfmFULe2dx7iqIbzOEeAM3Tb05/MCCZ',
  ciphertext: 'f9l0AQWAfsld5394ZVg9CTUYcRp0MDPpUAGMv0P0CxnxYEA='
}
const addr = '0x1234'

describe('pad', () => {
  it('pads correctly', () => {
    expect(pad('')).toEqual('')
    expect(pad('hello')).toEqual('hello\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000')
    expect(pad(pad('hello'))).toEqual(pad('hello'))
    expect(pad('hello+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')).toEqual('hello+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    expect(pad('hello+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++!')).toEqual('hello+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++!\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000')
  })
})

describe('unpad', () => {
  it('unpads correctly', () => {
    expect(unpad('')).toEqual('')
    expect(unpad(pad('hello'))).toEqual('hello')
    expect(unpad('hello+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')).toEqual('hello+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    expect(unpad(pad('hello+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++!'))).toEqual('hello+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++!')
  })
})

describe('encryptMessage', () => {
  it('encrypts message correctly', () => {
    return expectSaga(encryptMessage, message, boxPub)
      .provide([
        [cps(randomBytes, 32), Buffer.from('Qgigj54O7CsQOhR5vLTfqSQyD3zmq/Gb8ukID7XvC3o=', 'base64')],
        [cps(randomBytes, 24), Buffer.from('/20Dn2PowBiZu5kw42pO7F/wiKvkecM3', 'base64')]
      ])
      .run()
      .then(result => expect(result.returnValue).toEqual(VALID_ENCRYPTED_PAYLOAD))
  })
})

describe('decryptMessage', () => {
  it('decrypts message correctly', () => {
    return expectSaga(decryptMessage, VALID_ENCRYPTED_PAYLOAD, addr)
      .provide([
        [select(hdAccountIndex, addr), null],
        [call(encryptionKeyPair, { idIndex: 0, actIndex: null }), KP]
      ])
      .returns(message)
      .run()
  })
})

describe('decryptLegacy', () => {
  it('decrypts message correctly', () => {
    return expectSaga(decryptLegacy, VALID_ENCRYPTED_LEGACY_PAYLOAD, addr)
      .provide([
        [select(hdAccountIndex, addr), null],
        [call(encryptionKeyPair, { idIndex: 0, actIndex: null }), KP]
      ])
      .returns('very secret message')
      .run()
  })
})

describe('encryptEvent', () => {
  it('encrypt events correctly', () => {
    return expectSaga(encryptEvent, {type: 'HELLO'}, addr)
      .provide([
        [select(hdAccountIndex, addr), null],
        [call(encryptionSecretKey, { idIndex: 0, actIndex: null }), KP.secretKey],
        [cps(randomBytes, 24), naclutil.decodeBase64('O1dv2W1OY9LBMmZQ04kWqjGXKTUd9Rsc')]
      ])
      .returns('gQFHS8XS6YE9Xz3ud9f0poHmkkT3x6z5adsjg2kXlbs=.O1dv2W1OY9LBMmZQ04kWqjGXKTUd9Rsc')
      .run()
  })
})

describe('decryptEvent', () => {
  it('encrypt events correctly', () => {
    return expectSaga(decryptEvent, 'gQFHS8XS6YE9Xz3ud9f0poHmkkT3x6z5adsjg2kXlbs=.O1dv2W1OY9LBMmZQ04kWqjGXKTUd9Rsc', addr)
      .provide([
        [select(hdAccountIndex, addr), null],
        [call(encryptionSecretKey, { idIndex: 0, actIndex: null }), KP.secretKey]
      ])
      .returns({type: 'HELLO'})
      .run()
  })
})
