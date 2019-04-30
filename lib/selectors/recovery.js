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
import { get } from 'mori'
import { networkSettings } from './chains'

const recoveryState = (state) => state.recovery

// Return a string representing the currently used recoveryType
export const recoveryType = createSelector(
  [networkSettings],
  (settings) => settings.recoveryType
)
// Return the current recovery seed of the current identity
export const seed = createSelector(
  [recoveryState],
  (recovery) => get(recovery, 'seed')
)
// Return the seedWords for the current identity
export const seedWords = createSelector(
  [seed],
  (words) => words ? words.split(/ /) : []
)
// Return the current wordNo from the seed string
export const wordNo = createSelector(
  [recoveryState],
  (recovery) => get(recovery, 'wordNo', 0)
)

// Return the current word from the seed string
export const currentWord = createSelector(
  [seedWords, wordNo],
  (words, i) => words.length > 0 ? words[i] : null
)