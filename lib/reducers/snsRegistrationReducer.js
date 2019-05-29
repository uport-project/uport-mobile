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
import { STORE_ENDPOINT_ARN, STORE_DEVICE_TOKEN, SKIP_PUSH_NOTIFICATIONS } from 'uPortMobile/lib/constants/SnsRegistrationActionTypes'
import { RESET_DEVICE } from 'uPortMobile/lib/constants/GlobalActionTypes'

// Requests are stored in the uport reducer. This allows you to select a request or cancel the current request
function snsRegistrationReducer (state = {}, action) {
  switch (action.type) {
    case RESET_DEVICE:
      return {}
    case STORE_ENDPOINT_ARN:
      return {...state, endpointArn: action.endpointArn}
    case STORE_DEVICE_TOKEN:
      return {...state, deviceToken: action.deviceToken}
    case SKIP_PUSH_NOTIFICATIONS:
      return {...state, skippedPushNotifications: true}
    default:
      return state
  }
}

export default snsRegistrationReducer
