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

import { select, call } from 'redux-saga/effects'
import { Credentials } from 'uport-credentials'
const publicKey = '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
jest.mock('react-native', () => {
  const privateKey =
    '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
  const SECP256K1Client = require('jsontokens').SECP256K1Client
  const signer = async data => {
    const hash = SECP256K1Client.createHash(Buffer.from(data, 'base64'))
    return SECP256K1Client.signHash(hash, Buffer.from(privateKey, 'hex'))
  }

  return {
    NativeModules: {
      NativeSignerModule: {
        signJwt: async (address, data, message) => {
          if (address !== '0x7f2d6bb19b6a52698725f4a292e985c51cefc315') { throw new Error('Unsupported address') }
          // console.log(`JWT signing payload: ${new Buffer(data, 'base64').toString()}`)
          return signer(data)
        }
      },
      NativeHDSignerModule: {
        signJwt: async (address, path, data, message) => {
          if (address !== '0x7f2d6bb19b6a52698725f4a292e985c51cefc315') { throw new Error('Unsupported address') }
          // console.log(`JWT signing payload: ${new Buffer(data, 'base64').toString()}`)
          return signer(data)
        }
      }
    }
  }
})

// import { JWT } from 'uport'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import {
  createToken,
  createShareResponseToken,
  credentialsFor,
  verifyToken,
  createShareRequestToken,
  createAttestationToken,
  createPututuAuthToken,
  normalizeRecoveryParam
} from '../jwt'
import { decodeJWT } from 'did-jwt'
import { TokenVerifier } from 'jsontokens'
import registerResolver from 'uport-did-resolver'
import MockDate from 'mockdate'
const NOW = 1485321133
MockDate.set(NOW * 1000)

const address = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
const did = `did:uport:${address}`

const credentials = new Credentials({ privateKey, did })

const verifier = new TokenVerifier('ES256K', publicKey)
const didDoc = {
  '@context': 'https://w3id.org/did/v1',
  id: did,
  publicKey: [
    {
      id: `${did}#keys-1`,
      type: 'Secp256k1VerificationKey2018',
      owner: did,
      publicKeyHex: publicKey
    }
  ],
  authentication: [
    {
      type: 'Secp256k1SignatureAuthentication2018',
      publicKey: `${did}#keys-1`
    }
  ]
}

registerResolver((id, cb) => {
  if (address === id) cb(null, didDoc)
})

