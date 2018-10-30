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
import { throwError } from 'redux-saga-test-plan/providers'

jest.mock('uport-lite', () => {
  return () => {
    return (address, callback) => {
      if (address === 'fail') return callback(new Error('failure'))
      callback(undefined, {address})
    }
  }
})

import { takeEvery, cps, call, put, select, spawn, fork, all } from 'redux-saga/effects'
import { publicUportForAddress, ipfsProfile, sharableProfileForAddress } from 'uPortMobile/lib/selectors/identities'
import { web3ForAddress } from 'uPortMobile/lib/selectors/chains'
import { addClaims, saveIpfsProfile, updateActivity, storeExternalUport } from 'uPortMobile/lib/actions/uportActions'
import { addData } from 'uPortMobile/lib/actions/onboardingActions'
import { handleURL } from '../requests'
import { waitForTransactionReceipt } from '../blockchain'
import { signTransaction } from '../requests/transactionRequest'
import { startWorking, saveMessage, failProcess, completeProcess } from 'uPortMobile/lib/actions/processStatusActions'
import { saveShareToken } from 'uPortMobile/lib/actions/myInfoActions'
import { working } from 'uPortMobile/lib/selectors/processStatus'
import { connected } from '../networkState'
import { createToken } from '../jwt'

import { addImage, ipfsUrl, addJson } from 'uPortMobile/lib/utilities/ipfs'
import resolve, { registerMethod } from 'did-resolver'

// import { networks } from 'uPortMobile/lib/utilities/networks'

import { updateShareToken, savePublicUport, fetchPublicUport, refreshExternalUport, base58ToHex, setUportUrl, registry, savePublicUportToIPFS, addImageToIpfsOnboarding } from '../persona'

describe('fetchPublicUport', () => {
  const address = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
  const did = `did:uport:${address}`
  const profile = {
    '@context': 'https://w3id.org/did/v1',
    did,
    publicKey: [{
      id: `${did}#owner`,
      type: 'Secp256k1VerificationKey2018',
      owner: did,
      ethereumAddress: address
    }],
    authentication: [{
      type: 'Secp256k1SignatureAuthentication2018',
      publicKey: `${did}#owner`
    }]
  }
  describe('using did', () => {
    it('fetches without profile', () => {
      return expectSaga(fetchPublicUport, did)
        .provide([[call(resolve, did), profile]])
        .call(resolve, did)
        .returns(undefined)
        .run()
    })

    it('fetches with profile', () => {
      return expectSaga(fetchPublicUport, did)
        .provide([[call(resolve, did), {...profile, uportProfile: { name: 'Bob Smith' }}]])
        .call(resolve, did)
        .returns({ name: 'Bob Smith' })
        .run()
    })

    it('fetches and returns simple while translating images', () => {
      return expectSaga(fetchPublicUport, did)
        .provide([[call(resolve, did), {...profile, uportProfile: {name: 'Bob Smith', image: {contentUrl: '/me.jpg'}, banner: {contentUrl: '/banner.jpg'}}}]])
        .call(resolve, did)
        .returns({name: 'Bob Smith', avatar: {uri: 'https://ipfs.infura.io/me.jpg'}, banner: {uri: 'https://ipfs.infura.io/banner.jpg'}})
        .run()
    })
  
    it('handles no profile', () => {
      return expectSaga(fetchPublicUport, did)
        .provide([[call(resolve, did), undefined]])
        .call(resolve, did)
        .returns(undefined)
        .run()
    })
  
    it('handles error', () => {
      return expectSaga(fetchPublicUport, did)
        .provide([[call(resolve, did), throwError(new Error('Boom'))]])
        .call(resolve, did)
        .returns(undefined)
        .run()
    })
  })

  describe('using MNID', () => {
    it('fetches without profile', () => {
      return expectSaga(fetchPublicUport, address)
        .provide([[call(resolve, did), profile]])
        .call(resolve, did)
        .returns(undefined)
        .run()
    })

    it('fetches with profile', () => {
      return expectSaga(fetchPublicUport, address)
        .provide([[call(resolve, did), {...profile, uportProfile: { name: 'Bob Smith' }}]])
        .call(resolve, did)
        .returns({ name: 'Bob Smith' })
        .run()
    })

    it('fetches and returns simple while translating images', () => {
      return expectSaga(fetchPublicUport, address)
        .provide([[call(resolve, did), {...profile, uportProfile: {name: 'Bob Smith', image: {contentUrl: '/me.jpg'}, banner: {contentUrl: '/banner.jpg'}}}]])
        .call(resolve, did)
        .returns({name: 'Bob Smith', avatar: {uri: 'https://ipfs.infura.io/me.jpg'}, banner: {uri: 'https://ipfs.infura.io/banner.jpg'}})
        .run()
    })
  
    it('handles no profile', () => {
      return expectSaga(fetchPublicUport, address)
        .provide([[call(resolve, did), undefined]])
        .call(resolve, did)
        .returns(undefined)
        .run()
    })
  
    it('handles error', () => {
      return expectSaga(fetchPublicUport, address)
        .provide([[call(resolve, did), throwError(new Error('Boom'))]])
        .call(resolve, did)
        .returns(undefined)
        .run()
    })  
  })
})

