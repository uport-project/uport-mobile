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
import reducer from 'uPortMobile/lib/reducers/myInfoReducer.js'
import { editMyInfo, saveShareToken } from 'uPortMobile/lib/actions/myInfoActions'

const initialState = {
  changed: {}
}

const editedState = {
  changed: {
    name: 'Isaac Hayes',
    phone: '555-LOVE'
  }
}

it('performs EDIT_MY_INFO', () => {
  expect(reducer(initialState, editMyInfo({name: 'Barrington Levi'}))).toMatchSnapshot()
  expect(reducer(editedState, editMyInfo({name: 'Barrington Levi'}))).toMatchSnapshot()
})

it('performs SAVE_SHARE_TOKEN', () => {
  expect(reducer(initialState, saveShareToken('0x1234', 'JWT'))).toMatchSnapshot()
  expect(reducer(editedState, saveShareToken('0x1234', 'JWT'))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(initialState, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(editedState, {type: 'UNSUPPORTED'})).toEqual(editedState)
})
