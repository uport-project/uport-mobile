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
import { select, spawn } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { refreshSettings } from 'uPortMobile/lib/actions/uportActions'
import { nativeSignerForAddress } from 'uPortMobile/lib/selectors/chains'
import { selectedIdentity } from 'uPortMobile/lib/selectors/identities'
import { handle, signData } from '../personalSignRequest'

const ethAddress = '0x79ecd6962e10b4acab0b039b168e59f1737006e2'
const payload = {
    iss: 'did:ethr:0x0a47a04c9582541d8e5c9d5c554a174727091a92',
    riss: `did:ethr:${ethAddress}`,
    data: 'message to sign',
    from: ethAddress,
}

const mnid = '2nbyhXvmkGUwLoR32oc2ocQ4PwhsEN5ooL3'
const request = {
    client_id: 'did:ethr:0x0a47a04c9582541d8e5c9d5c554a174727091a92',
    target: `did:ethr:${ethAddress}`,
    data: 'message to sign',
    signer: mnid,
    network: '0x1',
}

  
  describe('#handle()', () => {
    it('sets up correct request', () => {
      return expectSaga(handle, payload)
        .provide([
            [spawn(refreshSettings), undefined],
            [select(selectedIdentity, mnid), {address: mnid}],
        ])
        .returns(request)
        .run()
    })
  })

  describe('#authorize()', () => {
    it('calls personalSign from the signer with the request data', () => {
        const nativeSigner = {
            personalSign: jest.fn()
        }
        nativeSigner.personalSign.mockReturnValue({
            r: 27, s: '0x123', v: '0x456'
        })
       expectSaga(signData, request)
            .provide([
                [matchers.select.selector(nativeSignerForAddress), nativeSigner]
            ])
            .run()
        expect(nativeSigner.personalSign.mock.calls.length).toBe(1)
        expect(nativeSigner.personalSign.mock.calls[0][0]).toBe('message to sign')
    })
  })
  