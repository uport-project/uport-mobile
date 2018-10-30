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
import { STORE_LAST_BLOCK_FOR_LOGS, STORE_EVENTS } from '../constants/EventLogActionTypes'

// ADDING NEW ACTIONS PLEASE READ THIS!!!!
//
// If the action should be backed up add the `, _backup` attribute to the action.
// When should it be backed up?
//
// - is it backed by the reducer and not a saga?
// - is it something that can not be refreshed from the block chain etc? (eg. no need to backup nonces and balances)
// - is it not just related to UX? Some reducers are temporary and would not make sense on multiple device

const _backup = true

export function storeLastBlockForLogs (contract, block) {
  return {
    type: STORE_LAST_BLOCK_FOR_LOGS,
    contract,
    block,
    _backup
  }
}

export function storeEvents (contract, events) {
  return {
    type: STORE_EVENTS,
    contract,
    events,
    _backup
  }
}
