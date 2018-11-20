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

// import { handleURL } from '../requests'
import { signFunctionCall } from 'uPortMobile/lib/sagas/requests/transactionRequest'
import { waitForTransactionReceipt } from 'uPortMobile/lib/sagas/blockchain'
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

import {
  hdRootAddress
} from 'uPortMobile/lib/selectors/hdWallet'

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
  manager.setProvider(web3.getProvider())
  return manager.at(controllerAddress)
}

export function * isOwner ({identityManager, identity, newOwner}) {
  return yield call(identityManager, identityManager.isOwner.call, identity, newOwner)
}

export function * addOwner ({controllerAddress, network, deviceAddress, hexAddress, signerType}, newOwner) {
  const address = MNID.encode({address: controllerAddress, network: networksByName[network].network_id})
  const fn = signerType === 'MetaIdentityManager'
    ? `addOwner(address ${deviceAddress}, address ${hexAddress}, address ${newOwner})`
    : `addOwner(address ${hexAddress}, address ${newOwner})`
  return yield signFunctionCall({
    address,
    fn,
    label: 'Add new Device Address as owner',
    signerType: signerType
  })
}

export default function * migrate () {
  if (yield select(isFullyHD)) return
  try {
    const settings = yield select(networkSettings)
    const identityManager = yield call(identityManagerInstance, settings)
    const newOwner = yield select(hdRootAddress)
    const identity = settings.hexAddress

    yield put(saveMessage(step, `Checking if ${newOwner} is already owner of ${settings.address}`))
    // We've already migrated and can leave

    // the `seq` is only used for testing to create seperate mocks
    if (yield call(isOwner, {identityManager, identity, newOwner, seq: 1})) return true

    yield put(saveMessage(step, `Adding ${newOwner} as owner of ${settings.address}`))
    const { tx } = yield call(addOwner, settings, newOwner)
    console.log(tx)

    yield put(saveMessage(step, `Waiting for transaction ${tx} to mine`))
    yield call(waitForTransactionReceipt, tx)
    console.log(`mined ${tx}`)
    yield put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${settings.address} was successfull`))
    if (yield call(isOwner, {identityManager, identity, newOwner, seq: 2})) {
      yield put(saveMessage(step, `Owner status of ${settings.address} successfully changed to ${newOwner}`))
      return true
    } else {
      yield put(failProcess(step, `Transaction Failed to add ${newOwner} as owner of ${settings.address} - ${tx}`))
      return false
    }
  } catch (error) {
    // console.log(error)
    yield put(failProcess(step, error.message))
    return false
  }
}

// export default migrate
