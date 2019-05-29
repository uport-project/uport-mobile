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
import { createSelector } from 'reselect'
import { get, getIn, count, toJs } from 'mori'

const PATH_VERSION = 7696500
const hdwallet = (state) => state.hdwallet
const identityIndex = (state, index) => index
export const hdAccountIndex = (state, address) => getIn(state.uport, ['byAddress', address, 'hdindex'])
export const hdIdentityIndex = (state, address) => getIn(state.uport, ['byAddress', getIn(state.uport, ['byAddress', address, 'parent']), 'hdindex'])

export const hdRootAddress = createSelector(
  [hdwallet],
  (wallet) => get(wallet, 'root') || undefined
)

export const lastIdentityIndex = createSelector(
  [hdwallet],
  (wallet) => get(wallet, 'identities') ? count(get(wallet, 'identities')) - 1 : undefined
)

export const lastAccountIndex = createSelector(
  [hdwallet, identityIndex],
  (wallet, index) => get(wallet, 'identities') ? getIn(wallet, ['identities', index]) : undefined
)

export const hdPathFor = createSelector(
  [hdIdentityIndex, hdAccountIndex],
  (id, acct) => acct !== null ? `m/${PATH_VERSION}'/${id || 0}'/${acct}'/0'` : undefined
)

export const seedConfirmedSelector = createSelector(
  [hdwallet],
  (wallet) => get(wallet, 'seedConfirmed')
)

export const accountRiskSentSelector = createSelector(
  [hdwallet],
  (wallet) => get(wallet, 'accountRiskSent')
)

export const seedAddresses = createSelector(
  [hdwallet],
  (wallet) => toJs(get(wallet, 'seedAddresses')) || undefined
)
