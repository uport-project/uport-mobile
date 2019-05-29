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
import {
  HANDLE_URL,
  HANDLE_MESSAGE,
  SELECT_REQUEST,
  SELECT_ACCOUNT_FOR_REQUEST,
  SAVE_REQUEST,
  CLEAR_REQUEST,
  AUTHORIZE_REQUEST,
  CANCEL_REQUEST,
  CALLBACK,
  AUTHORIZE_ACCOUNT
} from 'uPortMobile/lib/constants/RequestActionTypes'

export function handleURL (url, options = {}) {
  return {
    type: HANDLE_URL,
    url,
    ...{postback: false, popup: true, clientId: null},
    ...options
  }
}

export function handleMessage (message, options = {}) {
  return {
    type: HANDLE_MESSAGE,
    message,
    ...options
  }
}

export function selectRequest (activityId) {
  return {
    type: SELECT_REQUEST,
    activityId
  }
}

// Use this in a request dialog to select the correct account
export function selectAccountForRequest (activityId, account) {
  return {
    type: SELECT_ACCOUNT_FOR_REQUEST,
    activityId,
    account
  }
}

export function saveRequest (activityId) {
  return {
    type: SAVE_REQUEST,
    activityId
  }
}

export function clearRequest () {
  return {
    type: CLEAR_REQUEST
  }
}

export function authorizeRequest (activityId) {
  return {
    type: AUTHORIZE_REQUEST,
    activityId
  }
}

export function authorizeAccount (activityId, accType) {
  return {
    type: AUTHORIZE_ACCOUNT,
    activityId: activityId,
    accType: accType
  }
}

export function cancelRequest (activityId) {
  return {
    type: CANCEL_REQUEST,
    activityId
  }
}

export function callback (request) {
  return {
    type: CALLBACK,
    request
  }
}
