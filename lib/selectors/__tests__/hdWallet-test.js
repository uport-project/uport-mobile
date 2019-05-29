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
  hdRootAddress, lastIdentityIndex, lastAccountIndex, hdPathFor, seedConfirmedSelector, accountRiskSentSelector
} from 'uPortMobile/lib/selectors/hdWallet'

import { toClj } from 'mori'

const empty = {
  hdwallet: toClj({})
}

const singleIdentity = {
  hdwallet: toClj({
    root: '0x1234',
    identities: [0]
  })
}

const populatedState = {
  hdwallet: toClj({
    root: '0x1234',
    identities: [3, 2, 1],
    seedConfirmed: true,
    accountRiskSent: true
  })
}

const hdidentities = {
  uport: toClj({
    byAddress: {
      '0x1234': { hdindex: 0},
      '0x2345': { hdindex: 1, parent: '0x1234'},
      '0x3456': { hdindex: 2, parent: '0x1234'}
    }
  })
}

const legacy = {
  uport: toClj({
    byAddress: {
      '0x1234': { },
      '0x2345': { parent: '0x1234'},
      '0x3456': { parent: '0x1234'}
    }
  })
}

const legacyParentHdSubs = {
  uport: toClj({
    byAddress: {
      '0x1234': { },
      '0x2345': { hdindex: 1, parent: '0x1234'},
      '0x3456': { hdindex: 2, parent: '0x1234'}
    }
  })
}

describe('hdRootAddress()', () => {
  it('returns undefined if no root', () => {
    expect(hdRootAddress(empty)).toBeUndefined()
  })

  it('returns root if defined', () => {
    expect(hdRootAddress(populatedState)).toEqual('0x1234')
    expect(hdRootAddress(singleIdentity)).toEqual('0x1234')
  })
})

describe('lastIdentityIndex()', () => {
  it('returns undefined if no root', () => {
    expect(lastIdentityIndex(empty)).toBeUndefined()
  })

  it('returns identity index if defined', () => {
    expect(lastIdentityIndex(singleIdentity)).toEqual(0)
    expect(lastIdentityIndex(populatedState)).toEqual(2)
  })
})

describe('lastAccountIndex()', () => {
  it('returns undefined if no root', () => {
    expect(lastAccountIndex(empty)).toBeUndefined()
  })

  it('returns account index if defined', () => {
    expect(lastAccountIndex(singleIdentity, 0)).toEqual(0)
    expect(lastAccountIndex(populatedState, 0)).toEqual(3)
    expect(lastAccountIndex(populatedState, 2)).toEqual(1)
  })
})

describe('hdPathFor()', () => {
  it('returns proper HD Path for HD wallet', () => {
    expect(hdPathFor(hdidentities, '0x1234')).toEqual(`m/7696500'/0'/0'/0'`)
    expect(hdPathFor(hdidentities, '0x2345')).toEqual(`m/7696500'/0'/1'/0'`)
    expect(hdPathFor(hdidentities, '0x3456')).toEqual(`m/7696500'/0'/2'/0'`)
  })

  it('returns undefined if legacy', () => {
    expect(hdPathFor(legacy, '0x1234')).toBeUndefined()
    expect(hdPathFor(legacy, '0x2345')).toBeUndefined()
    expect(hdPathFor(legacy, '0x3456')).toBeUndefined()
  })

  it('allows mixed legacy and HD', () => {
    expect(hdPathFor(legacyParentHdSubs, '0x1234')).toBeUndefined()
    expect(hdPathFor(legacyParentHdSubs, '0x2345')).toEqual(`m/7696500'/0'/1'/0'`)
    expect(hdPathFor(legacyParentHdSubs, '0x3456')).toEqual(`m/7696500'/0'/2'/0'`)
  })
})

describe('seedConfirmed()', () => {
  it('returns undefined when seed was not confirmed', () => {
    expect(seedConfirmedSelector(singleIdentity)).toEqual(null)
  })

  it('returns true when seed was confirmed', () => {
    expect(seedConfirmedSelector(populatedState)).toEqual(true)
  })
})

describe('accountRiskSent()', () => {
  it('returns undefined when account at risk notification has not been sent', () => {
    expect(accountRiskSentSelector(singleIdentity)).toEqual(null)
  })

  it('returns true when account at risk notification has been sent', () => {
    expect(accountRiskSentSelector(populatedState)).toEqual(true)
  })
})
