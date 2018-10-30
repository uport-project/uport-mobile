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
  seed,
  recoveryType,
  seedWords,
  currentWord
} from 'uPortMobile/lib/selectors/recovery'
import { toClj } from 'mori'

it('returns recoveryType for current identity', () => {
  expect(recoveryType({uport: toClj({
    currentIdentity: '0x0101',
    byAddress: {
      '0x0101': {
        'recoveryType': 'seed'
      }
    }
  })})).toEqual('seed')

  expect(recoveryType({uport: toClj({
    currentIdentity: '0x0101',
    byAddress: {
      '0x0101': {
        'recoveryType': 'quorumV1'
      }
    }
  })})).toEqual('quorumV1')

  expect(recoveryType({uport: toClj({
    currentIdentity: '0x0102',
    byAddress: {
      '0x0101': {
        'recoveryType': 'quorumV1'
      }
    }
  })})).toBeUndefined()

  expect(recoveryType({uport: toClj({})})).toBeUndefined()
})

it('returns seed', () => {
  expect(seed({})).toBeNull()
  expect(seed({recovery: toClj({seed: 'secret stuff'})})).toEqual('secret stuff')
})

it('returns seedWords', () => {
  expect(seedWords({})).toEqual([])
  expect(seedWords({recovery: toClj({seed: 'secret stuff'})})).toEqual(['secret', 'stuff'])
})

it('returns currentWord', () => {
  expect(currentWord({})).toBeNull()
  expect(currentWord({recovery: toClj({seed: 'secret stuff', wordNo: 0})})).toEqual('secret')
  expect(currentWord({recovery: toClj({seed: 'secret stuff', wordNo: 1})})).toEqual('stuff')
})

