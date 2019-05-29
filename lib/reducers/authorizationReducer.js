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

import { AUTHORIZE_CAMERA, AUTHORIZE_PHOTOS, AUTHORIZE_NOTIFICATIONS } from 'uPortMobile/lib/constants/AuthorizationActionTypes'

const initialState = {
  cameraAuthorized: 'undetermined',
  photoAuthorized: 'undetermined',
  notificationsAuthorized: 'undetermined'
}

function authorizationReducer (state = initialState, action) {
  switch (action.type) {
    case AUTHORIZE_CAMERA:
      return { ...state, cameraAuthorized: action.status }
    case AUTHORIZE_PHOTOS:
      return { ...state, photoAuthorized: action.status }
    case AUTHORIZE_NOTIFICATIONS:
      return { ...state, notificationsAuthorized: action.status }
    default:
      return state
  }
}

export default authorizationReducer
