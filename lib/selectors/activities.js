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
import { get, toJs, map, vals, reverse, take, filter, remove, count, vector, into } from 'mori'
import { currentIdentity, selectedIdentity } from './identities'

// Filters a transaction by the 'to' field or 'client_id' field
export const byAddress = (state, address) => {
  return filter((act) => (get(act, 'to') === address || get(act, 'client_id') === address), activities(state))
}

// Returns a boolean if the activity is unread
// Used as a filter in other selectors
const isUnread = (activity) => {
  return !(get(activity, 'opened') || get(activity, 'authorizedAt') || get(activity, 'canceledAt'))
}

const unopenedAttestations = (activity) => (
  get(activity, 'type') === 'attestation' && !get(activity, 'opened')
)
const activeNotification = (activity) => {
  return (!(get(activity, 'authorizedAt') || get(activity, 'canceledAt'))) || unopenedAttestations(activity)
}

// Returns Mori data structure of all activities for the current identity
// Returns an array if no activities are present
export const activities = createSelector(
  [currentIdentity],
  (identity) => reverse(filter(a => get(a, 'id'), vals(get(identity, 'activities')))) || []
)

export const notifications = createSelector(
  [activities],
  (rawActivities) => into(vector(), filter(activeNotification, rawActivities))
)

// Returns an integer detailing the current count of unread activities
export const notificationCount = createSelector(
  [notifications],
  (_activities) => count(_activities)
)

// Returns aMori data structure of all activities for a selectedIdentity
// Returns an array if no activities are present
export const activitiesForAddress = createSelector(
  [selectedIdentity],
  (identity) => reverse(filter(a => get(a, 'id'), vals(get(identity, 'activities')))) || []
)

// Returns a JS Object of activities sorted by address
// Return an empty array if nothing is found
export const activitiesByAddress = createSelector(
  [byAddress], (activities) => toJs(activities)
)

// Returns a JS Object of unconfirmedTransactions for an address
export const unconfirmedTransactions = createSelector(
  [activitiesForAddress], (all) => toJs(
    map((tx) => [get(tx, 'id'), get(tx, 'txhash')],
      filter(a => get(a, 'txhash') && !get(a, 'blockNumber'), all)))
)

// Returns a Mori data structure of all unread activities
// Returns an empty array if no activities are present
export const rawUnread = createSelector(
  [activities],
  (_activities) => filter(isUnread, _activities)
)

// Returns a JS Object of the first 10 unread activities
export const unread = createSelector(
  [rawUnread],
  (_activities) => toJs(take(10, _activities))
)

// Returns an integer detailing the current count of unread activities
export const unreadCount = createSelector(
  [rawUnread],
  (_activities) => count(_activities)
)

// Returns a Mori data structure of all activities that have been read
export const rawHistory = createSelector(
  [activities],
  (_activities) => remove(isUnread, _activities)
)

// Returns a JS Object of the first 30 read activities
export const history = createSelector(
  [rawHistory],
  (_activities) => toJs(take(30, _activities))
)

// Returns an integer detailing the current count of all activities minus unread
// Returns 0 if no activities exist
export const historyCount = createSelector(
  [rawHistory],
  (_activities) => _activities ? count(_activities) : 0
)
