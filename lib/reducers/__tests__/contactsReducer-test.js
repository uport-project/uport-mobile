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
import reducer from 'uPortMobile/lib/reducers/contactsReducer.js'
import { contactsSelectContact } from 'uPortMobile/lib/actions/contactsActions'

const initialState = {
  index: 0,
  key: 'contacts',
  selectedContact: false
}

const selectedState = {
  index: 0,
  key: 'contacts',
  selectedContact: '0x134133'
}

it('performs CONTACTS_SELECT_CONTACT', () => {
  expect(reducer(initialState, contactsSelectContact('0x134134'))).toMatchSnapshot()
  expect(reducer(selectedState, contactsSelectContact('0x134134'))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(initialState, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(selectedState, {type: 'UNSUPPORTED'})).toEqual(selectedState)
})
