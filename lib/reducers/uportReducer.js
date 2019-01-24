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

import { STORE_IDENTITY, STORE_SUB_ACCOUNT, UPDATE_IDENTITY, SWITCH_IDENTITY, ADD_OWN_CLAIMS, REMOVE_OWN_CLAIM, INCREASE_NONCE, STORE_FUEL_TOKEN,
          SAVE_NONCE, SAVE_META_NONCE, SAVE_BALANCE, SAVE_FUEL_BALANCE, REMOVE_IDENTITY, STORE_EXTERNAL_UPORT, STORE_CONNECTION,
          REMOVE_CONNECTION, STORE_ACTIVITY, UPDATE_ACTIVITY, REMOVE_ACTIVITY, UPDATE_INTERACTION_STATS, OPEN_ACTIVITY,
          STORE_ATTESTATION, REMOVE_ATTESTATION, SAVE_IPFS_PROFILE, ADD_RECOVERY_ADDRESS, SAVE_SEGMENT_ID, STORE_CURRENT_IDENTITY,
          STORE_ENCRYPTION_KEY, STORE_PUTUTU_TOKEN, ADD_PENDING_ATTESTATION, REMOVE_PENDING_ATTESTATION, STORE_KEYCHAIN_LEVEL, STORE_SECURITY_LEVEL } from 'uPortMobile/lib/constants/UportActionTypes'
import { IMPORT_SNAPSHOT } from 'uPortMobile/lib/constants/HubActionTypes'          
import { RESET_DEVICE } from 'uPortMobile/lib/constants/GlobalActionTypes'
import { hashMap, assoc, assocIn, conj, dissoc, disj, empty, get, getIn, updateIn, merge, toClj, inc, set, filter, keys, first, identity, map } from 'mori'
import { sha3_256 } from 'js-sha3'
import { massage } from 'uPortMobile/lib/sagas/stateSaver'
// Add a key/value pair to the current identity
function assocIdentity (state, address, key, value) {
  return assocIn(state, ['byAddress', address, key], value)
}

function findActivity (state, activityId) {
  return first(
          filter(identity, // identity is simply function returning it's parameter, so filter identity removes any value that isn't null or false
            map(address => {
              // console.log(`findActivity ${activityId}, ${address}`)
              const activity = getIn(state, ['byAddress', address, 'activities', activityId.toString()])
              // console.log(toJs(activity))
              if (activity) return {address, activity}
            }, keys(get(state, 'byAddress')))))
}

