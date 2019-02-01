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
import { RESET_DEVICE, RELOAD_DB, PERSIST_DB, FORCE_PERSIST_DB, LOADED_DB } from '../constants/GlobalActionTypes'

export function resetDevice () {
  return { type: RESET_DEVICE }
}

export function reload (db) {
  return {
    type: RELOAD_DB,
    db
  }
}

// trigger persistence of a certain reducer (the key in the global reducer. eg 'uport')
export function persist (reducer) {
  return {
    type: PERSIST_DB,
    reducer
  }
}

// trigger persistence of a certain reducer (the key in the global reducer. eg 'uport')
export function forcePersistDB () {
  return {
    type: FORCE_PERSIST_DB
  }
}

export function loadedDB () {
  return { type: LOADED_DB }
}
