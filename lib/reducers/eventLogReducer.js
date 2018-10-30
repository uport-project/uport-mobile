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
import { STORE_LAST_BLOCK_FOR_LOGS, STORE_EVENTS } from '../constants/EventLogActionTypes'
import { RESET_DEVICE } from 'uPortMobile/lib/constants/GlobalActionTypes'
import { hashMap, assocIn, updateIn, concat, toClj, vector } from 'mori'

function eventLogReducer (state = hashMap(), action) {
  switch (action.type) {
    case RESET_DEVICE:
      return hashMap()
    case STORE_LAST_BLOCK_FOR_LOGS:
      // console.log(action)
      return assocIn(state, [action.contract, 'block'], action.block.toString(16))
    case STORE_EVENTS:
      // console.log(action)
      return updateIn(state, [action.contract, 'events'], (events) => concat(events || vector(), toClj(action.events)))
    default:
      return state
  }
}

export default eventLogReducer
