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
import { call, select, put, spawn } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { Platform } from 'react-native'
import txReq from '../transactionRequest'
import contactsReq from '../connectionRequest'
import shareReq from '../disclosureRequest'
import attReq from '../addAttestations'
import { encryptMessage } from '../../encryption'
import { verifyToken } from '../../jwt'
import {
  handleURL,
  authorize,
  authorizeAndCallback,
  messageHandler,
  findRequestType,
  generateActivityId,
  performCallback,
  postBackToServer,
  handleClearRequest,
  handleSelectActivity,
  returnToApp,
  selectAccount,
} from '../index.js'
import { CLEAR_REQUEST } from 'uPortMobile/lib/constants/RequestActionTypes'
import { currentAddress, selectedIdentity } from 'uPortMobile/lib/selectors/identities'
import { currentRequestId, fetchRequest } from 'uPortMobile/lib/selectors/requests'
import { openExternalUrl } from 'uPortMobile/lib/helpers/url_handler'
import { storeActivity, updateActivity, openActivity } from 'uPortMobile/lib/actions/uportActions'
import { saveRequest } from 'uPortMobile/lib/actions/requestActions'
import { saveError, clearMessage } from 'uPortMobile/lib/actions/processStatusActions'
import { updateBadgeCount } from 'uPortMobile/lib/actions/snsRegistrationActions'

global.fetch = jest.fn(() => undefined)

jest.mock('react-native-intent-launcher', () => {
  return {
    startActivity: () => {},
    IntentConstant: {
      ACTION_VIEW: 'ACTION_VIEW',
    },
  }
})
import IntentLauncher, { IntentConstant } from 'react-native-intent-launcher'

import URL from 'url-parse'

jest.mock('react-native-navigation', () => {
  return {
    Navigation: {
      showModal: data => undefined,
      dismissModal: () => undefined,
      dismissAllModals: () => undefined,
    },
  }
})

import { Navigation } from 'react-native-navigation'

describe('#findRequestType()', () => {
  function parseAndFindRequestType(url) {
    return findRequestType(URL(url, true))
  }

  describe('ethereum urls', () => {
    ;['ethereum:0x60b3774c4161a59b35cda8043670aadf71cc2aed'].forEach(url => {
      it(url, () => {
        expect(parseAndFindRequestType(url)).toEqual('sign')
      })
    })
  })

  describe('uport urls', () => {
    ;['me.uport:', 'https://id.uport.me/'].forEach(protocol => {
      describe('unified request', () => {
        ;['req'].forEach(path => {
          const url = `${protocol}${path}`
          // console.log(url)
          it(url, () => {
            expect(parseAndFindRequestType(url)).toEqual('unified')
          })
        })
      })

      describe('add attestations', () => {
        ;['add'].forEach(path => {
          const url = `${protocol}${path}`
          // console.log(url)
          it(url, () => {
            expect(parseAndFindRequestType(url)).toEqual('attestation')
          })
        })
      })

      describe('selective disclosure', () => {
        ;['me'].forEach(path => {
          const url = `${protocol}${path}`
          // console.log(url)
          it(url, () => {
            expect(parseAndFindRequestType(url)).toEqual('disclosure')
          })
        })
      })

      describe('Ethereum or MNID addresses', () => {
        ;['0x60b3774c4161a59b35cda8043670aadf71cc2aed', '2oZqgNx3pzzaT5V6xctreExLz21jVYrh9ef'].forEach(address => {
          describe('add contact', () => {
            const url = `${protocol}${address}`
            it(url, () => {
              expect(parseAndFindRequestType(url)).toEqual('connect')
            })
          })

          describe('signing request', () => {
            ;['value=1', 'bytecode=0x0102', 'function=hello()'].forEach(qs => {
              const url = `${protocol}${address}?${qs}`
              it(url, () => {
                expect(parseAndFindRequestType(url)).toEqual('sign')
              })
            })
          })
        })
      })

      describe('deploy contract', () => {
        ;['deploy'].forEach(path => {
          const url = `${protocol}${path}`
          // console.log(url)
          it(url, () => {
            expect(parseAndFindRequestType(url)).toEqual('sign')
          })
        })
      })
    })
  })
})

