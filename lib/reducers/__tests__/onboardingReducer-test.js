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
import reducer from 'uPortMobile/lib/reducers/onboardingReducer.js'
import {
  addData,
  flagNewbie,
  unflagNewbie,
  setOnboardingNetwork
} from 'uPortMobile/lib/actions/onboardingActions'
import { addIdentity } from 'uPortMobile/lib/actions/uportActions'
const initialState = {
  userData: {},
  newbie: false
}

const withData = {
  userData: {name: 'Isaac Hayes'},
  newbie: true,
  network: '0x3'
}

it('performs ADD_DATA', () => {
  expect(reducer(initialState, addData({name: 'Barrington Levi'}))).toMatchSnapshot()
  expect(reducer(withData, addData({name: 'Barrington Levi'}))).toMatchSnapshot()
})

it('performs FLAG_NEWBIE', () => {
  expect(reducer(initialState, flagNewbie())).toMatchSnapshot()
  expect(reducer(withData, flagNewbie())).toMatchSnapshot()
})

it('performs UNFLAG_NEWBIE', () => {
  expect(reducer(initialState, unflagNewbie())).toMatchSnapshot()
  expect(reducer(withData, unflagNewbie())).toMatchSnapshot()
})

it('performs SET_ONBOARDING_NETWORK', () => {
  expect(reducer(initialState, setOnboardingNetwork('0x42'))).toMatchSnapshot()
  expect(reducer(withData, setOnboardingNetwork('0x42'))).toMatchSnapshot()
})

it('performs ADD_IDENTITY', () => {
  expect(reducer(initialState, addIdentity())).toEqual(initialState)
  expect(reducer(withData, addIdentity())).toEqual(initialState)
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(initialState, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(withData, {type: 'UNSUPPORTED'})).toEqual(withData)
})
