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
import {
  SAVE_RECOVERY_SEED,
  HIDE_RECOVERY_SEED,
  SELECT_RECOVERY_SEED_WORD
} from 'uPortMobile/lib/constants/RecoveryActionTypes'
import {
  SWITCH_IDENTITY, RESET_IDENTITY
} from 'uPortMobile/lib/constants/UportActionTypes'

import { get, assoc, dissoc, hashMap } from 'mori'

// Requests are stored in the uport reducer. This allows you to select a request or cancel the current request
function recoveryReducer (state = hashMap(), action) {
  switch (action.type) {
    case SAVE_RECOVERY_SEED:
      return assoc(assoc(state, 'seed', action.seed), 'wordNo', 0)
    case HIDE_RECOVERY_SEED:
      return dissoc(dissoc(state, 'seed'), 'wordNo')
    case SELECT_RECOVERY_SEED_WORD:
      if (get(state, 'seed')) {
        return assoc(state, 'wordNo', action.index)
      } else {
        return state
      }
    case SWITCH_IDENTITY:
    case RESET_IDENTITY:
      return hashMap()
    default:
      return state
  }
}

export default recoveryReducer
