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
jest.mock('../../jwt', () => {
    return {
      verifyToken: () => {}
    }
  })
  
  import { select, put, call } from 'redux-saga/effects'
  import { expectSaga } from 'redux-saga-test-plan'
  import * as matchers from 'redux-saga-test-plan/matchers'
  import { throwError } from 'redux-saga-test-plan/providers'
  
  import { handle, authorize, encodeData, hashStruct, hashType } from '../eip712Request'
  
  const data = {
    types: {
        EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' }
        ],
        Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' }
        ],
    },
    primaryType: 'Mail',
    domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
        from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
    },
}
  const jwt = 'JWT'

  const payload = {
    iss: '0x1234',
    typedData: data,
    riss: '0x5678'
  }
  
  describe('#handle()', () => {
    const request = {
      target: '0x5678',
      client_id: '0x1234',
      typedData: data
    }
    it('sets up correct request', () => {
      return expectSaga(handle, payload, jwt)
        .returns(request)
        .run()
    })
  })

  describe('#authorize()', () => {
    it('encodes data correctly', () => {
      expect(encodeData(data.primaryType, data.message, data.types).toString('hex')).toEqual('a0cedeb2dc280ba39b857546d74f5549c3a1d7bdc2dd96bf881f76108e23dac2fc71e5fa27ff56c350aa531bc129ebdf613b772b6604664f5d8dbe21b85eb0c8cd54f074a4af31b4411ff6a60c9719dbd559c221c8ac3492d9d872b041d703d1b5aadf3154a261abdd9086fc627b61efca26ae5702701d05cd2305f7c52a2fc8')
    })

    it('hashes type correctly', () => {
      expect(hashType(data.primaryType, data.types)).toEqual('0xa0cedeb2dc280ba39b857546d74f5549c3a1d7bdc2dd96bf881f76108e23dac2')
    })

    it('hashes domain correctly', () => {
        expect(hashStruct('EIP712Domain', data.domain, data.types).toString('hex')).toEqual('f2cee375fa42b42143804025fc449deafd50cc031ca257e0b194a650a912090f')

    })

    it('hashes data correctly', () => {
        expect(hashStruct(data.primaryType, data.message, data.types).toString('hex')).toEqual('c52c0ee5d84264471806290a3f2c4cecfc5490626bf912d01f240d7a274b371e')
    })
  })
  