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
import { get, toJs, keys, map, assoc, sortBy, remove} from 'mori'

// Return a mori object with fuel, nonce, balance, gasPrice and persona
const processStatus = (state) => state.status
const processHistory = (state) => state.history

const sectionName = (state, section) => section

const networking = (state) => state.networking

export const processSection = createSelector(
  [processStatus, sectionName],
  (status, section) => get(status, section)
)

// Return a boolean representing if the client is currently online or not
export const offline = createSelector(
  [networking],
  (net) => net.online === false
)

// Return a boolean representing if there is a process currently running
export const working = createSelector(
  [processSection],
  (stati) => !!get(stati, 'working')
)

// Return a string referring to the current status of the process running
export const statusMessage = createSelector(
  [processSection],
  (stati) => get(stati, 'message')
)

// Return a string detailing the error that occurred during the attempted process
export const errorMessage = createSelector(
  [processSection],
  (stati) => get(stati, 'error')
)

// Has process failed
export const failed = createSelector(
  [errorMessage],
  (error) => !!error
)

// Return a boolean representing if there is a process currently running
export const completed = createSelector(
  [processSection],
  (stati) => !!get(stati, 'completed')
)

export const allMessages = createSelector(
  [processStatus], (stati) => toJs(sortBy(s => get(s, 'section'), map(section => assoc(get(stati, section), 'section', section), keys(stati))))
)

export const messageHistory = createSelector(
  [processHistory],
  (messages) => toJs(messages) || []
)