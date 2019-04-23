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
import { toJs, toClj, get, getIn, vals, assoc, first, filter, map, keys, identity } from 'mori'
import { currentIdentity, interactionStats, interactionStatsForAddress } from './identities'
import { toASCII } from 'punycode'
import { profileForDID } from './vc'

const findRequest = (state, activityId) =>
  activityId && state.uport
    ? first(
        filter(
          identity, // identity is simply function returning it's parameter, so filter identity removes any value that isn't null or false
          map(address => {
            return getIn(state.uport, ['byAddress', address, 'activities', activityId.toString()])
          }, keys(get(state.uport, 'byAddress'))),
        ),
      )
    : null

const findCurrentRequest = state => findRequest(state, state.request)

export const currentRequestId = state => toJs(state.request)

// Return a JS object with the current request or null
export const currentRequest = createSelector(
  [findCurrentRequest],
  request => (request ? toJs(request) : null),
)

export const currentRequestType = createSelector(
  [findCurrentRequest],
  request => get(request, 'type'),
)

export const currentRequestAuthorized = createSelector(
  [findCurrentRequest],
  request => !!get(request, 'authorizedAt'),
)

// Return a JS object with the selected request or null
export const fetchRequest = createSelector(
  [findRequest],
  request => (request ? toJs(request) : null),
)

// Return a boolean representing if the current state has a request
export const hasRequest = state => !!state.request

// Return a mori object of the profile of an address
export const externalProfile = (state, address) => {
  if (!address) return

  const profileFromVC = profileForDID(state, address)

  if (profileFromVC && (profileFromVC.name || profileFromVC.url)) {
    return toClj({ ...profileFromVC })
  }

  const profile = getIn(state.uport, ['external', address])
  if (profile) {
    return assoc(profile, 'address', address)
  }
  return toClj({ address, name: `${address.slice(0, 14)}...${address.slice(-3)}` })
}

// Return a mori object of the externalProfile profile of the destination of a request
const destinationProfileMap = state => (currentRequest(state) ? externalProfile(state, currentRequest(state).to) : null)
// Return a mori object of the client profile from the currentRequest
const clientProfileMap = state =>
  currentRequest(state) ? externalProfile(state, currentRequest(state).client_id) : null

// Return a JS object of the passed in profile
const buildProfile = (profile, allStats) => {
  if (!profile) return null
  const stats = get(allStats, get(profile, 'address'))
  if (stats) {
    return toJs(assoc(profile, 'stats', stats))
  } else {
    return toJs(profile)
  }
}

// Return a JS object of the destination profile
export const destinationProfile = createSelector(
  [destinationProfileMap, interactionStatsForAddress],
  buildProfile,
)

// Return a JS object of the client profile
export const clientProfile = createSelector(
  [clientProfileMap, interactionStats],
  buildProfile,
)
// Return an array of the activites of the currentIdentity
export const activities = createSelector(
  [currentIdentity],
  // TODO I don't think we need to sort this anymore due to it now being a sortedMap. Just leaving the below line in, just in case
  // (currentIdentity) => toJs(sortBy((activity) => activity.id, vals(get(currentIdentity, 'activities'))))
  currentIdentity => toJs(vals(get(currentIdentity, 'activities'))) || [],
)
