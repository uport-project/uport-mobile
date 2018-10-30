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
  saveMessage, saveError, clearMessage, clearAllMessages, startWorking, stopWorking, failProcess, completeProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import baseReducer from 'uPortMobile/lib/reducers/processStatusReducer.js'
import { toClj, toJs, hashMap } from 'mori'

const reducer = (state, action) => toJs(baseReducer(state, action))

const empty = hashMap()

const withMessages = toClj({
  unnu: {
    message: 'Woohoo',
    error: "nooooh"
  },
  sensui: {
    working: true
  }
})

it('sets message for section', () => {
  expect(reducer(empty, saveMessage('unnu', 'Looking good'))).toMatchSnapshot()
  expect(reducer(withMessages, saveMessage('unnu', 'Looking good'))).toMatchSnapshot()
  expect(reducer(withMessages, saveMessage('sensui', 'Looking good'))).toMatchSnapshot()
})

it('sets error for section', () => {
  expect(reducer(empty, saveError('unnu', 'Dang it broke'))).toMatchSnapshot()
  expect(reducer(withMessages, saveError('unnu', 'Dang it broke'))).toMatchSnapshot()
  expect(reducer(withMessages, saveError('sensui', 'Dang it broke'))).toMatchSnapshot()
})

it('clears messages for section', () => {
  expect(reducer(empty, clearMessage('unnu'))).toMatchSnapshot()
  expect(reducer(withMessages, clearMessage('unnu'))).toMatchSnapshot()
  expect(reducer(withMessages, clearMessage('sensui'))).toMatchSnapshot()
})

it('clears all messages for section', () => {
  expect(reducer(empty, clearAllMessages())).toMatchSnapshot()
  expect(reducer(withMessages, clearAllMessages())).toMatchSnapshot()
})

it('starts working for section', () => {
  expect(reducer(empty, startWorking('unnu'))).toMatchSnapshot()
  expect(reducer(withMessages, startWorking('unnu'))).toMatchSnapshot()
  expect(reducer(withMessages, startWorking('sensui'))).toMatchSnapshot()
})

it('stops working for section', () => {
  expect(reducer(empty, stopWorking('unnu'))).toMatchSnapshot()
  expect(reducer(withMessages, stopWorking('unnu'))).toMatchSnapshot()
  expect(reducer(withMessages, stopWorking('sensui'))).toMatchSnapshot()
})

it('completes process for section', () => {
  expect(reducer(empty, completeProcess('unnu'))).toMatchSnapshot()
  expect(reducer(withMessages, completeProcess('unnu'))).toMatchSnapshot()
  expect(reducer(withMessages, completeProcess('sensui'))).toMatchSnapshot()
})

it('sets error for section', () => {
  expect(reducer(empty, failProcess('unnu', 'Dang it broke'))).toMatchSnapshot()
  expect(reducer(withMessages, failProcess('unnu', 'Dang it broke'))).toMatchSnapshot()
  expect(reducer(withMessages, failProcess('sensui', 'Dang it broke'))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(baseReducer(undefined, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(baseReducer(empty, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(baseReducer(withMessages, {type: 'UNSUPPORTED'})).toEqual(withMessages)
})
