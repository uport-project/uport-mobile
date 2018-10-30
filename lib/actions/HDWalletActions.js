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
import { STORE_ROOT_ADDRESS, INC_IDENTITY_INDEX, INC_ACCOUNT_INDEX, SEED_CONFIRMED, ACCOUNT_RISK_SENT, RESET_HD_WALLET, STORE_ALL_KEYCHAIN_ADDRESS } from 'uPortMobile/lib/constants/HDWalletActionTypes'

// These are used to keep a track of used and unused paths for a HD wallet

// ADDING NEW ACTIONS PLEASE READ THIS!!!!
//
// If the action should be backed up add the `, _backup` attribute to the action.
// When should it be backed up?
//
// - is it backed by the reducer and not a saga?
// - is it something that can not be refreshed from the block chain etc? (eg. no need to backup nonces and balances)
// - is it not just related to UX? Some reducers are temporary and would not make sense on multiple device

export function storeRootAddress (root) {
  return {
    type: STORE_ROOT_ADDRESS,
    root,
    _backup: true
  }
}

export function incIdentityIndex () {
  return {
    type: INC_IDENTITY_INDEX,
    _backup: true
  }
}

export function incAccountIndex (identity) {
  return {
    type: INC_ACCOUNT_INDEX,
    identity,
    _backup: true
  }
}

export function seedConfirmed () {
  return {
    type: SEED_CONFIRMED,
    _backup: true
  }
}

export function accountRiskSent () {
  return {
    type: ACCOUNT_RISK_SENT,
    _backup: true
  }
}

export function resetHDWallet () {
  return {
    type: RESET_HD_WALLET
  }
}


export function storeAllKeyChainAddresses (addresses) {
  return {
    type: STORE_ALL_KEYCHAIN_ADDRESS,
    addresses
  }
}