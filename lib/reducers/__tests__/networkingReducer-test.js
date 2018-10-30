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
import reducer from 'uPortMobile/lib/reducers/networkingReducer.js'
import { goOffline, goOnline, saveGasPrice } from 'uPortMobile/lib/actions/networkingActions'

const empty = {}
const online = {online: true, gasPrice: 12310011}
const offline = {online: false, gasPrice: 12310011}

it('performs MARK_OFFLINE', () => {
  expect(reducer(empty, goOffline())).toMatchSnapshot()
  expect(reducer(online, goOffline())).toMatchSnapshot()
  expect(reducer(offline, goOffline())).toMatchSnapshot()
})

it('performs MARK_ONLINE', () => {
  expect(reducer(empty, goOnline())).toMatchSnapshot()
  expect(reducer(online, goOnline())).toMatchSnapshot()
  expect(reducer(offline, goOnline())).toMatchSnapshot()
})

it('performs SAVE_GAS_PRICE', () => {
  expect(reducer(empty, saveGasPrice(1231))).toMatchSnapshot()
  expect(reducer(online, saveGasPrice(1231))).toMatchSnapshot()
  expect(reducer(offline, saveGasPrice(1231))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(reducer(empty, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(reducer(online, {type: 'UNSUPPORTED'})).toEqual(online)
  expect(reducer(offline, {type: 'UNSUPPORTED'})).toEqual(offline)
})
