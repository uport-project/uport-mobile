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
import { ADD_DATA, FLAG_NEWBIE, UNFLAG_NEWBIE, SET_ONBOARDING_NETWORK } from '../constants/OnboardingActionTypes'
import { ADD_IDENTITY } from '../constants/UportActionTypes'

// Need to Define the initialState.
const initialState = {
  userData: {},
  newbie: false
}

function onboardingReducer (state = initialState, action) {
  switch (action.type) {
    case ADD_DATA:
      const userData = { ...state.userData, ...action.data }
      return { ...state, userData }
    case FLAG_NEWBIE:
      return Object.assign({}, state, {newbie: true})
    case UNFLAG_NEWBIE:
      return Object.assign({}, state, {newbie: false})
    case SET_ONBOARDING_NETWORK:
      return Object.assign({}, state, {network: action.network})
    case ADD_IDENTITY:
      // Clearing up onboarding state in preparation for adding identity
      return initialState
    default:
      return state
  }
}

export default onboardingReducer
