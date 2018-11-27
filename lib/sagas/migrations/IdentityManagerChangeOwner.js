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
import Contract from 'truffle-contract'
import { networksByName } from 'uPortMobile/lib/utilities/networks'

const MNID = require('mnid')

// const TxRelay = UportContracts.TxRelay.v2
const IdentityManager = UportContracts.IdentityManager.v2
const MetaIdentityManager = UportContracts.MetaIdentityManager.v2

const step = MigrationStep.IdentityManagerChangeOwner

export function * identityManagerInstance ({ controllerAddress, signerType, network }) {
  const web3 = yield select(web3ForNetwork, network)
  let artifacts
  switch (signerType) {
    case 'IdentityManager':
      artifacts = IdentityManager
      break
    case 'MetaIdentityManager':
      artifacts = MetaIdentityManager
      break
    default:
      throw new Error(`It is not possible to migrate a ${signerType} identity`)
  }
  const manager = Contract(artifacts)
  manager.setProvider(web3.currentProvider)
  return manager.at(controllerAddress)
}

export function * isOwner ({identityManager, identity, newOwner}) {
  try {
    return yield call([identityManager.isowner, identityManager.isOwner.call], identity, newOwner)
  } catch (error) {
    console.log('isOwner', error)
    return false
  }
}

export function * signFunctionCall ({contract, fn, label, signerType, target}) {
  const request = yield handleURL({url: `me.uport:${contract}?function=${encodeURIComponent(fn)}&label=${encodeURIComponent(label)}`, target, popup: false})
  console.log('signFunctionCall', request)
  return yield signTransaction(request, signerType)
}

export function * addOwner ({controllerAddress, network, deviceAddress, hexAddress, signerType, address}, newOwner) {
  const contract = MNID.encode({address: controllerAddress, network: networksByName[network].network_id})
  const fn = signerType === 'MetaIdentityManager'
    ? `addOwner(address ${deviceAddress}, address ${hexAddress}, address ${newOwner})`
    : `addOwner(address ${hexAddress}, address ${newOwner})`
  return yield signFunctionCall({
    contract,
    fn,
    label: 'Add new Device Address as owner',
    signerType: signerType === 'MetaIdentityManager' ? 'devicemeta' : 'device',
    target: address
  })
}

export default function * migrate () {
  if (yield select(isFullyHD)) return
  try {
    const settings = yield select(networkSettings)
    const identityManager = yield call(identityManagerInstance, settings)
    const identity = settings.hexAddress || MNID.decode(settings.address).address
    const newOwner = yield call(selectOrCreateSeed)
    yield put(saveMessage(step, `New Seed Created ${newOwner}`))

    yield put(saveMessage(step, `Adding ${newOwner} as owner of ${settings.address}`))
    const { tx } = yield call(addOwner, {...settings, hexAddress: identity}, newOwner)
    console.log(tx)

    yield put(saveMessage(step, `Waiting for transaction ${tx} to mine`))
    yield call(waitForTransactionReceipt, tx)
    console.log(`mined ${tx}`)
    // yield call(delay, 5000)
    yield put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${settings.address} was successfull`))
    if (yield call(isOwner, {identityManager, identity, newOwner})) {
      yield put(saveMessage(step, `Owner status of ${settings.address} successfully changed to ${newOwner}`))
      return true
    } else {
      yield put(failProcess(step, `Transaction Failed to add ${newOwner} as owner of ${settings.address} - ${tx}`))
      return false
    }
  } catch (error) {
    console.log(error)
    yield put(failProcess(step, error.message))
    return false
  }
}

// export default migrate