describe('savePublicUportToIPFS', () => {
  const address = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
  it('successfull call', () => {
    const ipfsHash = 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y7o'
    const profile = {
      publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
      publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc'
    }
    return expectSaga(savePublicUportToIPFS, address)
      .provide([
        [call(connected), true],
        [select(publicUportForAddress, address), profile],
        [matchers.call.fn(addJson), ipfsHash]
      ])
      .put(saveMessage('persona', 'Sending public key to IPFS'))
      .run()
  })

  it('does not do anything if disconnected', () => {
    return expectSaga(savePublicUportToIPFS, address)
      .provide([
        [call(connected), false]
      ])
      .run()
  })
})

describe('savePublicUport', () => {
  const address = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
  const ipfsHash = 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y7o'
  const profile = {
    publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
    publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc'
  }
  const web3 = {name: 'web3'}
  const txhash = '0x012013TX'

  it('Does not start process second time', () => {
    return expectSaga(savePublicUport, {address})
      .provide([
        [select(working, 'persona'), true]
      ])
      .run()
  })

  it('fresh identity', () => {
    return expectSaga(savePublicUport, {address})
      .provide([
        [call(savePublicUportToIPFS, address), ipfsHash],
        [select(ipfsProfile, address), undefined],
        [call(handleURL, {url: setUportUrl(address, base58ToHex(ipfsHash)), postback: false, popup: false}), {id: 13123}],
        [call(signTransaction, {id: 13123}), {tx: txhash}],
        [select(web3ForAddress, address), web3],
        [call(waitForTransactionReceipt, web3, txhash), true],
        [select(working, 'persona'), false]
      ])
      .put(startWorking('persona'))
      .put(saveMessage('persona', 'Registering identity'))
      .put(saveMessage('persona', 'Registering profile on blockchain'))
      .call(handleURL, {url: setUportUrl(address, base58ToHex(ipfsHash)), postback: false, popup: false})
      .call(signTransaction, {id: 13123})
      .put(saveIpfsProfile(address, ipfsHash))
      .put(completeProcess('persona'))
      .run()
  })

  it('changed identity', () => {
    return expectSaga(savePublicUport, {address})
      .provide([
        [call(savePublicUportToIPFS, address), ipfsHash],
        [select(ipfsProfile, address), 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'],
        [call(handleURL, {url: setUportUrl(address, base58ToHex(ipfsHash)), postback: false, popup: false}), {id: 13123}],
        [call(signTransaction, {id: 13123}), {tx: txhash}],
        [select(web3ForAddress, address), web3],
        [call(waitForTransactionReceipt, web3, txhash), true],
        [select(working, 'persona'), false]
      ])
      .put(startWorking('persona'))
      .put(saveMessage('persona', 'Registering identity'))
      .put(saveMessage('persona', 'Registering profile on blockchain'))
      .call(handleURL, {url: setUportUrl(address, base58ToHex(ipfsHash)), postback: false, popup: false})
      .call(signTransaction, {id: 13123})
      .put(saveIpfsProfile(address, ipfsHash))
      .put(completeProcess('persona'))
      .run()
  })

  it('unchanged identity', () => {
    return expectSaga(savePublicUport, {address})
      .provide([
        [call(savePublicUportToIPFS, address), ipfsHash],
        [select(ipfsProfile, address), ipfsHash],
        [select(working, 'persona'), false]
      ])
      .put(startWorking('persona'))
      .put(saveMessage('persona', 'Registering identity'))
      .not.put(saveMessage('persona', 'Registering profile on blockchain'))
      .put(completeProcess('persona'))
      .run()
  })

  it('handles transaction mining error', () => {
    return expectSaga(savePublicUport, {address})
      .provide([
        [call(savePublicUportToIPFS, address), ipfsHash],
        [select(ipfsProfile, address), undefined],
        [call(handleURL, {url: setUportUrl(address, base58ToHex(ipfsHash)), postback: false, popup: false}), {id: 13123}],
        [call(signTransaction, {id: 13123}), {tx: txhash}],
        [select(web3ForAddress, address), web3],
        [call(waitForTransactionReceipt, web3, txhash), false],
        [select(working, 'persona'), false]
      ])
      .put(startWorking('persona'))
      .put(saveMessage('persona', 'Registering identity'))
      .call(handleURL, {url: setUportUrl(address, base58ToHex(ipfsHash)), postback: false, popup: false})
      .call(signTransaction, {id: 13123})
      .not.put(saveIpfsProfile(address, ipfsHash))
      .put(failProcess('persona', 'Identity registration transaction failed'))
      .run()
  })

  it('handles error during signing', () => {
    return expectSaga(savePublicUport, {address})
      .provide([
        [call(savePublicUportToIPFS, address), ipfsHash],
        [select(ipfsProfile, address), 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'],
        [call(handleURL, {url: setUportUrl(address, base58ToHex(ipfsHash)), postback: false, popup: false}), {id: 13123}],
        [call(signTransaction, {id: 13123}), throwError(new Error('Boom'))],
        [select(working, 'persona'), false]
      ])
      .put(startWorking('persona'))
      .put(saveMessage('persona', 'Registering identity'))
      .call(handleURL, {url: setUportUrl(address, base58ToHex(ipfsHash)), postback: false, popup: false})
      .not.put(saveIpfsProfile(address, ipfsHash))
      .put(failProcess('persona', 'Boom'))
      .run()
  })
})

describe('setUportUrl', () => {
  it('handles legacy uport address', () => {
    expect(setUportUrl('0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c', base58ToHex('QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'))).toEqual('me.uport:0xb9C1598e24650437a3055F7f66AC1820c419a679?function=setAttributes(bytes%200x1220df69b4a5bc0ddd8fa4c17d25e035b1c29816c4cab26cdff802a3f1880bbfdca4)&label=uPortRegistry')
  })

  it('handles rinkeby address', () => {
    expect(setUportUrl('2oVdmcz7BkWozm2JE4hHixRV8s5y3STqhPG', base58ToHex('QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'))).toEqual('me.uport:2oKVhUttUcwaFAopRBGA21NDJoYcBb3a6iz?function=set(bytes32%200x75506f727450726f66696c654950465331323230000000000000000000000000%2C%20address%200xb08e78b8e17dc2874818d7f49055abf08ee9977d%2C%20bytes32%200xdf69b4a5bc0ddd8fa4c17d25e035b1c29816c4cab26cdff802a3f1880bbfdca4)&label=uPortRegistry')
  })

  it('handles kovan address', () => {
    expect(setUportUrl('34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX', base58ToHex('QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'))).toEqual('me.uport:354S1QuCzkmKoQ3ADSLp1KtqAe8gZ74F9am?function=set(bytes32%200x75506f727450726f66696c654950465331323230000000000000000000000000%2C%20address%200x00521965e7bd230323c423d96c657db5b79d099f%2C%20bytes32%200xdf69b4a5bc0ddd8fa4c17d25e035b1c29816c4cab26cdff802a3f1880bbfdca4)&label=uPortRegistry')
  })

  it('rejects unsupported addres', () => {
    expect(() => setUportUrl('5A8bRWU3F7j3REx3vkJWxdjQPp4tqmxFPmab1Tr', base58ToHex('QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'))).toThrow(`unsupported address: 5A8bRWU3F7j3REx3vkJWxdjQPp4tqmxFPmab1Tr`)
  })
})

// describe('addImageToIpfs', () => {
//   const address = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
//   const image = {uri: '/some/file.jpg'}
//   const ipfsHash = 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'
//
//   it('stores image and saves it to own claims', () => {
//     return expectSaga(addImageToIpfs, {address, avatar: image, claimType: 'avatar'})
//       .provide([
//         [call(connected), true],
//         [call(addImage, image), ipfsHash]
//       ])
//       .call(addImage, image)
//       .put(addClaims(address, {avatar: {uri: 'https://ipfs.infura.io/ipfs/QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'}}))
//       .run()
//   })
//
//   it('does not store claims if saving fails', () => {
//     return expectSaga(addImageToIpfs, {address, image, claimType: 'avatar'})
//       .provide([
//         [call(connected), true],
//         [call(addImage, image), undefined]
//       ])
//       .call(addImage, image)
//       .not.put(addClaims(address, {avatar: {uri: 'https://ipfs.infura.io/ipfs/QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'}}))
//       .run()
//   })
//
//   it('do not upload if offline', () => {
//     return expectSaga(addImageToIpfs, {address, image, claimType: 'avatar'})
//       .provide([
//         [call(connected), false]
//       ])
//       .run()
//   })
// })

describe('addImageToIpfsOnboarding', () => {
  const address = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
  const image = {uri: '/some/file.jpg'}
  const ipfsHash = 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'

  it('stores image and saves it to own claims', () => {
    return expectSaga(addImageToIpfsOnboarding, {avatarObj: {avatar: image}})
      .provide([
        [call(connected), true],
        [call(addImage, image), ipfsHash]
      ])
      .call(addImage, image)
      .put(addData({avatar: {uri: 'https://ipfs.infura.io/ipfs/QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'}}))
      .run()
  })

  it('does not store data if saving fails', () => {
    return expectSaga(addImageToIpfsOnboarding, {avatarObj: {avatar: image}})
      .provide([
        [call(connected), true],
        [call(addImage, image), undefined]
      ])
      .call(addImage, image)
      .not.put(addData({avatar: {uri: 'https://ipfs.infura.io/ipfs/QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y8o'}}))
      .run()
  })

  it('do not upload if offline', () => {
    return expectSaga(addImageToIpfsOnboarding, {avatarObj: {avatar: image}})
      .provide([
        [call(connected), false]
      ])
      .run()
  })
})

describe('refreshExternalUport', () => {
  const address = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
  const profile = {
    publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
    publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc'
  }

  it('fetches and stores profile', () => {
    return expectSaga(refreshExternalUport, {clientId: address})
      .provide([
        [call(connected), true],
        [call(fetchPublicUport, address), profile]
      ])
      .call(fetchPublicUport, address)
      .put(storeExternalUport(address, profile))
      .run()
  })

  it('fetches non existant', () => {
    return expectSaga(refreshExternalUport, {clientId: address})
      .provide([
        [call(connected), true],
        [call(fetchPublicUport, address), undefined]
      ])
      .call(fetchPublicUport, address)
      .run()
  })

  it('does not do anything if not connected', () => {
    return expectSaga(refreshExternalUport, {clientId: address})
      .provide([
        [call(connected), false]
      ])
      .run()
  })
})

describe('updateShareToken()', () => {
  const address = '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'
  const profile = {
    name: 'Marcela'
  }
  const payload =  {
    type: 'shareResp',
    own: profile
  }
  const JWT = 'JWT'
  it('fetches and stores profile', () => {
    return expectSaga(updateShareToken, {address})
      .provide([
        [select(sharableProfileForAddress, address), profile],
        [call(createToken, address, payload), JWT]
      ])
      .call(createToken, address, payload)
      .put(saveShareToken(address, JWT))
      .run()
  })

})