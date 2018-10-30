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
import HDWalletReducer from 'uPortMobile/lib/reducers/HDWalletReducer.js'
import { storeRootAddress, incIdentityIndex, incAccountIndex, seedConfirmed, accountRiskSent, resetHDWallet } from 'uPortMobile/lib/actions/HDWalletActions.js'
import { toClj, toJs } from 'mori'
import { importSnapshot } from 'uPortMobile/lib/actions/hubActions.js'

const initialState = {
}

const populatedState = {
  root: '0x1234',
  identities: [3, 2, 1]
}

const reducer = (state, action) => toJs(HDWalletReducer(toClj(state), action))

it('performs STORE_ROOT_ADDRESS', () => {
  expect(reducer(undefined, storeRootAddress('0x1234'))).toMatchSnapshot()
  expect(reducer(initialState, storeRootAddress('0x1234'))).toMatchSnapshot()
  expect(reducer(populatedState, storeRootAddress('0x1234'))).toMatchSnapshot()
  expect(reducer(populatedState, storeRootAddress('0xabcde'))).toMatchSnapshot()
})

it('performs INC_IDENTITY_INDEX', () => {
  expect(reducer(undefined, incIdentityIndex())).toMatchSnapshot()
  expect(reducer(initialState, incIdentityIndex())).toMatchSnapshot()
  expect(reducer(populatedState, incIdentityIndex())).toMatchSnapshot()
  expect(reducer(populatedState, incIdentityIndex())).toMatchSnapshot()
})

it('performs INC_ACCOUNT_INDEX', () => {
  expect(reducer(populatedState, incAccountIndex(0))).toMatchSnapshot()
  expect(reducer(populatedState, incAccountIndex(1))).toMatchSnapshot()
  expect(reducer(populatedState, incAccountIndex(2))).toMatchSnapshot()
})

it('performs SEED_CONFIRMED', () => {
  expect(reducer(populatedState, seedConfirmed())).toMatchSnapshot()
})

it('performs ACCOUNT_RISK_SENT', () => {
  expect(reducer(populatedState, accountRiskSent())).toMatchSnapshot()
})

it('performs RESET_HD_WALLET', () => {
  expect(reducer(undefined, resetHDWallet())).toMatchSnapshot()
  expect(reducer(initialState, resetHDWallet())).toMatchSnapshot()
  expect(reducer(populatedState, resetHDWallet())).toMatchSnapshot()
})

it('performs IMPORT_SNAPSHOT', () => {
  expect(reducer(undefined, importSnapshot({hdwallet: toJs(populatedState)}))).toEqual(populatedState)
  expect(reducer(initialState, importSnapshot({hdwallet: toJs(populatedState)}))).toEqual(populatedState)
  expect(reducer(populatedState, importSnapshot({hdwallet: toJs(populatedState)}))).toEqual(populatedState)
  expect(reducer(populatedState, importSnapshot({hdwallet: {}}))).toEqual(populatedState)
})

it('ignores unsupported action', () => {
  expect(reducer(undefined, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(initialState, {type: 'UNSUPPORTED'})).toEqual(initialState)
  expect(reducer(populatedState, {type: 'UNSUPPORTED'})).toEqual(populatedState)
})
