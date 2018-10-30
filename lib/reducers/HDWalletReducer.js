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
import { IMPORT_SNAPSHOT } from 'uPortMobile/lib/constants/HubActionTypes'
import { RESET_DEVICE } from 'uPortMobile/lib/constants/GlobalActionTypes'
import { toClj, inc, assoc, updateIn, conj } from 'mori'

// This maintains information about the HD wallet needed to create new identities and accounts.
//
// Creates a hashMap similar to this:
// {
//   root: '0xabcde',
//   identities: [1, 3, 4]
// }
//
// Each element of the vector represents the path at it's index:
// The above example includes 3 identities each at position 0, 1 and 2.
//
// identity 0 has the most recent HD account path as 1. eg `m/7696500/0'/1'/0'`
// identity 1 has the most recent HD account path as 3. eg `m/7696500/1'/3'/0'`
// identity 2 has the most recent HD account path as 4. eg `m/7696500/2'/4'/0'`

// The path is as follows (the apostrophe denotes hardened derivation):

// m/version'/id'/acct'/purpose'

// * We set the `version` field to 7696500 to start with. This version field will allow us to update the path completely if we need to in the future.
// * The field `id` denotes the high-level identity. Starts at 0. Will have only one identity to start with, but this one can be incremented.
// * The field `acct` denotes the account of the identity. Account 0 will be used for the main off-chain identity. Ideally this account will not be used for any Ethereum related activities. Accounts 1 and above are for Ethereum related activities like holding ETH and tokens etc.
// * The field purpose denotes the purpose of the key. We use the following numbers:
//    * 0 - signing key (device key)
//    * 1 - recovery key
//    * 2 - asymmetric encryption key (may be defined only for the off-chain identity at first)

function HDWalletReducer (state = toClj({}), action) {
  switch (action.type) {
    case RESET_DEVICE:
      return toClj({})
    case STORE_ROOT_ADDRESS:
      return toClj({root: action.root, identities: [0]})
    case INC_IDENTITY_INDEX:
      return updateIn(state, ['identities'], (identities) => conj(identities, 0))
    case INC_ACCOUNT_INDEX:
      return updateIn(state, ['identities', action.identity], inc)
    case SEED_CONFIRMED:
      return assoc(state, 'seedConfirmed', true)
    case ACCOUNT_RISK_SENT:
      return assoc(state, 'accountRiskSent', true)
    case RESET_HD_WALLET: // used if something went wrong during onboarding or recovery
      return toClj({})
    case IMPORT_SNAPSHOT:
      if (action.snapshot.hdwallet && Object.keys(action.snapshot.hdwallet).length > 0) {
        return toClj(action.snapshot.hdwallet)
      } else {
        return state
      }
    case STORE_ALL_KEYCHAIN_ADDRESS:
      return assoc(state, 'seedAddresses', action.addresses)
    default:
      return state
  }
}

export default HDWalletReducer
