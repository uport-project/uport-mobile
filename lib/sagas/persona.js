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
import { takeEvery, cps, call, put, select, fork, all } from 'redux-saga/effects'
import { publicUportForAddress, ipfsProfile, sharableProfileForAddress } from 'uPortMobile/lib/selectors/identities'
import { web3ForAddress } from 'uPortMobile/lib/selectors/chains'
import { working } from 'uPortMobile/lib/selectors/processStatus'
import { SAVE_PUBLIC_UPORT, REFRESH_EXTERNAL_UPORT, ADD_IMAGE, ADD_IMAGE_ONBOARDING } from 'uPortMobile/lib/constants/UportActionTypes'
import {
  UPDATE_SHARE_TOKEN
} from 'uPortMobile/lib/constants/MyInfoActionTypes'

import { addClaims, saveIpfsProfile, storeExternalUport } from 'uPortMobile/lib/actions/uportActions'
import { addData } from 'uPortMobile/lib/actions/onboardingActions'
import { saveShareToken } from 'uPortMobile/lib/actions/myInfoActions'
import { handleURL } from './requests'
import { analyzeAddress, waitForTransactionReceipt } from './blockchain'
import { createToken } from './jwt'
import { sendQueuedEvents } from './hubSaga'
import { signTransaction } from './requests/transactionRequest'
import { startWorking, saveMessage, failProcess, completeProcess } from 'uPortMobile/lib/actions/processStatusActions'
import { connected } from './networkState'
import { addImage, ipfsUrl, addJson } from '../utilities/ipfs'
import { networks } from 'uPortMobile/lib/utilities/networks'
import resolve from 'did-resolver'
import base58 from 'bs58'
import { Buffer } from 'buffer'
const MNID = require('mnid')

// import { whenConnected } from './network_state'
// import { cacheOrFetch } from '../utilities/cache'

export function base58ToHex (b58) {
  var hexBuf = Buffer.from(base58.decode(b58))
  return '0x' + hexBuf.toString('hex')
}

export function hexToBase58 (hex) {
  return base58.encode(Buffer.from(hex.slice(2), 'hex'))
};

function asciiToHex (string, delim) {
  return Buffer.from(string).toString('hex')
}

function pad (pad, str, padLeft) {
  if (typeof str === 'undefined') {
    return pad
  }
  if (padLeft) {
    return (pad + str).slice(-pad.length)
  } else {
    return (str + pad).substring(0, pad.length)
  }
}

function encodeFunctionCall (functionSignature, registrationIdentifier, issuer, subject) {
  var callString = functionSignature
  callString += pad('0000000000000000000000000000000000000000000000000000000000000000', asciiToHex(registrationIdentifier))
  callString += pad('0000000000000000000000000000000000000000000000000000000000000000', issuer.slice(2), true)
  callString += pad('0000000000000000000000000000000000000000000000000000000000000000', subject.slice(2), true)
  return callString
}

const functionSignature = '0x447885f0'

export function callRegistry (subjectId, issuerId, registrationIdentifier = 'uPortProfileIPFS1220') {
  return new Promise((resolve, reject) => {
    const issuer = MNID.decode(issuerId || subjectId)
    const subject = MNID.decode(subjectId)
    if (issuer.network !== subject.network) {
      return reject(new Error('Issuer and subject must be on the same network'))
    }
    if (!networks[issuer.network]) {
      return reject(new Error(`Network id ${issuer.network} is not configured`))
    }
    const rpcUrl = networks[issuer.network].rpcUrl
    const registryAddress = MNID.decode(networks[issuer.network].registry).address
    const callString = encodeFunctionCall(functionSignature, registrationIdentifier, issuer.address, subject.address)
    return fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'eth_call',
        params: [
          {to: registryAddress, data: callString},
          'latest'
        ],
        id: 1,
        jsonrpc: '2.0'
      })
    }).then(response => {
      response.json().then(responseJson => {
        if (responseJson.error) return reject(new Error(responseJson.error))
        if (responseJson.result === 0) return reject(new Error('No public profile found'))
        resolve(responseJson.result)
      }, reject)
    }, reject)
  })
}

function registryEncodingToIPFS (hexStr) {
  return base58.encode(Buffer.from('1220' + hexStr.slice(2), 'hex'))
}

export function lookupUportHash (address) {
  return callRegistry(address).then(hash => {
    return registryEncodingToIPFS(hash)
  })
}

export function * fetchPublicUport (address) {
  try {
    const did = address.match('^did:') ? address : `did:uport:${address}`
    const didDoc = yield call(resolve, did)
    if (didDoc && didDoc.uportProfile) {
      const profile = didDoc.uportProfile
      if (profile.image) {
        profile.avatar = {'uri': ipfsUrl + profile.image.contentUrl}
        delete profile.image
      }
      if (profile.banner) {
        profile.banner = {'uri': ipfsUrl + profile.banner.contentUrl}
        delete profile.image
      }
      return profile
    // } else {
      // console.log(`unable to resolve ${address}`)
    }
  } catch (error) {
    console.log(`error in resolving did document for ${address}`)
    // console.log(error)
  }
}

const profileTemplate = {
  '@context': 'http://schema.org',
  '@type': 'Person'
}

