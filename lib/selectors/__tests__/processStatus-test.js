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
import { working, offline, statusMessage, errorMessage, failed, completed, allMessages, messageHistory } from 'uPortMobile/lib/selectors/processStatus'
import { toClj, hashMap, list } from 'mori'

const empty = {
  networking: { online: true },
  status: hashMap()
}

const offlineEmpty = {
  networking: { online: false },
  status: hashMap()
}

const statusWithMessages = toClj({
  unnu: {
    message: 'Woohoo',
    error: 'nooooh'
  },
  sensui: {
    working: true
  },
  nisaba: {
    completed: true
  }
})

const history = list(
  { section: 'unnu',
    message: 'Woohoo'
  },
  { section: 'unnu',
    error: 'nooooh'
  },
  {
    section: 'sensui',
    message: 'funded'
  }
)

const withMessages = {
  networking: { online: true },
  status: statusWithMessages,
  history
}

const offlineWithMessages = {
  networking: { online: false },
  status: statusWithMessages
}

it('returns true if working', () => {
  expect(working(empty, 'unnu')).toBeFalsy()
  expect(working(withMessages, 'unnu')).toBeFalsy()
  expect(working(withMessages, 'sensui')).toBeTruthy()
  expect(working(offlineEmpty, 'sensui')).toBeFalsy()
  expect(working(offlineWithMessages, 'sensui')).toBeTruthy()
})

it('returns true if working', () => {
  expect(working(empty, 'unnu')).toBeFalsy()
  expect(working(withMessages, 'unnu')).toBeFalsy()
  expect(working(withMessages, 'sensui')).toBeTruthy()
})

it('returns status message', () => {
  expect(statusMessage(empty, 'unnu')).toBeNull()
  expect(statusMessage(withMessages, 'unnu')).toEqual('Woohoo')
  expect(statusMessage(withMessages, 'sensui')).toBeNull()
})

it('returns error message', () => {
  expect(errorMessage(empty, 'unnu')).toBeNull()
  expect(errorMessage(withMessages, 'unnu')).toEqual('nooooh')
  expect(errorMessage(withMessages, 'sensui')).toBeNull()
})

it('returns true if offline', () => {
  expect(offline(empty)).toBeFalsy()
  expect(offline(withMessages)).toBeFalsy()
  expect(offline(offlineEmpty)).toBeTruthy()
  expect(offline(offlineWithMessages)).toBeTruthy()
})

it('returns failed', () => {
  expect(failed(empty, 'unnu')).toBeFalsy()
  expect(failed(withMessages, 'unnu')).toBeTruthy()
  expect(failed(withMessages, 'sensui')).toBeFalsy()
})

it('returns completed', () => {
  expect(completed(empty, 'unnu')).toBeFalsy()
  expect(completed(withMessages, 'unnu')).toBeFalsy()
  expect(completed(withMessages, 'sensui')).toBeFalsy()
  expect(completed(withMessages, 'nisaba')).toBeTruthy()
})

it('allMessages()', () => {
  expect(allMessages(empty)).toMatchSnapshot()
  expect(allMessages(withMessages)).toMatchSnapshot()
})

it('messageHistory()', () => {
  expect(messageHistory(empty)).toMatchSnapshot()
  expect(messageHistory(withMessages)).toMatchSnapshot()
})
