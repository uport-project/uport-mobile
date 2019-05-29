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
import { SAVE_REQUEST, CLEAR_REQUEST } from 'uPortMobile/lib/constants/RequestActionTypes'

// Requests are stored in the uport reducer. This allows you to select a request or cancel the current request
function requestReducer (state = null, action) {
  switch (action.type) {
    case SAVE_REQUEST:
      return action.activityId
    case CLEAR_REQUEST:
      return null
    default:
      return state
  }
}

export default requestReducer
