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
import { call, take, put } from 'redux-saga/effects'
import Permissions from 'react-native-permissions'
import { Platform } from 'react-native'
import { authorizeCamera, authorizeNotifications } from 'uPortMobile/lib/actions/authorizationActions'

export function* checkCameraPermissions () {
  const permission = yield call(Permissions.check, 'camera')
  yield put(authorizeCamera(permission))
}

export function* checkNotificationsPermissions () {
  let permission = 'authorized'
  if (Platform.OS == 'ios') {
    permission = yield call(Permissions.check, 'notification')
  }
  yield put(authorizeNotifications(permission))
}
