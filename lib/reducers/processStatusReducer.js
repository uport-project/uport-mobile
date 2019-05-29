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
  SAVE_MESSAGE, SAVE_ERROR, CLEAR_MESSAGE, CLEAR_ALL_MESSAGES, START_WORKING, STOP_WORKING, COMPLETE_PROCESS, FAIL_PROCESS
} from 'uPortMobile/lib/constants/ProcessStatusActionTypes'

import { assocIn, updateIn, assoc, dissoc, hashMap } from 'mori'

function processStatusReducer (state = hashMap(), action) {
  switch (action.type) {
    case SAVE_MESSAGE:
      return assocIn(updateIn(state, [action.section], (section) => dissoc(section, 'error')), [action.section, 'message'], action.message)
    case SAVE_ERROR:
      return assocIn(state, [action.section, 'error'], action.error)
    case CLEAR_MESSAGE:
      return dissoc(state, action.section)
    case CLEAR_ALL_MESSAGES:
      return hashMap()
    case START_WORKING:
      return assocIn(state, [action.section, 'working'], true)
    case STOP_WORKING:
      return updateIn(state, [action.section], (section) => dissoc(section, 'working'))
    case COMPLETE_PROCESS:
      return updateIn(state, [action.section], (section) => assoc(dissoc(section, 'working', 'message'), 'completed', true))
    case FAIL_PROCESS:
      return updateIn(state, [action.section], (section) => assoc(dissoc(section, 'working', 'message'), 'error', action.error))
    default:
      return state
  }
}

export default processStatusReducer