describe('messageHandler', () => {
  const jwt = 'JWT'
  const id = '1e089e14b7251c583c0ab03ddde2f58fbb0a08ad5a479386ee339c2ec497349e'
  const doc = {
    '@context': 'https://w3id.org/did/v1',
    id: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
    publicKey: [
      {
        id: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m#keys-1',
        type: 'Secp256k1VerificationKey2018',
        owner: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
        publicKeyHex: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479',
      },
    ],
    authentication: [
      {
        type: 'Secp256k1SignatureAuthentication2018',
        publicKey: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m#keys-1',
      },
    ],
  }
  describe('shareReq', () => {
    it('calls disclosureRequest handler', () => {
      const payload = { type: 'shareReq' }
      const request = { requested: ['name'], req: jwt }
      return expectSaga(messageHandler, { message: jwt })
        .provide([[call(verifyToken, jwt), { payload, doc }], [call(shareReq.handle, payload, jwt, id), request]])
        .call(shareReq.handle, payload, jwt, id)
        .put(storeActivity({ ...request, type: 'disclosure', id }))
        .run()
    })

    describe('with boxPub', () => {
      it('sets boxPub on response', () => {
        const boxPub = 'pub'
        const payload = { type: 'shareReq', boxPub }
        const request = { requested: ['name'], req: jwt }
        return expectSaga(messageHandler, { message: jwt })
          .provide([[call(verifyToken, jwt), { payload, doc }], [call(shareReq.handle, payload, jwt, id), request]])
          .call(shareReq.handle, payload, jwt, id)
          .put(storeActivity({ ...request, boxPub, type: 'disclosure', id }))
          .run()
      })
    })

    describe('with encryption key in DID Doc', () => {
      const boxPub = 'pub'
      const doc = {
        '@context': 'https://w3id.org/did/v1',
        id: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
        publicKey: [
          {
            id: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m#keys-1',
            type: 'Secp256k1VerificationKey2018',
            owner: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
            publicKeyHex: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479',
          },
          {
            id: 'did:uport:2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX#keys-2',
            type: 'Curve25519EncryptionPublicKey',
            owner: 'did:uport:2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX',
            publicKeyBase64: boxPub,
          },
        ],
        authentication: [
          {
            type: 'Secp256k1SignatureAuthentication2018',
            publicKey: 'did:uport:34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m#keys-1',
          },
        ],
      }
      it('sets boxPub on response', () => {
        const payload = { type: 'shareReq' }
        const request = { requested: ['name'], req: jwt }
        return (
          expectSaga(messageHandler, { message: jwt })
            .provide([[call(verifyToken, jwt), { payload, doc }], [call(shareReq.handle, payload, jwt, id), request]])
            .call(shareReq.handle, payload, jwt, id)
            // TODO if we add this back, make sure to add boxPub below
            .put(storeActivity({ ...request, type: 'disclosure', id }))
            .run()
        )
      })
    })
  })

  describe('shareResp', () => {
    it('calls connnections handler', () => {
      const payload = { type: 'shareResp' }
      const request = { requested: ['name'], req: jwt }
      return expectSaga(messageHandler, { message: jwt })
        .provide([[call(verifyToken, jwt), { payload, doc }], [call(contactsReq.handle, payload, jwt, id), request]])
        .call(contactsReq.handle, payload, jwt, id)
        .put(storeActivity({ ...request, type: 'connect', id }))
        .run()
    })
  })

  describe('ethtx', () => {
    it('calls network settings handler', () => {
      const payload = { type: 'ethtx' }
      const request = {}
      return expectSaga(messageHandler, { message: jwt })
        .provide([[call(verifyToken, jwt), { payload, doc }], [call(txReq.handle, payload, jwt, id), request]])
        .call(txReq.handle, payload, jwt, id)
        .put(storeActivity({ ...request, type: 'sign', id }))
        .run()
    })
  })

  describe('attestation', () => {
    it('calls network settings handler', () => {
      const payload = { claims: { name: 'bob' } }
      const request = { client: '0x123', claims: { name: 'bob' } }
      return expectSaga(messageHandler, { message: jwt })
        .provide([[call(verifyToken, jwt), { payload, doc }], [call(attReq.handle, payload, jwt, id), request]])
        .call(attReq.handle, payload, jwt, id)
        .put(storeActivity({ ...request, type: 'attestation', id }))
        .run()
    })
  })

  describe('error handling', () => {
    it('stores the error', () => {
      return expectSaga(messageHandler, { message: jwt })
        .provide([[call(verifyToken, jwt), throwError(new Error('Could not verify signature of request'))]])
        .put(saveError('handleMessage', 'Could not verify signature of request'))
        .run()
    })
  })
})

