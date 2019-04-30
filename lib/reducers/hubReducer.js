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
import { STORE_HUB_HEAD, QUEUE_EVENT, TAKE_QUEUED_EVENT, CLEAR_QUEUE, RESET_HUB } from '../constants/HubActionTypes'
import { START_SEED_RECOVERY } from 'uPortMobile/lib/constants/RecoveryActionTypes'
import { RESET_DEVICE } from 'uPortMobile/lib/constants/GlobalActionTypes'
import { hashMap, assoc, dissoc, updateIn, queue, conj, pop } from 'mori'
function hubReducer (state = hashMap('head', null, 'events', queue()), action) {
  switch (action.type) {
    case RESET_HUB:
    case RESET_DEVICE:
      return hashMap('head', null, 'events', queue())
    case STORE_HUB_HEAD:
      return assoc(dissoc(state, 'doNotQueue'), 'head', action.hash)
    case QUEUE_EVENT:
      return updateIn(state, ['events'], events => conj(events, action.event))
    case TAKE_QUEUED_EVENT:
      return updateIn(state, ['events'], events => pop(events))
    case CLEAR_QUEUE:
      return updateIn(state, ['events'], events => queue())
    case START_SEED_RECOVERY:
      return assoc(state, 'doNotQueue', true)
    default:
      return state
  }
}

export default hubReducer
