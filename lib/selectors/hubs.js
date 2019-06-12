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
import { toJs } from 'mori'
import { currentAddress } from './identities'

export const hub = (state) => state.hub
export const uport = (state) => state.uport

export const hubHead = createSelector(
  [hub],
  (hub) => hub ? hub.head : undefined
)

export const nextEvent = createSelector(
  [hub],
  (hub) => hub && hub.events.length > 0 ? hub.events[0] : undefined
)

export const hubQueue = createSelector(
  [hub],
  (hub) => hub ? hub.events : []
)

export const hubQueueLength = createSelector(
  [hub],
  (hub) => hub ? hub.events.length : 0
)

export const hubCanQueue = createSelector(
  [hub, currentAddress],
  (hub, address) => hub && !hub.doNotQueue && address && address !== 'new'
)

export const snapshot = (state) => ({
  uport: toJs(state.uport),
  hdwallet: toJs(state.hdwallet)
})
