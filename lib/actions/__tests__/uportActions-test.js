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
import { createIdentity, createAccount, verificationSMS, verificationCall, verifyPhoneCode, storeIdentity, storeSubAccount, addIdentity,
         switchIdentity, addClaims, removeClaims, storeConnection, removeConnection, saveNonce, saveMetaNonce, addRecoveryAddress,
         saveBalance, saveFuel, incNonce, refreshNonce, refreshBalance, refreshFuelBalance, refreshSettings,
         resetIdentity, removeIdentity, refreshExternalUport, createEncryptionKey, storeEncryptionKey, storePututuToken, storeFuelToken, storeActivity, updateActivity, openActivity,
         removeActivity, updateInteractionStats, storeAttestation, removeAttestation, saveIpfsProfile,
         addImage, storeExternalUport, storeCurrentIdentity, saveSegmentId, addImageOnboarding, savePublicUport, callFaucet,
         addPendingAttestation, removePendingAttestation, storeKeyChainLevel } from 'uPortMobile/lib/actions/uportActions.js'

const address = '0x0102030405'
const mockedTimeStamp = 1516134091907
it('creates a CREATE_IDENTITY action', () => {
  expect(createIdentity()).toMatchSnapshot()
})

it('creates a CREATE_ACCOUNT action', () => {
  expect(createAccount('0xabcde', 'rinkeby', '0xgnosis')).toMatchSnapshot()
  expect(createAccount('0xabcde', 'kovan')).toMatchSnapshot()
})

it('creates a VERIFY_BY_SMS action', () => {
  expect(verificationSMS('+18001234')).toMatchSnapshot()
})

it('creates a VERIFY_BY_CALL action', () => {
  expect(verificationCall('+18001234')).toMatchSnapshot()
})

it('creates a VERIFY_PHONE_CODE action', () => {
  expect(verifyPhoneCode('0x01234', '123456')).toMatchSnapshot()
})

it('creates a ADD_IDENTITY action', () => {
  expect(addIdentity('kovan')).toMatchSnapshot()
})

it('creates a STORE_IDENTITY action', () => {
  expect(storeIdentity({address: '0x123'})).toMatchSnapshot()
})

it('creates a STORE_SUB_ACCOUNT action', () => {
  expect(storeSubAccount({address: '0x123'})).toMatchSnapshot()
})

it('creates a STORE_CURRENT_IDENTITY action', () => {
  expect(storeCurrentIdentity('0x123')).toMatchSnapshot()
})

it('creates a SAVE_SEGMENT_ID action', () => {
  expect(saveSegmentId('0x123')).toMatchSnapshot()
})

it('creates a SWITCH_IDENTITY action', () => {
  expect(switchIdentity('0x123')).toMatchSnapshot()
})

it('creates a ADD_CLAIMS action', () => {
  expect(addClaims(address, {name: 'Bob'})).toMatchSnapshot()
})

it('creates a ADD_IMAGE action', () => {
  expect(addImage(address, 'avatar', {uri: 'data:....'})).toMatchSnapshot()
})

it('creates a ADD_IMAGE_ONBOARDING action', () => {
  expect(addImageOnboarding({'avatar': {uri: 'data:....'}})).toMatchSnapshot()
})

it('creates a REMOVE_CLAIMS action', () => {
  expect(removeClaims(address, 'name')).toMatchSnapshot()
})

it('creates a STORE_CONNECTION action', () => {
  expect(storeConnection(address, 'knows', '0x123')).toMatchSnapshot()
})

it('creates a REMOVE_CONNECTION action', () => {
  expect(removeConnection(address, 'knows', '0x123')).toMatchSnapshot()
})

it('creates a STORE_EXTERNAL_UPORT action', () => {
  expect(storeExternalUport('0x123', {name: 'Bob'})).toMatchSnapshot()
})

it('creates a SAVE_NONCE action', () => {
  expect(saveNonce(address, 2)).toMatchSnapshot()
})

it('creates a SAVE_META_NONCE action', () => {
  expect(saveMetaNonce(address, 5, mockedTimeStamp)).toMatchSnapshot()
})

it('creates a SAVE_BALANCE action', () => {
  expect(saveBalance(address, 2)).toMatchSnapshot()
})