describe('createToken', () => {
  it('sign jwt', () => {
    return expectSaga(createToken, address, {claims: {name: 'Bob'}}, { prompt: 'sign attestation', issuer: address })
      .provide([
        [call(credentialsFor, address, 'sign attestation', { issuer: address }), credentials]
      ])
      .returns('eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE0ODUzMjExMzMsImV4cCI6MTQ4NTQwNzUzMywiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiaXNzIjoiZGlkOnVwb3J0OjM0d2pzeHd2ZHVhbm83TkZDOHVqTkpuRmpiYWNnWWVXQThtIn0.QwgeiPOmQpqiAZMsY7KJPR6Je3olygRKaYbZ9g2zfTa-6a_mxAa6RUfzzIbdUCdMI8A6rYykrvZ1SQEr1XKrCA')
      .run()
      .then(result => expect(verifier.verify(result.returnValue)).toBeTruthy())
  })
  
  it('sign jwt without prompt', () => {
    return expectSaga(createToken, address, {claims: {name: 'Bob'}}, { issuer: address })
      .provide([
        [call(credentialsFor, address, undefined, { issuer: address }), credentials]
      ])
      .returns('eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE0ODUzMjExMzMsImV4cCI6MTQ4NTQwNzUzMywiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiaXNzIjoiZGlkOnVwb3J0OjM0d2pzeHd2ZHVhbm83TkZDOHVqTkpuRmpiYWNnWWVXQThtIn0.QwgeiPOmQpqiAZMsY7KJPR6Je3olygRKaYbZ9g2zfTa-6a_mxAa6RUfzzIbdUCdMI8A6rYykrvZ1SQEr1XKrCA')
      .run()
      .then(result => expect(verifier.verify(result.returnValue)).toBeTruthy())
  })

  it('passes in expiration', () => {
    return expectSaga(createToken, address, {claims: {name: 'Bob'}}, { prompt: 'sign attestation', expiresIn: 86400, issuer: address })
      .provide([
        [call(credentialsFor, address, 'sign attestation', { issuer: address }), credentials]
      ])
      .run()
      .then(result => expect(decodeJWT(result.returnValue).payload.exp).toEqual(NOW + 86400))
  })

  it('override exp', () => {
    const EXP = 2485321133
    return expectSaga(createToken, address, {claims: {name: 'Bob'}, exp: EXP}, { prompt: 'sign attestation', issuer: address})
      .provide([
        [call(credentialsFor, address, 'sign attestation', { issuer: address }), credentials]
      ])
      .run()
      .then(result => expect(decodeJWT(result.returnValue).payload.exp).toEqual(EXP))
  })

  it('uses correct issuer', () => {
    return expectSaga(createToken, address, {claims: {name: 'Bob'}}, {prompt: 'sign attestation', issuer: did})
      .provide([
        [call(credentialsFor, address, 'sign attestation', { issuer: did }), credentials]
      ])
      .run()
      .then(result => expect(decodeJWT(result.returnValue).payload.iss).toEqual(did))
  })
})

describe('createShareRequestToken', () => {
  it('signs jwt', () => {
    return expectSaga(createShareRequestToken, address, { requested: ['name'] })
      .provide([
        [call(credentialsFor, address), credentials]
      ])
      .call([credentials, credentials.createDisclosureRequest], {requested: [ 'name' ]})
      .run()
      .then(result => expect(verifier.verify(result.returnValue)).toBeTruthy())
  })

  it('creates correct payload', () => {
    return expectSaga(createShareRequestToken, address, {requested: ['name']})
    .provide([
      [call(credentialsFor, address), credentials]
    ])
    .call([credentials, credentials.createDisclosureRequest], {requested: [ 'name' ]})
    .run()
    .then(result => expect(decodeJWT(result.returnValue)).toMatchSnapshot())
  })
})

describe('createShareResponseToken', () => {
  it('signs jwt', () => {
    return expectSaga(createShareResponseToken, address, {own: { name: 'Bob' }})
      .provide([
        [call(credentialsFor, address), credentials]
      ])
      .call([credentials, credentials.createDisclosureResponse], {own: { name: 'Bob' }})
      .run()
      .then(result => expect(verifier.verify(result.returnValue)).toBeTruthy())
  })

  it('creates correct payload', () => {
    return expectSaga(createShareResponseToken, address, {own: { name: 'Bob' }})
    .provide([
      [call(credentialsFor, address), credentials]
    ])
    .call([credentials, credentials.createDisclosureResponse], {own: { name: 'Bob' }})
    .run()
    .then(result => expect(decodeJWT(result.returnValue)).toMatchSnapshot())
  })
})


describe('createAttestationToken', () => {
  const subject = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
  it('sign jwt', () => {
    return expectSaga(createAttestationToken, address, subject, {
      name: 'Filderbert'
    })
      .provide([
        [call(credentialsFor, address), credentials]
      ])
      .call([credentials, credentials.createVerification], {
        sub: subject,
        claim: { name: 'Filderbert' }
      })
      .run()
      .then(result => expect(verifier.verify(result.returnValue)).toBeTruthy())
  })

  it('creates correct payload', () => {
    return expectSaga(createAttestationToken, address, subject, {
      name: 'Filderbert'
    })
      .provide([
        [call(credentialsFor, address), credentials]
      ])
      .call([credentials, credentials.createVerification], {
        sub: subject,
        claim: { name: 'Filderbert' }
      })
      .run()
      .then(result => expect(decodeJWT(result.returnValue)).toMatchSnapshot())
  })
})