export function setUportUrl (address, hexhash) {
  if (MNID.isMNID(address)) {
    const decoded = MNID.decode(address)
    if (decoded && networks[decoded.network]) {
      return `me.uport:${networks[decoded.network].registry}?function=${encodeURIComponent(`set(bytes32 0x75506f727450726f66696c654950465331323230000000000000000000000000, address ${decoded.address}, bytes32 0x${hexhash.slice(6)})`)}&label=uPortRegistry`
    } else {
      throw new Error(`unsupported address: ${address}`)
    }
  } else {
    return `me.uport:0xb9C1598e24650437a3055F7f66AC1820c419a679?function=${encodeURIComponent(`setAttributes(bytes ${hexhash})`)}&label=uPortRegistry`
  }
}

export function * savePublicUportToIPFS (address) {
  const isConnected = yield call(connected)
  if (!isConnected) return
  const profile = yield select(publicUportForAddress, address)
  const attributes = {...profileTemplate, ...profile}
  // TODO hopefully eventually we wont need this
  // it has to do with the etherumjs libraries stripping the initial byte of the public key
  // if (attributes.publicKey && attributes.publicKey.match(/^0x[0-9a-fA-F]{128}$/)) {
  //   attributes.publicKey = `0x04${attributes.publicKey.slice(2)}`
  // }
  console.log(`Saving profile for ${address}`)
  console.log(attributes)
  yield put(saveMessage('persona', 'Sending public key to IPFS'))
  return yield call(addJson, attributes)
}

export function * savePublicUport ({address}) {
  const inProgress = yield select(working, 'persona')
  if (inProgress) return false
  try {
    yield put(startWorking('persona'))
    // console.log(`ipfsHash = ${ipfsHash}`)
    const ipfsHash = yield call(savePublicUportToIPFS, address)
    const prevHash = yield select(ipfsProfile, address)
    if (prevHash !== ipfsHash) {
      yield put(saveMessage('persona', 'Updating DID Document in uPort Registry'))
      // No need to set attibutes if hash is the same
      const hexhash = base58ToHex(ipfsHash)

      console.log('pushing change to registry')
      const request = yield call(handleURL, {url: setUportUrl(address, hexhash), postback: false, popup: false})
      console.log(request)
      const {tx} = yield call(signTransaction, request)
      // console.log(tx)
      const web3 = yield select(web3ForAddress, address)
      const receipt = yield call(waitForTransactionReceipt, web3, tx)
      if (receipt) {
        yield put(saveIpfsProfile(address, ipfsHash))
        yield put(completeProcess('persona'))
        // yield call(sendQueuedEvents)
        return true
      } else {
        yield put(failProcess('persona', 'Identity registration transaction failed'))
        return false
      }
    } else {
      // console.log('not updating blockchain the hash is the same')
      yield put(completeProcess('persona'))
      return true
    }
  } catch (e) {
    // console.log('error in savePublicUport')
    // console.log(e)
    yield put(failProcess('persona', e.message))
  }
  return false
}

export function * addImageToIpfs ({address, claimType, image}) {
  const isConnected = yield call(connected)
  if (!isConnected) return

  // console.log(`addImageToIpfs ${claimType}`)
  // console.log(image)
  const avatarHash = yield call(addImage, image)
  if (!avatarHash) {
    // console.log("image wasn't updated")
    return
  }
  // console.log(`avatarHash = ${avatarHash}`)
  const claims = {}
  claims[claimType] = {
    'uri': ipfsUrl + '/ipfs/' + avatarHash
  }

  yield put(addClaims(address, claims))
}

export function * addImageToIpfsOnboarding ({avatarObj}) {
  const isConnected = yield call(connected)
  if (!isConnected) return
  // console.log(`addImageToIpfs ${claimType}`)
  // console.log(image)
  const avatarHash = yield call(addImage, avatarObj.avatar)
  if (!avatarHash) {
    // console.log("image wasn't updated")
    return
  }
  // console.log(`avatarHash = ${avatarHash}`)
  const avatarClaim = {}
  avatarClaim.avatar = { 'uri': ipfsUrl + '/ipfs/' + avatarHash }
  yield put(addData(avatarClaim))
}
// Current Photo Library Implementation
// [ 'fileSize',
//   'origURL',
//   'longitude',
//   'fileName',
//   'data',
//   'width',
//   'height',
//   'latitude',
//   'timestamp',
//   'uri',
//   'isVertical' ]

// Proposed
// [ 'path', 'size', 'data', 'width', 'height', 'mime' ]

export function * refreshExternalUport ({clientId}) {
  const isConnected = yield call(connected)
  if (!isConnected) return
  const profile = yield call(fetchPublicUport, clientId)
  if (profile) {
    // console.log(profile)
    yield put(storeExternalUport(clientId, profile))
  // } else {
    // console.log(`no profile found for ${address}`)
  }
}

export function * updateShareToken ({address}) {
  const own = yield select(sharableProfileForAddress, address)
  const jwt = yield call(createToken, address, {
    type: 'shareResp',
    own
  })
  yield put(saveShareToken(address, jwt))
}

function * personaSaga () {
  yield all([
    takeEvery(SAVE_PUBLIC_UPORT, savePublicUport),
    takeEvery(REFRESH_EXTERNAL_UPORT, refreshExternalUport),
    takeEvery(ADD_IMAGE, addImageToIpfs),
    takeEvery(ADD_IMAGE_ONBOARDING, addImageToIpfsOnboarding),
    takeEvery(UPDATE_SHARE_TOKEN, updateShareToken)
  ])
}

export default personaSaga
