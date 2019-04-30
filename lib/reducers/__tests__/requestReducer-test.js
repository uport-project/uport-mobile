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

import reducer from 'uPortMobile/lib/reducers/requestReducer.js'
import { saveRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions.js'

it('sets request id', () => {
  expect(reducer(null, saveRequest(123))).toMatchSnapshot()
})

it('replaces request id', () => {
  expect(reducer(124, saveRequest(123))).toMatchSnapshot()
})

it('clears request id', () => {
  expect(reducer(124, clearRequest())).toMatchSnapshot()
})

it('leaves a null request id as is', () => {
  expect(reducer(null, clearRequest())).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(null)
  expect(reducer(null, {type: 'UNSUPPORTED'})).toEqual(null)
  expect(reducer(124, {type: 'UNSUPPORTED'})).toEqual(124)
})
