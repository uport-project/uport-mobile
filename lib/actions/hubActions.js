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
import { STORE_HUB_HEAD, CATCHUP_HUB, QUEUE_EVENT, TAKE_QUEUED_EVENT, CLEAR_QUEUE, IMPORT_SNAPSHOT, RESET_HUB } from '../constants/HubActionTypes'

export function storeHubHead (hash) {
  return {
    type: STORE_HUB_HEAD,
    hash
  }
}
export function resetHub () {
  return {
    type: RESET_HUB
  }
}

export function catchupHub () {
  return {
    type: CATCHUP_HUB
  }
}

export function queueEvent (event) {
  return {
    type: QUEUE_EVENT,
    event
  }
}

export function takeQueuedEvent () {
  return {
    type: TAKE_QUEUED_EVENT
  }
}

export function clearQueue () {
  return {
    type: CLEAR_QUEUE
  }
}

export function importSnapshot (snapshot) {
  return {
    type: IMPORT_SNAPSHOT,
    snapshot
  }
}