describe('createPututuAuthToken', () => {
  it('sign jwt', () => {
    return expectSaga(createPututuAuthToken, address)
      .provide([
        [call(credentialsFor, address, 'Look for messages?', { issuer: address }), credentials]
      ])
      .call(
        createToken,
        address,
        { type: 'user-auth' },
        { prompt: 'Look for messages?', issuer: address }
      )
      .run()
      .then(result => expect(verifier.verify(result.returnValue)).toBeTruthy())
  })

  it('creates correct payload', () => {
    return expectSaga(createPututuAuthToken, address)
      .provide([
        [call(credentialsFor, address, 'Look for messages?', { issuer: address }), credentials]
      ])
      .call(
        createToken,
        address,
        { type: 'user-auth' },
        { prompt: 'Look for messages?', issuer: address }
      )
      .run()
      .then(result => expect(decodeJWT(result.returnValue)).toMatchSnapshot())
  })
})

describe('verifyToken', () => {
  it('verifies jwt', () => {
    return expectSaga(
      verifyToken,
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIzNHdqc3h3dmR1YW5vN05GQzh1ak5KbkZqYmFjZ1llV0E4bSIsImlhdCI6MTQ4NTMyMTEzMywiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiZXhwIjoxNDg1NDA3NTMzfQ.sg1oJ7J_f2pWaX2JwqzA61oWMUK5v0LYVxUp3PvG7Y25CVYWPyQ6UhA7U9d4w3Ny74k7ryMaUz7En5RSL4pyXg'
    )
      .provide([[select(currentAddress), address]])
      .returns({
        payload: {
          iss: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
          iat: 1485321133,
          claims: { name: 'Bob' },
          exp: 1485407533
        },
        doc: {
          '@context': 'https://w3id.org/did/v1',
          id: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
          publicKey: [
            {
              id: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m#keys-1',
              type: 'Secp256k1VerificationKey2018',
              owner: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
              publicKeyHex: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
            }
          ],
          authentication: [
            {
              type: 'Secp256k1SignatureAuthentication2018',
              publicKey: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m#keys-1'
            }
          ]
        },
        issuer: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
        signer: {
          id: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m#keys-1',
          type: 'Secp256k1VerificationKey2018',
          owner: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
          publicKeyHex: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
        },
        jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIzNHdqc3h3dmR1YW5vN05GQzh1ak5KbkZqYmFjZ1llV0E4bSIsImlhdCI6MTQ4NTMyMTEzMywiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiZXhwIjoxNDg1NDA3NTMzfQ.sg1oJ7J_f2pWaX2JwqzA61oWMUK5v0LYVxUp3PvG7Y25CVYWPyQ6UhA7U9d4w3Ny74k7ryMaUz7En5RSL4pyXg'
      })
      .run({ silenceTimeout: true })
  })
})

describe('normalizeRecoveryParam', () => {
  describe('valid values', () => {
    [0, 1].forEach(v => {
      describe(`v=${v}`, () => {
        it(`returns itself`, () => {
          expect(normalizeRecoveryParam(v)).toEqual(v)
        })
      })
    })
  })
  describe('ethereum range', () => {
    [27, 28].forEach(v => {
      describe(`v=${v}`, () => {
        it(`subtracts 27`, () => {
          expect(normalizeRecoveryParam(v)).toEqual(v-27)
        })
      })
    })
  })

  describe('invalid', () => {
    [-27, -28, -2, -1, 2, 3, 26, 29, 100001].forEach(v => {
      describe(`v=${v}`, () => {
        it(`raises error`, () => {
          expect(() => normalizeRecoveryParam(v)).toThrow(`Signing library returned invalid recovery param '${v}'`)
        })
      })
    })
  })


})