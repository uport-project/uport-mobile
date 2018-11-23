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
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { select, call } from 'redux-saga/effects'

import migrate from '../UpdatePreHDRootToHD'

import {
  createIdentityAddress,
  encryptionPublicKey,
  DEFAULT_LEVEL
} from 'uPortMobile/lib/sagas/keychain'

import {
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  saveMessage,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import {
  hdRootAddress
} from 'uPortMobile/lib/selectors/hdWallet'
import {
  currentAddress
} from 'uPortMobile/lib/selectors/identities'
import {
  updateIdentity
} from 'uPortMobile/lib/actions/uportActions'

const step = MigrationStep.UpdatePreHDRootToHD

describe('UpdatePreHDRootToHD', () => {
  const address = '0xroot'
  const hdRoot = '0xhdRoot'
  const kp = {
    address: hdRoot,
    publicKey: '0xPUBLICSIGNKEY',
    hdindex: 0
  }
  const publicEncKey = '0xPUBLICENCKEY'

  describe('migrate()', () => {
    describe('Working hdwallet', () => {
      it('should update data', () => {
        return expectSaga(migrate)
          .provide([
            [select(currentAddress), address],
            [call(createIdentityAddress), kp],
            [call(encryptionPublicKey, {idIndex: 0, actIndex: 0}), publicEncKey]
          ])
          .put(updateIdentity(address, {deviceAddress: kp.address, publicKey: kp.publicKey, publicEncKey, hdindex: kp.hdindex, securityLevel: DEFAULT_LEVEL}))
          .put(saveMessage(step, 'Updated Internal Identity Record'))
          .returns(true)
          .run()
      })
    })

  })
})

