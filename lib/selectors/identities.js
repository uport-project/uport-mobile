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
import { createSelector } from 'reselect'
import {
  assoc,
  apply,
  keys,
  map,
  concat,
  distinct,
  toClj,
  first,
  filter,
  remove,
  sort,
  merge,
  vals,
  hashMap,
  get,
  getIn,
  selectKeys,
  toJs,
  seq,
  sortBy,
  vector,
} from 'mori'
import { decodeAddress, defaultNetwork, networks } from 'uPortMobile/lib/utilities/networks'

export const currentAddress = state => get(state.uport, 'currentIdentity')
export const currentDid = state => `did:uport:${get(state.uport, 'currentIdentity')}`
export const currentStoredIdentity = state => get(state.uport, 'currentStoredIdentity')
export const accountsByAddress = state => get(state.uport, 'byAddress')
export const externalIdentities = state => get(state.uport, 'external')
export const identityByAddress = (state, address) => toJs(getIn(state.uport, ['external', address]))
export const segmentId = state => get(state.uport, 'segmentId')
export const selectedIdentity = (state, address) => getIn(state.uport, ['byAddress', address])
export const selectedAddress = (state, address) => address
export const selectedNetwork = (state, network) => network
export const selectedClientId = (state, network, clientId) => clientId
export const selectedSignerType = (state, network, clientId, signerType) => signerType

function isDisabled(id) {
  return !!get(id, 'disabled')
}

export function identityMap(identity) {
  return merge(
    selectKeys(get(identity, 'own'), ['name', 'avatar', 'banner', 'description', 'location']),
    selectKeys(identity, ['address', 'network', 'publicKey', 'publicEncKey']),
  )
}

export const allAccounts = createSelector(
  [accountsByAddress],
  all =>
    filter(
      acct => !get(acct, 'disabled') && get(acct, 'address') && get(acct, 'address').slice(0, 4) !== 'temp',
      vals(all)
    )
)

export const allAddresses = createSelector(
  [accountsByAddress],
  all => toJs(keys(all)),
)

export const selectedIdentityJs = createSelector(
  [selectedIdentity],
  id => toJs(id),
)

// Return a mori object of the currentIdentity
export const currentIdentity = createSelector(
  [accountsByAddress, currentAddress],
  (identities, address) => get(identities, address),
)

export const currentIdentityJS = createSelector(
  [currentIdentity],
  id => toJs(id),
)

export const currentDidObject = createSelector(
  [accountsByAddress, currentDid],
  (identities, address) => get(identities, address),
)

// Return a mori object of identities with addresses as keys
export const allIdentities = createSelector(
  [allAccounts],
  accounts => filter(acct => !get(acct, 'parent'), accounts),
)

// Return a mori object of the identity at the selected Address
export const subAccountsSeq = createSelector(
  [selectedAddress, allAccounts],
  (selected, accounts) => filter(acct => get(acct, 'parent') === selected, accounts),
)

export const mySubAccountsSeq = createSelector(
  [currentAddress, allAccounts],
  (selected, accounts) => filter(acct => get(acct, 'parent') === selected, accounts),
)

// Return a JS object of the identity at the selected address
export const subAccounts = createSelector(
  [subAccountsSeq],
  subidentities => toJs(subidentities),
)

export function legacyIdentity(id) {
  return !get(id, 'address').match(/^did:ethr:/)
}

export const migrateableIdentities = createSelector(
  [allIdentities],
  identities =>
    toJs(
      map(
        id => selectKeys(id, ['address', 'network', 'signerType']),
        remove(isDisabled, filter(legacyIdentity, identities)),
      ),
    ),
)

export const legacyRoot = createSelector(
  [currentIdentity],
  id => legacyIdentity(id),
)

export const myAccounts = createSelector(
  [currentIdentity, mySubAccountsSeq],
  (identity, subaccounts) =>
    toJs(
      concat(!get(identity, 'address') || get(identity, 'address').match(/^did:/) ? [] : vector(identity), subaccounts),
    ),
)
// Return a mori object for the identities on the selected network
// If no network is selected then it returns a null object
export const accountsForNetworkSeq = createSelector(
  [selectedNetwork, allAccounts],
  (network, accounts) =>
    filter(acct => decodeAddress(get(acct, 'address')).network === network && !get(acct, 'clientId'), accounts),
)

// Return a JS object for the identities on the selected network
export const accountsForNetwork = createSelector(
  [accountsForNetworkSeq],
  accounts => toJs(sortBy(id => -get(id, 'createdAt', 0), accounts)),
)

// Return a mori object for the identities for the selected client
// If no network is selected then it returns a null object
export const accountsForClientIdAndNetworkSeq = createSelector(
  [selectedNetwork, selectedClientId, allAccounts],
  (network, clientId, accounts) =>
    filter(
      acct => decodeAddress(get(acct, 'address')).network === network && get(acct, 'clientId') === clientId,
      accounts,
    ),
)

// Return a JS object for the identities on the selected network
export const accountForClientIdAndNetwork = createSelector(
  [accountsForClientIdAndNetworkSeq],
  accounts => toJs(first(accounts)),
)

// Return a mori object for the identities for the selected client
// If no network is selected then it returns a null object
export const accountsForClientIdSignerTypeAndNetworkSeq = createSelector(
  [selectedNetwork, selectedClientId, selectedSignerType, allAccounts],
  (network, clientId, signerType, accounts) =>
    filter(
      acct =>
        decodeAddress(get(acct, 'address')).network === network &&
        get(acct, 'clientId') === clientId &&
        get(acct, 'signerType') === signerType,
      accounts,
    ),
)

// Return a JS object for the identities on the selected network
export const accountForClientIdSignerTypeAndNetwork = createSelector(
  [accountsForClientIdSignerTypeAndNetworkSeq],
  accounts => toJs(first(accounts)),
)

