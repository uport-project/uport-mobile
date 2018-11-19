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
import { 
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  saveMessage,
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

const TxRelay = UportContracts.TxRelay.v2
const IdentityManager = UportContracts.IdentityManager.v2
const MetaIdentityManager = UportContracts.MetaIdentityManager.v2

const step = MigrationStep.IdentityManagerChangeOwner

function selectContract (signerType, controllerAddress, web3)  {
  let abi
  switch (signerType) {
    case 'IdentityManager': 
    abi = IdentityManager.abi
    break
    case 'MetaIdentityManager':
    abi = MetaIdentityManager.abi
    break
    default:
    throw new Error(`It is not possible to migrate a ${signerType} identity`)
  }
  return web3.contract(abi).at(controllerAddress)
}
function * migrate () {
  const isHD = yield select(isFullyHD)
  if (isHD) return

  const { hexaddress, deviceAddress, controllerAddress, txRelayAddress, signerType } = yield select(networkSettings)
  const web3 = yield select(web3ForNetwork, 'rinkeby')
  const identityManager = selectContract(signerType, controllerAddress, web3)
  const deviceRoot = yield select(hdRootAddress)

  const result = yield call(identityManager.isOwner, hexaddress, deviceRoot)

  if (result) {
    // We'lve already migrated and can leave
    return
  }



}

export default migrate
