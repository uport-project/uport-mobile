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
import { SET_CONTACT_LIST, SET_CONTACT_DETAILS } from 'uPortMobile/lib/constants/VcActionTypes'
import { RESET_DEVICE } from 'uPortMobile/lib/constants/GlobalActionTypes'

const initialState: ReducerState = {
  jwt: [],
  contactList: [],
  contactDetails: {},
}

function databaseReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_CONTACT_LIST:
      return { ...state, contactList: action.contactList }
    case SET_CONTACT_DETAILS:
      const contactDetails = { ...state.contactDetails }
      contactDetails[action.did] = action.claims
      return { ...state, contactDetails }
    case RESET_DEVICE:
      return { ...initialState }
    default:
      return state
  }
}

export default databaseReducer
