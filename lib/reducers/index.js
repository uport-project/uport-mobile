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
import { combineReducers } from 'redux'
import authorizationReducer from './authorizationReducer'
import contactsReducer from './contactsReducer'
import eventLogReducer from './eventLogReducer'
import globalReducer from './globalReducer'
import networkingReducer from './networkingReducer'
import onboardingReducer from './onboardingReducer'
import processStatusReducer from './processStatusReducer'
import processHistoryReducer from './processHistoryReducer'
import recoveryReducer from './recoveryReducer'
import requestReducer from './requestReducer'
import snsRegistrationReducer from './snsRegistrationReducer'
import scannerReducer from './scannerReducer'
import uportReducer from './uportReducer'
import myInfoReducer from './myInfoReducer'
import flagsReducer from './flagsReducer'
import settingsReducer from './settingsReducer'
import HDWalletReducer from './HDWalletReducer'
import hubReducer from './hubReducer'
import vcReducer from './vcReducer'
import migrations from './migrationsReducer'

const appReducer = combineReducers({
  authorization: authorizationReducer,
  contacts: contactsReducer,
  networking: networkingReducer,
  onboarding: onboardingReducer,
  status: processStatusReducer,
  recovery: recoveryReducer,
  request: requestReducer,
  sns: snsRegistrationReducer,
  uport: uportReducer,
  events: eventLogReducer,
  scanner: scannerReducer,
  myInfo: myInfoReducer,
  flags: flagsReducer,
  settings: settingsReducer,
  hdwallet: HDWalletReducer,
  hub: hubReducer,
  history: processHistoryReducer,
  vc: vcReducer,
  migrations
})

const rootReducer = (state, action) => {
  return appReducer(globalReducer(state, action), action)
}

export default rootReducer
