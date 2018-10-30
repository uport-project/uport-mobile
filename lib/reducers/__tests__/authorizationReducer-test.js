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
import reducer from 'uPortMobile/lib/reducers/authorizationReducer.js'
import { authorizeCamera, authorizePhotos } from 'uPortMobile/lib/actions/authorizationActions'

const initialState = {
  cameraAuthorized: 'undetermined',
  photoAuthorized: 'undetermined',
  notificationsAuthorized: 'undetermined'
}

const deniedState = {
  cameraAuthorized: 'denied',
  photoAuthorized: 'denied'
}

it('performs AUTHORIZE_CAMERA', () => {
  expect(reducer(initialState, authorizeCamera('authorized'))).toMatchSnapshot()
  expect(reducer(deniedState, authorizeCamera('authorized'))).toMatchSnapshot()
})

it('performs AUTHORIZE_PHOTOS', () => {
  expect(reducer(initialState, authorizePhotos('authorized'))).toMatchSnapshot()
  expect(reducer(deniedState, authorizePhotos('authorized'))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(initialState, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(deniedState, {type: 'UNSUPPORTED'})).toEqual(deniedState)
})