function uportReducer (state = hashMap(), action) {
  let activityPair
  switch (action.type) {
    case RESET_DEVICE:
      return hashMap()
    case STORE_IDENTITY:
      const existing = getIn(state, ['byAddress', action.identity.address])
      return assoc(
                assocIn(state, ['byAddress', action.identity.address], merge(existing, toClj(action.identity))),
                  'currentIdentity', action.identity.address)
    case STORE_SUB_ACCOUNT:
      return updateIn(state, ['byAddress', action.identity.address], (id) => {
        const newId = toClj(action.identity)
        if (id) {
          return merge(id, dissoc(newId, 'createdAt'))
        } else {
          return newId
        }
      })
    case UPDATE_IDENTITY:
      return updateIn(state, ['byAddress', action.identity], id => {
        if (id) {
          return merge(id, toClj(action.data))
        }
      })
    case SAVE_SEGMENT_ID:
      return assoc(state, 'segmentId', action.segmentId)
    case SWITCH_IDENTITY:
      return assoc(state, 'currentIdentity', action.address)
    case ADD_OWN_CLAIMS:
      // `updateIn` allows you to update a deeply nested piece of data using a function.
      // In this case we find the path into the current identities own claims map and merge the new claims
      // http://swannodette.github.io/mori/#updateIn
      return updateIn(state, ['byAddress', action.address, 'own'],
                            (claims) => merge(claims, toClj(action.claims)))
    case REMOVE_OWN_CLAIM:
      const claims = getIn(state, ['byAddress', action.address, 'own'])
      if (get(claims, action.claimType)) {
        return assocIdentity(state, action.address, 'own', dissoc(claims, action.claimType))
      } else {
        return state
      }
    case STORE_CONNECTION:
      // `updateIn` allows you to update a deeply nested piece of data using a function.
      // In this case we find the path into the current identities own claims map and connection add the address (conj)
      // to the set. If a set doesn't exist we create a new one using set()
      // http://swannodette.github.io/mori/#updateIn
      return updateIn(state, ['byAddress', action.address, 'own', 'connections', action.connectionType],
                            (connections) => conj(set(connections) || set(), action.connection))
    case REMOVE_CONNECTION:
      // `updateIn` allows you to update a deeply nested piece of data using a function.
      // In this case we find the path into the current identities own claims map and connection remove the address (disj)
      // from the connection set.
      // http://swannodette.github.io/mori/#updateIn
      return updateIn(state, ['byAddress', action.address, 'own', 'connections', action.connectionType],
                            (connections) => disj(set(connections), action.connection))
    case ADD_RECOVERY_ADDRESS:
      return updateIn(state, ['byAddress', action.address], (id) => merge(id, toClj({recoveryAddress: action.recoveryAddress, recoveryType: action.recoveryType})))
    case STORE_ENCRYPTION_KEY:
      return updateIn(state, ['byAddress', action.address], (id) => merge(id, toClj({publicEncKey: action.publicEncKey})))
    case STORE_PUTUTU_TOKEN:
      return updateIn(state, ['byAddress', action.address], (id) => merge(id, toClj({pututuToken: action.pututuToken})))
    case STORE_FUEL_TOKEN:
      return assocIdentity(state, action.address, 'fuelToken', action.token)
    case SAVE_NONCE:
      return assocIdentity(state, action.address, 'nonce', action.nonce)
    case SAVE_META_NONCE:
      return assocIdentity(state, action.address, 'metaNonce', { nonce: action.nonce, timestamp: action.timestamp })
    case INCREASE_NONCE:
      return updateIn(state, ['byAddress', action.address, 'nonce'], inc)
    case SAVE_BALANCE:
      return assocIdentity(state, action.address, 'balance', {ethBalance: action.balance, usdBalance: action.usdBalance})
    case SAVE_FUEL_BALANCE:
      return assocIdentity(state, action.address, 'fuel', action.balance)
    case SAVE_IPFS_PROFILE:
      return assocIdentity(state, action.address, 'ipfsProfile', action.ipfsHash)
    case REMOVE_IDENTITY:
      return updateIn(get(state, 'currentIdentity') === action.address ? dissoc(state, 'currentIdentity') : state, ['byAddress'], (identities) => dissoc(identities, action.address))
    case STORE_EXTERNAL_UPORT:
      return updateIn(state, ['external', action.address], (profile) => merge(profile, toClj(action.profile)))
    case STORE_ACTIVITY:
      return assocIn(state, ['byAddress', action.activity.target, 'activities', action.activity.id.toString()], toClj(action.activity))
    case UPDATE_ACTIVITY:
      activityPair = findActivity(state, action.activityId)
      if (activityPair) {
        return assocIn(state, ['byAddress', activityPair.address, 'activities', action.activityId], merge(activityPair.activity, toClj(action.changes)))
      } else return state
    case OPEN_ACTIVITY:
      activityPair = findActivity(state, action.activityId)
      if (activityPair) {
        return assocIn(state, ['byAddress', activityPair.address, 'activities', action.activityId], assoc(activityPair.activity, 'opened', true))
      } else return state
    case REMOVE_ACTIVITY:
      activityPair = findActivity(state, action.activityId)
      if (activityPair) {
        return updateIn(state, ['byAddress', activityPair.address, 'activities'], (activities) => dissoc(activities, action.activityId))
      } else return state
    case UPDATE_INTERACTION_STATS:
      return updateIn(state, ['byAddress', action.address, 'stats', action.party, action.interactionType], inc)
    case STORE_ATTESTATION:
      const tokenHash = sha3_256(action.attestation.token)
      return assocIn(state, ['byAddress', action.attestation.sub, 'attestations', tokenHash], toClj(action.attestation))
    case REMOVE_ATTESTATION:
      return updateIn(state, ['byAddress', action.address, 'attestations'], (attestations) => dissoc(attestations, action.attestationHash))
    case ADD_PENDING_ATTESTATION:
      return updateIn(state, ['byAddress', action.address, 'pendingAttestations', action.iss, action.claimType], (options) => merge(options, toClj(action.options)))
    case REMOVE_PENDING_ATTESTATION:
      return updateIn(state, ['byAddress', action.address, 'pendingAttestations'], (pending) => {
        const updated = updateIn(pending, [action.iss], types => dissoc(types, action.claimType))
        if (empty(get(updated, action.iss))) {
          return dissoc(updated, action.iss)
        } else {
          return updated
        }
      })
    case STORE_CURRENT_IDENTITY:
      return assoc(state, 'currentStoredIdentity', action.address)
    case STORE_KEYCHAIN_LEVEL:
      return assoc(state, 'keychainSecurityLevel', action.level)
    case STORE_SECURITY_LEVEL:
      return assocIdentity(state, action.address, 'securityLevel', action.level)
    case IMPORT_SNAPSHOT:
      const snapshot = toClj(action.snapshot.uport)
      if (snapshot && get(snapshot, 'byAddress')) {
        return massage(snapshot)
      } else {
        return state
      }
    default:
      return state
  }
}

export default uportReducer
