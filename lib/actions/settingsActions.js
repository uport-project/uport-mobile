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
  SET_CHANNEL,
  START_SWITCHING_DATABACKUP,
  SET_DATABACKUP,
  SET_OPT_OUT } from '../constants/SettingsActionTypes'

export function setChannel (channel) {
  return {
    type: SET_CHANNEL,
    channel
  }
}

export function startSwitchingDataBackup (isOn) {
  return {
    type: START_SWITCHING_DATABACKUP,
    isOn
  }
}

export function setDataBackup (isOn) {
  return {
    type: SET_DATABACKUP,
    isOn,
    _backup: true
  }
}

export function setAnalyticsOptOut (analyticsOptOut) {
  return {
    type: SET_OPT_OUT,
    analyticsOptOut
  }
}
