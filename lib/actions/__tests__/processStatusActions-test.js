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
  saveMessage, saveError, clearMessage, clearAllMessages, startWorking, stopWorking, completeProcess, failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

it('creates a SAVE_MESSAGE action with default postback', () => {
  expect(saveMessage('unnu', 'Request succeeded')).toMatchSnapshot()
})

it('creates a SAVE_ERROR action with postback', () => {
  expect(saveError('unnu', 'request failed')).toMatchSnapshot()
})

it('creates a CLEAR_MESSAGE action without postback', () => {
  expect(clearMessage('unnu')).toMatchSnapshot()
})

it('creates a CLEAR_ALL_MESSAGES action', () => {
  expect(clearAllMessages()).toMatchSnapshot()
})

it('creates a START_WORKING action', () => {
  expect(startWorking('unnu')).toMatchSnapshot()
})

it('creates a STOP_WORKING action', () => {
  expect(stopWorking('unnu')).toMatchSnapshot()
})

it('creates a COMPLETE_PROCESS action', () => {
  expect(completeProcess('unnu')).toMatchSnapshot()
})

it('creates a FAIL_PROCESS action', () => {
  expect(failProcess('unnu', 'request failed')).toMatchSnapshot()
})