export const otherIdentitiesSeq = createSelector(
  [allIdentities, currentAddress],
  (identities, address) => filter(id => !(get(id, 'address') === address), identities),
)
// Return a JS object for all other identities besides the primary identity
export const otherIdentities = createSelector(
  [otherIdentitiesSeq],
  identities => toJs(identities),
)

export const validPrimaryIdentities = createSelector(
  [allIdentities],
  identities =>
    toJs(
      map(
        id => get(id, 'address'),
        filter(id => get(id, 'address').match(/^did:ethr:0x[0-9a-fA-F]{40}$/), identities)
      )
    )
)

// Return a boolean if the currentAddress is associated with an identity or not
export const hasIdentity = createSelector(
  [currentAddress],
  address => address && address !== 'new',
)

// Return a boolean if the currentIdentity has an encryption key
export const hasEncryptionKey = createSelector(
  [currentIdentity],
  identity => !!get(identity, 'publicEncKey'),
)

// Return a mori object with all of the claims associated with the currentIdentity
export const ownClaims = createSelector(
  [currentIdentity],
  identity => get(identity, 'own'),
)

export const ownClaimsMap = createSelector(
  [ownClaims],
  claims => toJs(claims),
)

// Return a string with the identities currentName
export const currentName = createSelector(
  [ownClaims],
  claims => get(claims, 'name'),
)

// Return an JS object with a URI containing the ipfs has of the currentAvatar for the currentIdentity
export const currentAvatar = createSelector(
  [ownClaims],
  claims => toJs(get(claims, 'avatar')),
)

// Return a mori object containing the public uport of the currentIdentity
export const publicUportMap = createSelector(
  [currentIdentity],
  identity => identityMap(identity),
)
// Return a JS object containing the public uport of the currentIdentity
export const publicUport = createSelector(
  [publicUportMap],
  identity => toJs(identity),
)

// Return a mori object containing the public uport of the selectedIdentity
export const publicUportMapForAddress = createSelector(
  [selectedIdentity],
  identity => selectKeys(identity, ['publicKey', 'publicEncKey']),
)

// Return a JS object containing the public uport of the selectedIdentity
export const publicUportForAddress = createSelector(
  [publicUportMapForAddress],
  identity => toJs(identity),
)

// Return a mori object containing the public uport of the selectedIdentity
export const sharableProfileMapForAddress = createSelector(
  [selectedIdentity],
  identity => merge(selectKeys(get(identity, 'own'), ['name', 'avatar']), selectKeys(identity, ['publicEncKey'])),
)

// Return a JS object containing the public uport of the selectedIdentity
export const sharableProfileForAddress = createSelector(
  [sharableProfileMapForAddress],
  identity => toJs(identity),
)

// Return a mori object containing all the current connections of the currentIdentity
export const connected = createSelector(
  [ownClaims],
  claims => distinct(apply(concat, toClj(vals(toClj(get(claims, 'connections')))))),
)

const connectionComparator = (a, b) => {
  const aName = get(a, 'name')
  const bName = get(b, 'name')
  if (aName) {
    if (bName) {
      const aNAME = aName.toUpperCase()
      const bNAME = bName.toUpperCase()
      return aNAME.localeCompare(bNAME)
    } else {
      return -1
    }
  } else {
    if (bName) {
      return 1
    } else {
      const aAddress = get(a, 'address').toUpperCase()
      const bAddress = get(b, 'address').toUpperCase()
      return aAddress.localeCompare(bAddress)
    }
  }
}

const contractConnection = address => {
  return get(address, '@type') === 'Contract'
}

// Return an array of objects with connected addresses and types
export const connections = createSelector(
  [externalIdentities, connected],
  (identities, connected) => {
    return toJs(
      sort(
        connectionComparator,
        remove(
          contractConnection,
          map(
            address =>
              assoc(get(identities, address, hashMap('address', address, '@type', 'Contract')), 'address', address),
            connected,
          ),
        ),
      ),
    )
  },
)

export const contacts = createSelector(
  [externalIdentities, ownClaims],
  (identities, claims) => {
    return toJs(
      sort(
        connectionComparator,
        map(
          address =>
            assoc(get(identities, address, hashMap('address', address, '@type', 'Contract')), 'address', address),
          filter(a => a, getIn(claims, ['connections', 'knows'])),
        ),
      ),
    )
  },
)

// Return a mori object with the number of interactions and the types of interactions by address
export const interactionStats = createSelector(
  [currentIdentity],
  identity => get(identity, 'stats'),
)

export const interactionStatsForAddress = createSelector(
  [selectedIdentity],
  identity => get(identity, 'stats'),
)
// Return the ipfs hash for the selected identity
export const ipfsProfile = createSelector(
  [selectedIdentity],
  identity => get(identity, 'ipfsProfile'),
)
// Return the publicEncKey of the selectedIdentity
export const publicEncKey = createSelector(
  [selectedIdentity],
  identity => get(identity, 'publicEncKey'),
)
// Return the pututuToken of the selectedIdentity
export const pututuToken = createSelector(
  [selectedIdentity],
  identity => get(identity, 'pututuToken'),
)

// Has the user successfully published his DID to the registry
export const hasPublishedDID = createSelector(
  [ipfsProfile, currentAddress],
  (ipfsHash, address) => !!ipfsHash || !!(address && address.match(/^did:ethr:0x[0-9a-fA-F]{40}$/)),
)

export const mainnetAccounts = createSelector(
  [allAccounts],
  accounts => filter(a => get(a, 'parent') && get(a, 'network') === 'mainnet', accounts),
)

export const hasMainnetAccounts = createSelector(
  [mainnetAccounts],
  accounts => !!seq(accounts),
)