it('creates a SAVE_FUEL action', () => {
  expect(saveFuel(address, 2)).toMatchSnapshot()
})

it('creates a INC_NONCE action', () => {
  expect(incNonce(address)).toMatchSnapshot()
})

it('creates a REFRESH_NONCE action', () => {
  expect(refreshNonce(address)).toMatchSnapshot()
})

it('creates a REFRESH_BALANCE action', () => {
  expect(refreshBalance(address)).toMatchSnapshot()
})

it('creates a REFRESH_FUEL_BALANCE action', () => {
  expect(refreshFuelBalance(address)).toMatchSnapshot()
})

it('creates a REFRESH_SETTINGS action', () => {
  expect(refreshSettings(address)).toMatchSnapshot()
})

it('creates a RESET_IDENTITY action', () => {
  expect(resetIdentity()).toMatchSnapshot()
})

it('creates a REMOVE_IDENTITY action', () => {
  expect(removeIdentity('0x123')).toMatchSnapshot()
})

it('creates a REFRESH_EXTERNAL_UPORT action', () => {
  expect(refreshExternalUport('0x123')).toMatchSnapshot()
})

it('creates a CREATE_ENCRYPTION_KEY action', () => {
  expect(createEncryptionKey(address)).toMatchSnapshot()
})

it('creates a STORE_ENCRYPTION_KEY action', () => {
  expect(storeEncryptionKey(address, '0x123afdasdfasdfasdf')).toMatchSnapshot()
})

it('creates a STORE_PUTUTU_TOKEN action', () => {
  expect(storePututuToken(address, '0x123afdasdfasdfasdf')).toMatchSnapshot()
})

it('creates a STORE_FUEL_TOKEN action', () => {
  expect(storeFuelToken(address, '0x123afdasdfasdfasdf')).toMatchSnapshot()
})

it('creates a ADD_RECOVERY_ADDRESS action', () => {
  expect(addRecoveryAddress('0x123afdasdfasdfasdf', '0x0202', 'bip39')).toMatchSnapshot()
})

it('creates a STORE_ACTIVITY action', () => {
  expect(storeActivity({id: 112313123, target: '0x0101'})).toMatchSnapshot()
})

it('creates a UPDATE_ACTIVITY action', () => {
  expect(updateActivity(112313123, {hash: '0x123'})).toMatchSnapshot()
})

it('creates a OPEN_ACTIVITY action', () => {
  expect(openActivity(112313123)).toMatchSnapshot()
})

it('creates a REMOVE_ACTIVITY action', () => {
  expect(removeActivity(112313123)).toMatchSnapshot()
})

it('creates a UPDATE_INTERACTION_STATS action', () => {
  expect(updateInteractionStats(address, '0x0123', 'sign')).toMatchSnapshot()
})

it('creates an STORE_ATTESTATION action', () => {
  expect(storeAttestation({token: '0x0000'})).toMatchSnapshot()
})

it('creates a REMOVE_ATTESTATION action', () => {
  expect(removeAttestation(address, '0xdsasdfasdf')).toMatchSnapshot()
})

it('creates an ADD_PENDING_ATTESTATION action', () => {
  expect(addPendingAttestation('0x123afdasdfasdfasdf', '0xdsasdfasdf', 'name')).toMatchSnapshot()
  expect(addPendingAttestation('0x123afdasdfasdfasdf', '0xdsasdfasdf', 'name', {applicant_id: 1234})).toMatchSnapshot()
})

it('creates an REMOVE_PENDING_ATTESTATION action', () => {
  expect(removePendingAttestation('0x123afdasdfasdfasdf', '0xdsasdfasdf', 'name')).toMatchSnapshot()
})

it('creates a SAVE_PUBLIC_UPORT action', () => {
  expect(savePublicUport('0x123')).toMatchSnapshot()
})

it('creates a CALL_FAUCET action', () => {
  expect(callFaucet('0x123')).toMatchSnapshot()
})

it('creates a SAVE_IPFS_PROFILE action', () => {
  expect(saveIpfsProfile(address, 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y7o')).toMatchSnapshot()
})

it('creates a STORE_KEYCHAIN_LEVEL action', () => {
  expect(storeKeyChainLevel('touch')).toMatchSnapshot()
})
