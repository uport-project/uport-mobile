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
import { all, takeEvery, call, select, put } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { handleURL } from '../requests'
import { signTransaction } from 'uPortMobile/lib/sagas/requests/transactionRequest'
import { waitForTransactionReceipt } from 'uPortMobile/lib/sagas/blockchain'
import {
  selectOrCreateSeed
} from 'uPortMobile/lib/sagas/keychain'
import {
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  saveMessage,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import {
  networkSettings,
  isFullyHD,
  web3ForNetwork
} from 'uPortMobile/lib/selectors/chains'

import UportContracts from 'uport-identity'
import { networksByName } from 'uPortMobile/lib/utilities/networks'
import {
  logDecoder
} from 'ethjs-abi/dist/ethjs-abi.min.js'

const MNID = require('mnid')

// const TxRelay = UportContracts.TxRelay.v2
const IdentityManager = UportContracts.IdentityManager.v2
const MetaIdentityManager = UportContracts.MetaIdentityManager.v2
const RecoverableController = UportContracts.legacy.RecoverableController

const step = MigrationStep.IdentityManagerChangeOwner

function identityManagerArtifactsForSigner (signerType) {
  switch (signerType) {
    case 'IdentityManager':
      return IdentityManager
    case 'MetaIdentityManager':
      return MetaIdentityManager
    case 'KeyPair':
      throw new Error(`It is not possible to migrate a ${signerType} identity`)
    default:
      return RecoverableController
  }
}

export function * identityManagerInstance ({ controllerAddress, signerType, network }) {
  const web3 = yield select(web3ForNetwork, network)
  const artifacts = identityManagerArtifactsForSigner(signerType)
  const manager = web3.contract(artifacts.abi).at(controllerAddress)
  return manager
}

export function identityManagerLogDecoder (signerType) {
  return logDecoder(identityManagerArtifactsForSigner(signerType).abi)
}

export function * isOwner ({identityManager, identity, newOwner, signerType}) {
  try {
    if (signerType === 'proxy' || !signerType) {
      return yield call([identityManager.userKey, identityManager.userKey.call])
    } else {
      return yield call([identityManager.isowner, identityManager.isOwner.call], identity, newOwner)
    }
  } catch (error) {
    // console.log('isOwner', error)
    return false
  }
}

export function * signFunctionCall ({contract, fn, label, signerType, target}) {
  const request = yield handleURL({url: `me.uport:${contract}?function=${encodeURIComponent(fn)}&label=${encodeURIComponent(label)}`, target, popup: false})
  // console.log('signFunctionCall', request)
  return yield signTransaction(request, signerType)
}

export function * waitForEvents ({network, signerType}, tx) {
  if (!tx) throw new Error(`Transaction did not go through`)
  const web3 = yield select(web3ForNetwork, network)
  const receipt = yield call(waitForTransactionReceipt, web3, tx.tx)
  // console.log('txreceipt', receipt)
  const decoder = identityManagerLogDecoder(signerType)
  return decoder(receipt.logs)
}

// Proxy
export function * addOwnerRC (settings, identityManager, newOwner) {
  const {controllerAddress, network, address} = settings
  const contract = MNID.encode({address: controllerAddress, network: networksByName[network].network_id})
  const fn = `signUserKeyChange(address ${newOwner})`
  let tx = yield call(signFunctionCall, {
    contract,
    fn,
    label: 'Propose new Device Address as owner',
    signerType: 'device',
    target: address
  })
  let events = yield call(waitForEvents, settings, tx)
  if (!events.find(event => event._eventName === 'RecoveryEvent' && event.action === 'signUserKeyChange')) return false

  const timelock = yield call([identityManager.shortTimeLock, identityManager.shortTimeLock.call])
  yield call(delay, timelock * 1000)

  tx = yield call(signFunctionCall, {
    contract,
    fn: 'changeUserKey()',
    label: 'Accept new Device Address as owner',
    signerType: 'device',
    target: address
  })
  events = yield call(waitForEvents, settings, tx)
  return !!events.find(event => event._eventName === 'RecoveryEvent' && event.action === 'changeUserKey')
}

// IdentityManager/MetaIdentityManasger
export function * addOwnerIM (settings, newOwner) {
  const {controllerAddress, network, deviceAddress, hexaddress, signerType, address} = settings
  console.log(settings)
  const contract = MNID.encode({address: controllerAddress, network: networksByName[network].network_id})
  const fn = signerType === 'MetaIdentityManager' ? `addOwner(address ${deviceAddress}, address ${hexaddress}, address ${newOwner})` : `addOwner(address ${hexaddress}, address ${newOwner})`
  console.log('fn', fn)
  const tx = yield call(signFunctionCall, {
    contract,
    fn,
    label: 'Add new Device Address as owner',
    signerType: signerType === 'MetaIdentityManager' ? 'devicemeta' : 'device',
    target: address
  })
  const events = yield call(waitForEvents, settings, tx)
  return !!events.find(event => event._eventName === 'LogOwnerAdded' && event.identity === hexaddress && event.owner === newOwner)
}

export function * changeOwnership (settings, identityManager, newOwner) {
  switch (settings.signerType) {
    case 'MetaIdentityManager':
    case 'IdentityManager':
      return yield call(addOwnerIM, settings, newOwner)
    default:
      return yield call(addOwnerRC, settings, identityManager, newOwner)
  }
}

export default function * migrate (attempt = 0) {
  if (yield select(isFullyHD)) return true
  try {
    const settings = yield select(networkSettings)
    const identityManager = yield call(identityManagerInstance, settings)
    const identity = settings.hexaddress || MNID.decode(settings.address).address
    const newOwner = yield call(selectOrCreateSeed)
    yield put(saveMessage(step, `New Seed Created ${newOwner}`))

    if (yield call(isOwner, {identityManager, identity, newOwner, signerType: settings.signerType})) {
      yield put(saveMessage(step, `Owner status of ${settings.address} successfully changed to ${newOwner}`))
      return true
    }
    yield put(saveMessage(step, `Adding ${newOwner} as owner of ${settings.address}`))
    const success = yield call(changeOwnership, {...settings, hexaddress: identity}, identityManager, newOwner)
    yield put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${settings.address} was successfull`))
    if (success) {
      yield put(saveMessage(step, `Owner status of ${settings.address} successfully changed to ${newOwner}`))
      return true
    } else {
      if (attempt > 2) {
        yield put(failProcess(step, `Transaction Failed to add ${newOwner} as owner of ${settings.address}`))
        return false
      }
      return yield call(migrate, ++attempt)
    }
  } catch (error) {
    yield put(failProcess(step, error.message))
    return false
  }
}

// export default migrate