describe('handleURL()', () => {
  describe('unified', () => {
    describe('with JWT', () => {
      it('forwards JWT on to messageHandler', () => {
        const jwt =
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIzNHdqc3h3dmR1YW5vN05GQzh1ak5KbkZqYmFjZ1llV0E4bSIsImlhdCI6MTQ4NTMyMTEzMywiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiZXhwIjoxNDg1NDA3NTMzfQ.sg1oJ7J_f2pWaX2JwqzA61oWMUK5v0LYVxUp3PvG7Y25CVYWPyQ6UhA7U9d4w3Ny74k7ryMaUz7En5RSL4pyXg'
        const url = `https://id.uport.me/req/${jwt}?callback_type=callback`
        const payload = { claim: { name: 'bob' } }
        return expectSaga(handleURL, { url })
          .provide([
            [
              call(messageHandler, {
                message: jwt,
                target: undefined,
                popup: undefined,
                redirectUrl: undefined,
                postback: undefined,
              }),
              'ok',
            ],
          ])
          .put(clearMessage('handleUrl'))
          .call(messageHandler, {
            message: jwt,
            target: undefined,
            popup: undefined,
            redirectUrl: undefined,
            postback: undefined,
          })
          .returns('ok')
          .run()
      })
    })
    describe('with broken JWT', () => {
      it('creates error message', () => {
        const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ'
        const url = `https://id.uport.me/req/${jwt}`
        return expectSaga(handleURL, { url })
          .put(clearMessage('handleUrl'))
          .put(saveError('handleUrl', `Invalid request url ${url}`))
          .not.call(messageHandler, { message: jwt, target: undefined, popup: undefined })
          .returns(undefined)
          .run()
      })
    })
  })

  describe('legacy', () => {
    describe('transaction request', () => {
      it('background', () => {
        const url = 'me.uport:2oZqgNx3pzzaT5V6xctreExLz21jVYrh9ef?value=123&callback_url=https://demo.uport.me'
        const parsed = URL(url, true)
        const request = {
          id: '123131',
          postback: undefined,
          type: 'sign',
          opened: undefined,
          callback_url: 'https://demo.uport.me',
          target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
          legacyPush: undefined,
          // network: '0x3'
        }
        return expectSaga(handleURL, { url })
          .provide([
            [call(generateActivityId), '123131'],
            [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
            [call(txReq.handleLegacy, request, parsed), 'ok'], // it doesn't actually return ok but I'm testing that the value is passed back
          ])
          .put(clearMessage('handleUrl'))
          .put(updateBadgeCount())
          .put(storeActivity(request))
          .call(txReq.handleLegacy, request, parsed)
          .returns('ok')
          .run()
      })

      describe('callback_type', () => {
        it('post becomes postback=true', () => {
          const url =
            'me.uport:2oZqgNx3pzzaT5V6xctreExLz21jVYrh9ef?value=123&callback_url=https://demo.uport.me&callback_type=post'
          const parsed = URL(url, true)
          const request = {
            id: '123131',
            postback: true,
            type: 'sign',
            opened: undefined,
            callback_url: 'https://demo.uport.me',
            target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
            legacyPush: undefined,
            // network: '0x3'
          }

          return expectSaga(handleURL, { url })
            .provide([
              [call(generateActivityId), '123131'],
              [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
              [matchers.call.fn(txReq.handleLegacy, request, parsed), 'ok'], // it doesn't actually return ok but I'm testing that the value is passed back
            ])
            .put(clearMessage('handleUrl'))
            .put(updateBadgeCount())
            .put(storeActivity(request))
            .call(txReq.handleLegacy, request, parsed)
            .returns('ok')
            .run()
        })

        it('redirect becomes postback=false', () => {
          const url =
            'me.uport:2oZqgNx3pzzaT5V6xctreExLz21jVYrh9ef?value=123&callback_url=https://demo.uport.me&callback_type=redirect'
          const parsed = URL(url, true)
          const request = {
            id: '123131',
            postback: false,
            type: 'sign',
            opened: undefined,
            callback_url: 'https://demo.uport.me',
            target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
            legacyPush: undefined,
            // network: '0x3'
          }

          return expectSaga(handleURL, { url })
            .provide([
              [call(generateActivityId), '123131'],
              [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
              [matchers.call.fn(txReq.handleLegacy, request, parsed), 'ok'], // it doesn't actually return ok but I'm testing that the value is passed back
            ])
            .put(clearMessage('handleUrl'))
            .put(updateBadgeCount())
            .put(storeActivity(request))
            .call(txReq.handleLegacy, request, parsed)
            .returns('ok')
            .run()
        })
      })

      it('popup', () => {
        const url = 'me.uport:2oZqgNx3pzzaT5V6xctreExLz21jVYrh9ef?value=123&callback_url=https://demo.uport.me'
        const parsed = URL(url, true)
        const request = {
          id: '123131',
          postback: undefined,
          type: 'sign',
          opened: true,
          callback_url: 'https://demo.uport.me',
          target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
          legacyPush: undefined,
          // network: '0x3'
        }

        return expectSaga(handleURL, { url, popup: true })
          .provide([
            [call(generateActivityId), '123131'],
            [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
            [call(handleClearRequest), null],
            [matchers.call.fn(txReq.handleLegacy, request, parsed), 'ok'], // it doesn't actually return ok but I'm testing that the value is passed back
          ])
          .put(clearMessage('handleUrl'))
          .put(updateBadgeCount())
          .put(storeActivity(request))
          .call(txReq.handleLegacy, request, parsed)
          .returns('ok')
          .run()
      })
    })

    describe('selective disclosure', () => {
      it('background', () => {
        const url = 'me.uport:me?callback_url=https://demo.uport.me'
        const parsed = URL(url, true)
        const request = {
          id: '123131',
          postback: undefined,
          type: 'disclosure',
          opened: undefined,
          callback_url: 'https://demo.uport.me',
          target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
          legacyPush: undefined,
          // network: '0x3'
        }

        return expectSaga(handleURL, { url })
          .provide([
            [call(generateActivityId), '123131'],
            [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
            [matchers.call.fn(shareReq.handleLegacy, request, parsed), 'ok'], // it doesn't actually return ok but I'm testing that the value is passed back
          ])
          .put(clearMessage('handleUrl'))
          .put(updateBadgeCount())
          .put(storeActivity(request))
          .call(shareReq.handleLegacy, request, parsed)
          .returns('ok')
          .run()
      })

      it('popup', () => {
        const url = 'me.uport:me?callback_url=https://demo.uport.me'
        const parsed = URL(url, true)
        const request = {
          id: '123131',
          postback: undefined,
          type: 'disclosure',
          opened: true,
          callback_url: 'https://demo.uport.me',
          target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
          legacyPush: undefined,
          // network: '0x3'
        }

        return expectSaga(handleURL, { url, popup: true })
          .provide([
            [call(generateActivityId), '123131'],
            [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
            [call(handleClearRequest), null],
            [matchers.call.fn(shareReq.handleLegacy, request, parsed), 'ok'], // it doesn't actually return ok but I'm testing that the value is passed back
          ])
          .put(clearMessage('handleUrl'))
          .put(updateBadgeCount())
          .put(storeActivity(request))
          .call(shareReq.handleLegacy, request, parsed)
          .returns('ok')
          .run()
      })
    })

    describe('add attestations', () => {
      describe('with callback_url', () => {
        const url = 'me.uport:add?attestations=JWT&callback_url=https://demo.uport.me'
        const parsed = URL(url, true)
        describe('postback', () => {
          it('background', () => {
            const request = {
              id: '123131',
              postback: true,
              type: 'attestation',
              opened: undefined,
              callback_url: 'https://demo.uport.me',
              target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
              legacyPush: undefined,
              // network: '0x3'
            }

            return expectSaga(handleURL, { url, postback: true })
              .provide([
                [call(generateActivityId), '123131'],
                [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
                [matchers.call.fn(attReq.handleLegacy, request, parsed), { status: 'ok' }],
                [spawn(performCallback, request, { status: 'ok' }), undefined],
              ])
              .put(clearMessage('handleUrl'))
              .put(updateBadgeCount())
              .put(storeActivity(request))
              .call(attReq.handleLegacy, request, parsed)
              .spawn(performCallback, request, { status: 'ok' })
              .returns({ status: 'ok' })
              .run()
          })

          it('popup', () => {
            const request = {
              id: '123131',
              postback: true,
              type: 'attestation',
              opened: true,
              callback_url: 'https://demo.uport.me',
              target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
              legacyPush: undefined,
              // network: '0x3'
            }

            return expectSaga(handleURL, { url, popup: true, postback: true })
              .provide([
                [call(generateActivityId), '123131'],
                [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
                [call(handleClearRequest), null],
                [matchers.call.fn(attReq.handleLegacy, request, parsed), { status: 'ok' }],
                [spawn(performCallback, request, { status: 'ok' }), undefined],
              ])
              .put(clearMessage('handleUrl'))
              .put(updateBadgeCount())
              .put(storeActivity(request))
              .call(attReq.handleLegacy, request, parsed)
              .spawn(performCallback, request, { status: 'ok' })
              .returns({ status: 'ok' })
              .run()
          })
        })

        describe('applink', () => {
          it('popup', () => {
            const request = {
              id: '123131',
              postback: undefined,
              type: 'attestation',
              opened: true,
              callback_url: 'https://demo.uport.me',
              target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
              legacyPush: undefined,
              // network: '0x3'
            }

            return expectSaga(handleURL, { url, popup: true })
              .provide([
                [call(generateActivityId), '123131'],
                [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
                [call(handleClearRequest), null],
                [matchers.call.fn(attReq.handleLegacy, request, parsed), { status: 'ok' }],
              ])
              .put(clearMessage('handleUrl'))
              .put(updateBadgeCount())
              .put(storeActivity(request))
              .call(attReq.handleLegacy, request, parsed)
              .returns({ status: 'ok' })
              .run()
          })
        })
      })

      describe('without callback_url', () => {
        const url = 'me.uport:add?attestations=JWT'
        const parsed = URL(url, true)
        it('background', () => {
          const request = {
            id: '123131',
            postback: undefined,
            type: 'attestation',
            opened: undefined,
            target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
            legacyPush: undefined,
            // network: '0x3'
          }

          return expectSaga(handleURL, { url })
            .provide([
              [call(generateActivityId), '123131'],
              [select(currentAddress), '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'],
              [matchers.call.fn(attReq.handleLegacy, request, parsed), { status: 'ok' }],
            ])
            .put(clearMessage('handleUrl'))
            .put(updateBadgeCount())
            .put(storeActivity(request))
            .call(attReq.handleLegacy, request, parsed)
            .returns({ status: 'ok' })
            .run()
        })
      })
    })
  })
})

describe('authorize()', () => {
  const activityId = '123131'
  const regulars = ['sign', 'disclosure', 'net', 'connect', 'info']
  regulars.map(requestType => {
    const request = {
      id: activityId,
      postback: undefined,
      type: requestType,
      opened: true,
      callback_url: 'https://demo.uport.me',
      target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
      legacyPush: undefined,
      // network: '0x3'
    }
    describe(requestType, () => {
      it('spawns authorizeAndCallback', () => {
        return expectSaga(authorize, { activityId })
          .provide([[select(fetchRequest, activityId), request], [spawn(authorizeAndCallback, request)]])
          .spawn(authorizeAndCallback, request)
          .put(updateBadgeCount())
          .run()
      })
    })
  })

  describe('attestation', () => {
    describe('with callback and no postback', () => {
      const request = {
        id: activityId,
        postback: undefined,
        type: 'attestation',
        opened: true,
        callback_url: 'https://demo.uport.me',
        target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
        legacyPush: undefined,
        // network: '0x3'
      }
      it('does not spawn authorizeAndCallback', () => {
        return expectSaga(authorize, { activityId })
          .provide([[select(fetchRequest, activityId), request], [spawn(authorizeAndCallback, request)]])
          .not.spawn(authorizeAndCallback, request)
          .put({ type: CLEAR_REQUEST })
          .spawn(performCallback, request, { status: 'ok' })
          .put(updateBadgeCount())
          .run()
      })
    })

    describe('with callback and postback', () => {
      const request = {
        id: activityId,
        postback: true,
        type: 'attestation',
        opened: true,
        callback_url: 'https://demo.uport.me',
        target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
        legacyPush: undefined,
        // network: '0x3'
      }
      it('does not spawn authorizeAndCallback', () => {
        return expectSaga(authorize, { activityId })
          .provide([[select(fetchRequest, activityId), request], [spawn(authorizeAndCallback, request)]])
          .not.spawn(authorizeAndCallback, request)
          .put({ type: CLEAR_REQUEST })
          .not.spawn(performCallback, request, { status: 'ok' })
          .put(updateBadgeCount())
          .run()
      })
    })

    describe('without callback', () => {
      const request = {
        id: activityId,
        type: 'attestation',
        opened: true,
        target: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m',
        legacyPush: undefined,
        // network: '0x3'
      }
      it('does not spawn authorizeAndCallback', () => {
        return expectSaga(authorize, { activityId })
          .provide([[select(fetchRequest, activityId), request], [spawn(authorizeAndCallback, request)]])
          .not.spawn(authorizeAndCallback, request)
          .put({ type: CLEAR_REQUEST })
          .not.spawn(performCallback, request, { status: 'ok' })
          .put(updateBadgeCount())
          .run()
      })
    })
  })
})

describe('authorizeAndCallback()', () => {
  const response = { hey: 1 }
  const callback_url = 'https://demo.uport.me'

  describe('sign', () => {
    describe('without callback', () => {
      it('keeps request open', () => {
        const request = { type: 'sign' }
        return expectSaga(authorizeAndCallback, request)
          .provide([[call(txReq.authorize, request), response]])
          .call(txReq.authorize, request)
          .not.put({ type: CLEAR_REQUEST })
          .not.spawn(performCallback, request, response)
          .run()
      })
    })

    describe('with callback', () => {
      it('performs callback', () => {
        const request = { type: 'sign', callback_url }
        return expectSaga(authorizeAndCallback, request)
          .provide([[call(txReq.authorize, request), response]])
          .call(txReq.authorize, request)
          .not.put({ type: CLEAR_REQUEST })
          .spawn(performCallback, request, response)
          .run()
      })
    })
  })

  describe('disclosure', () => {
    describe('without callback', () => {
      it('clears request', () => {
        const request = { type: 'disclosure' }
        return expectSaga(authorizeAndCallback, request)
          .provide([[call(shareReq.authorize, request), response]])
          .call(shareReq.authorize, request)
          .put({ type: CLEAR_REQUEST })
          .not.spawn(performCallback, request, response)
          .run()
      })
    })

    describe('with callback', () => {
      it('performs callback', () => {
        const request = { type: 'disclosure', callback_url }
        return expectSaga(authorizeAndCallback, request)
          .provide([[call(shareReq.authorize, request), response]])
          .call(shareReq.authorize, request)
          .put({ type: CLEAR_REQUEST })
          .spawn(performCallback, request, response)
          .run()
      })
    })
  })
})

describe('returnToApp', () => {
  const httpsRedirectUrl = URL('https://mydapp.com/hello?mysite=hello')
  const appRedirectUrl = URL('app.agreed.stream:hello?mysite=hello')

  describe('ios', () => {
    it('returns to https url', () => {
      Platform.OS = 'ios'
      return expectSaga(returnToApp, URL('https://mydapp.com/hello?mysite=hello'), { status: 'ok' })
        .provide([[call(openExternalUrl, 'https://mydapp.com/hello?mysite=hello#status=ok'), undefined]])
        .call(openExternalUrl, 'https://mydapp.com/hello?mysite=hello#status=ok')
        .run()
    })

    it('returns to app url', () => {
      Platform.OS = 'ios'
      return expectSaga(returnToApp, URL('app.agreed.stream:hello?mysite=hello'), { status: 'ok' })
        .provide([[call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello#status=ok'), undefined]])
        .call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello#status=ok')
        .run()
    })
  })

  describe('android', () => {
    it('returns to https url', () => {
      Platform.OS = 'android'
      return expectSaga(returnToApp, URL('https://mydapp.com/hello?mysite=hello'), { status: 'ok' })
        .provide([
          [
            call(IntentLauncher.startActivity, {
              action: IntentConstant.ACTION_VIEW,
              data: 'https://mydapp.com/hello?mysite=hello#status=ok',
              extra: { 'com.android.browser.application_id': 'com.android.chrome' },
            }),
            undefined,
          ],
        ])
        .call(IntentLauncher.startActivity, {
          action: IntentConstant.ACTION_VIEW,
          data: 'https://mydapp.com/hello?mysite=hello#status=ok',
          extra: { 'com.android.browser.application_id': 'com.android.chrome' },
        })
        .run()
    })

    it('returns to app url', () => {
      Platform.OS = 'android'
      return expectSaga(returnToApp, URL('app.agreed.stream:hello?mysite=hello'), { status: 'ok' })
        .provide([[call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello#status=ok'), undefined]])
        .call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello#status=ok')
        .run()
    })
  })

  describe('handling responses', () => {
    it('appends response to redirect_url if defined', () => {
      Platform.OS = 'ios'
      return expectSaga(returnToApp, URL('app.agreed.stream:hello?mysite=hello'), { status: 'ok' })
        .provide([[call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello#status=ok'), undefined]])
        .call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello#status=ok')
        .run()
    })
    it('does NOT append response to redirect_url if undefined', () => {
      Platform.OS = 'ios'
      return expectSaga(returnToApp, URL('app.agreed.stream:hello?mysite=hello'), undefined)
        .provide([[call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello'), undefined]])
        .call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello')
        .run()
    })
    it('does NOT overwrite redirect_url fragments', () => {
      Platform.OS = 'ios'
      return expectSaga(returnToApp, URL('app.agreed.stream:hello?mysite=hello#mood=happy'), { status: 'ok' })
        .provide([[call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello#mood=happy&status=ok'), undefined]])
        .call(openExternalUrl, 'app.agreed.stream:hello?mysite=hello#mood=happy&status=ok')
        .run()
    })
  })
})

describe('performCallback', () => {
  const response = { status: 'ok' }

  describe('postback set', () => {
    it('performs postback', () => {
      const request = { postback: true, callback_url: 'https://mydapp.com/hello?mysite=hello' }
      return expectSaga(performCallback, request, response)
        .provide([[call(postBackToServer, request, response), undefined]])
        .call(postBackToServer, request, response)
        .run()
    })

    it('performs postback & redirects if redirect_url set', () => {
      const request = {
        postback: true,
        redirect_url: 'app.agreed.stream:hello?mysite=hello',
        callback_url: 'https://mydapp.com/hello?mysite=hello',
      }
      return expectSaga(performCallback, request, response)
        .provide([
          [call(postBackToServer, request, response), undefined],
          [call(returnToApp, URL(request.redirect_url), undefined), undefined],
        ])
        .call(postBackToServer, request, response)
        .call(returnToApp, URL(request.redirect_url), undefined)
        .run()
    })
  })

  describe('postback not set', () => {
    it('defaults to postback & redirect if postback is undefined', () => {
      const request = {
        redirect_url: 'app.agreed.stream:hello?mysite=hello',
        callback_url: 'https://mydapp.com/hello?mysite=hello',
      }
      return expectSaga(performCallback, request, response)
        .provide([
          [call(postBackToServer, request, response), undefined],
          [call(returnToApp, URL(request.redirect_url), undefined), undefined],
        ])
        .call(postBackToServer, request, response)
        .call(returnToApp, URL(request.redirect_url), undefined)
        .run()
    })
  })

  describe('postback and redirect_url not set', () => {
    it('performs returnToApp', () => {
      const request = { postback: undefined, callback_url: 'https://mydapp.com/hello?mysite=hello' }
      return expectSaga(performCallback, request, response)
        .provide([[call(postBackToServer, request, response), undefined]])
        .call(postBackToServer, request, response)
        .run()
    })
  })

  describe('known postbacks', () => {
    ;[
      'https://chasqui.uport.me/api/v1/topic/123123',
      'https://chasqui.uport.space/api/v1/topic/123123',
      'https://api.uport.me/ethereal/v1/callback/',
      'https://api.uport.space/ethereal/v1/callback/',
    ].forEach(callback_url => {
      it(`performs postback for ${callback_url}`, () => {
        const request = { postback: undefined, callback_url }
        return expectSaga(performCallback, request, response)
          .provide([[call(postBackToServer, request, response), undefined]])
          .call(postBackToServer, request, response)
          .run()
      })
    })
  })
})

describe('postBackToServer', () => {
  const response = { status: 'ok' }
  const httpResponse = 'RESPONSE'
  describe('encrypted', () => {
    it('performs postback', () => {
      const boxPub = 'oGZhZ0cvwgLKslgiPEQpBkRoE+CbWEdi738efvQBsH0='
      const request = { callback_url: 'https://mydapp.com/hello?mysite=hello', boxPub }
      const payload = JSON.stringify(response)
      const encrypted = 'ENCRYPTED'
      const body = JSON.stringify({ encrypted })
      return expectSaga(postBackToServer, request, response)
        .provide([
          [call(encryptMessage, payload, boxPub), encrypted],
          [
            call(fetch, request.callback_url, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body,
            }),
            httpResponse,
          ],
        ])
        .call(fetch, request.callback_url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body,
        })
        .run()
    })
  })

  describe('unencrypted', () => {
    it('performs postback', () => {
      const request = { callback_url: 'https://mydapp.com/hello?mysite=hello' }
      const body = JSON.stringify(response)
      return expectSaga(postBackToServer, request, response)
        .provide([
          [
            call(fetch, request.callback_url, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body,
            }),
            httpResponse,
          ],
        ])
        .call(fetch, request.callback_url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body,
        })
        .run()
    })
  })
})

describe('handleSelectActivity', () => {
  it('existing request', () => {
    const activityId = 123131

    return expectSaga(handleSelectActivity, { activityId })
      .provide([[select(currentRequestId), activityId]])
      .not.put(saveRequest(activityId))
      .returns(undefined)
      .run()
  })

  it('unopened request', () => {
    const activityId = 123131
    return (
      expectSaga(handleSelectActivity, { activityId })
        .provide([
          [select(currentRequestId), undefined],
          [select(fetchRequest, activityId), { network: '0x2a' }],
          [call(handleClearRequest), undefined],
          // [
          //   call(Navigation.showModal, {
          //     component: {},
          //   }),
          //   undefined,
          // ],
        ])
        .call(handleClearRequest)
        .put(saveRequest(activityId))
        // .call(Navigation.showModal, {
        //   component: {},
        // })
        .put(openActivity(activityId))
        .put(updateBadgeCount())
        .returns(undefined)
        .run()
    )
  })

  it('opened request', () => {
    const activityId = 123131
    return (
      expectSaga(handleSelectActivity, { activityId })
        .provide([
          [select(currentRequestId), undefined],
          [select(fetchRequest, activityId), { network: '0x2a', opened: true }],
          [call(handleClearRequest), undefined],
          // [
          //   call(Navigation.showModal, {
          //     component: {},
          //   }),
          //   undefined,
          // ],
        ])
        .call(handleClearRequest)
        .put(saveRequest(activityId))
        // .call(Navigation.showModal, {
        //   component: {},
        // })
        .not.put(openActivity(activityId))
        .put(updateBadgeCount())
        .returns(undefined)
        .run()
    )
  })
})

describe('handleClearActivity', () => {
  it('clears correctly', () => {
    return (
      expectSaga(handleClearRequest)
        .put(updateBadgeCount())
        .returns(undefined)
        // .call(Navigation.dismissModal)
        .run()
    )
  })
})

describe('selectAccount', () => {
  const activityId = 123
  const account = '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'
  describe('matches request network', () => {
    describe('account is sub account', () => {
      it('changes account and sets target to parent', () => {
        const parent = '0xparent1'
        return expectSaga(selectAccount, { activityId, account })
          .provide([
            [select(fetchRequest, activityId), { network: '0x2a' }],
            [select(selectedIdentity, account), { address: account, parent }],
          ])
          .put(updateActivity(activityId, { account, target: parent }))
          .run()
      })
    })

    describe('account is identity', () => {
      it('changes account and sets itself as target', () => {
        return expectSaga(selectAccount, { activityId, account })
          .provide([
            [select(fetchRequest, activityId), { network: '0x2a' }],
            [select(selectedIdentity, account), { address: account }],
          ])
          .put(updateActivity(activityId, { account, target: account }))
          .run()
      })
    })

    describe('account does not exist', () => {
      it('does not change account', () => {
        return expectSaga(selectAccount, { activityId, account })
          .provide([
            [select(fetchRequest, activityId), { network: '0x2a' }],
            [select(selectedIdentity, account), undefined],
          ])
          .not.put(updateActivity(activityId, { account }))
          .run()
      })
    })
  })

  it('does not change account if it doesn not match the supported network', () => {
    return expectSaga(selectAccount, { activityId, account })
      .provide([[select(fetchRequest, activityId), { network: '0x4' }]])
      .not.put(updateActivity(activityId, { account }))
      .run()
  })
})
