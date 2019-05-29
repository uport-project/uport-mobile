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
  SAVE_MESSAGE,
  SAVE_ERROR,
  CLEAR_MESSAGE,
  CLEAR_ALL_MESSAGES,
  START_WORKING,
  STOP_WORKING,
  COMPLETE_PROCESS,
  FAIL_PROCESS
} from 'uPortMobile/lib/constants/ProcessStatusActionTypes'

export const saveMessage = (section, message) => ({type: SAVE_MESSAGE, section, message})
export const saveError = (section, error) => ({type: SAVE_ERROR, section, error})
export const clearMessage = (section) => ({type: CLEAR_MESSAGE, section})
export const clearAllMessages = () => ({type: CLEAR_ALL_MESSAGES})
export const startWorking = (section) => ({type: START_WORKING, section})
export const stopWorking = (section) => ({type: STOP_WORKING, section})
export const completeProcess = (section) => ({type: COMPLETE_PROCESS, section})
export const failProcess = (section, error) => ({type: FAIL_PROCESS, section, error})
