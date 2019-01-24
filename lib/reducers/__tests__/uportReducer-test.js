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
import uportReducer from 'uPortMobile/lib/reducers/uportReducer'
import { assocIn, toJs, toClj, set, hashMap } from 'mori'
import { sha3_256 } from 'js-sha3'
import { storeIdentity,
         storeSubAccount,
         updateIdentity,
         switchIdentity,
         addClaims,
         removeClaims,
         storeConnection,
         removeConnection,
         saveNonce,
         saveMetaNonce,
         saveBalance,
         saveFuel,
         incNonce,
         removeIdentity,
         storeEncryptionKey,
         storePututuToken,
         storeFuelToken,
         addRecoveryAddress,
         storeActivity,
         updateActivity,
         openActivity,
         removeActivity,
         updateInteractionStats,
         storeExternalUport,
         storeAttestation,
         removeAttestation,
         saveIpfsProfile,
         addImage,
         reload,
         storeCurrentIdentity,
         saveSegmentId,
         addImageOnboarding,
         savePublicUport,
         callFaucet,
         addPendingAttestation,
         removePendingAttestation,
         storeKeyChainLevel
        } from 'uPortMobile/lib/actions/uportActions.js'

import { importSnapshot } from 'uPortMobile/lib/actions/hubActions.js'

// To make snapshots more readable
function reducer (initial, action) {
  return toJs(uportReducer(initial, action))
}

const empty = hashMap()
const address = '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
const simpleIdentity = {
  controllerAddress: '0xff708db3af14fbd9b125ac88d3f7c1c03e6bc36f',
  deviceAddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
  publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
  network: 'ropsten',
  recoveryAddress: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  address,
  own: {
    name: 'Alice',
    phone: '555-555-5555',
    connections: {
      knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01']
    }
  }
}

const otherIdentity = {
  network: 'kovan',
  address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
  own: {
    name: 'Alice Kovan',
    phone: '555-555-5555',
    connections: {}
  }
}

const subIdentity = {
  network: 'kovan',
  address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
  parent: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
  controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6b',
  createdAt: 1492997058053,
  updatedAt: 1492997058053
}

const withIdentity = uportReducer(null, storeIdentity(simpleIdentity))
const withMultipleIdentities = uportReducer(withIdentity, storeIdentity(otherIdentity))
const mockedTimeStamp = 1516134092003
it('stores the new identity correctly', () => {
  expect(reducer(null, storeIdentity(simpleIdentity))).toMatchSnapshot()
  expect(reducer(withIdentity, storeIdentity(otherIdentity))).toMatchSnapshot()
})

it('stores currentIdentity', () => {
  expect(reducer(null, storeCurrentIdentity(address))).toMatchSnapshot()
  expect(reducer(withIdentity, storeCurrentIdentity(address))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, storeCurrentIdentity('34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'))).toMatchSnapshot()
})

it('updates identity data', () => {
  expect(reducer(null, updateIdentity(address, {hello: true}))).toMatchSnapshot()
  expect(reducer(withIdentity, updateIdentity(address, {hello: true}))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, updateIdentity('34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX', {hello: true}))).toMatchSnapshot()
})

it('stores a new sub identity correctly', () => {
  expect(reducer(null, storeSubAccount(subIdentity))).toMatchSnapshot()
  expect(reducer(withIdentity, storeSubAccount(subIdentity))).toMatchSnapshot()
  expect(reducer(uportReducer(withIdentity, storeSubAccount(subIdentity)),
    storeSubAccount({...subIdentity, createdAt: 1492997059053, updatedAt: 1492997059053}))).toMatchSnapshot()
})

it('switches identity', () => {
  expect(reducer(null, switchIdentity('0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'))).toMatchSnapshot()
  expect(reducer(withIdentity, switchIdentity('0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, switchIdentity('0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'))).toMatchSnapshot()
})

it('removes claims', () => {
  expect(reducer(withIdentity, removeClaims(address, 'name'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, removeClaims(address, 'name'))).toMatchSnapshot()
  expect(reducer(withIdentity, removeClaims(address, 'ssno'))).toMatchSnapshot()
})

it('adds claims', () => {
  expect(reducer(withIdentity, addClaims(address, {name: 'John Dillinger', ssno: '0001000'}))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, addClaims(address, {name: 'John Dillinger', ssno: '0001000'}))).toMatchSnapshot()
  expect(reducer(withIdentity, addClaims(address, {ssno: '0001000'}))).toMatchSnapshot()
  expect(reducer(withIdentity, addClaims(address, {}))).toMatchSnapshot()
})

it('stores connection', () => {
  expect(reducer(withIdentity, storeConnection(address, 'worksWith', '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, storeConnection(address, 'worksWith', '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777'))).toMatchSnapshot()
})

it('removes connection', () => {
  expect(reducer(withIdentity, removeConnection(address, 'knows', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, removeConnection(address, 'knows', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'))).toMatchSnapshot()
})

it('saves nonce in identity', () => {
  expect(reducer(withIdentity, saveNonce(address, 2))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, saveNonce(address, 2))).toMatchSnapshot()
})

it('saves meta nonce in identity', () => {
  expect(reducer(withIdentity, saveMetaNonce(address, 5, mockedTimeStamp))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, saveMetaNonce(address, 5, mockedTimeStamp))).toMatchSnapshot()
})

it('saves balance in identity', () => {
  expect(reducer(withIdentity, saveBalance(address, 2))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, saveBalance(address, 2))).toMatchSnapshot()
})

it('saves fuel in identity', () => {
  expect(reducer(withIdentity, saveFuel(address, 2))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, saveFuel(address, 2))).toMatchSnapshot()
})

it('saves ipfsHash in identity', () => {
  expect(reducer(withIdentity, saveIpfsProfile(address, 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y7o'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, saveIpfsProfile(address, 'QmdNm7VZTNnux2LS6vMJXLZ5BGb3rPJV9mF5jA72uq9y7o'))).toMatchSnapshot()
})

it('increases nonce', () => {
  expect(reducer(withIdentity, incNonce(address))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, incNonce(address))).toMatchSnapshot()
})

it('save segment id', () => {
  expect(reducer(withIdentity, saveSegmentId('12313'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, saveSegmentId('12313'))).toMatchSnapshot()
})

it('removes identity', () => {
  expect(reducer(withIdentity, removeIdentity('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, removeIdentity('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, removeIdentity(otherIdentity.address))).toMatchSnapshot()
})

it('stores encryption key', () => {
  expect(reducer(withIdentity, storeEncryptionKey(address, '0x123afdasdfasdfasdf'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, storeEncryptionKey(address, '0x123afdasdfasdfasdf'))).toMatchSnapshot()
})

it('stores pututu token', () => {
  expect(reducer(withIdentity, storePututuToken(address, '0x123afdasdfasdfasdf'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, storePututuToken(address, '0x123afdasdfasdfasdf'))).toMatchSnapshot()
})

it('stores fuel token', () => {
  expect(reducer(withIdentity, storeFuelToken(address, '0x123afdasdfasdfasdf'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, storeFuelToken(address, '0x123afdasdfasdfasdf'))).toMatchSnapshot()
})

it('stores addRecoveryAddress', () => {
  expect(reducer(withIdentity, addRecoveryAddress('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a', '0x123afdasdfasdfasdf', 'bip39'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, addRecoveryAddress('0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a', '0x123afdasdfasdfasdf', 'bip39'))).toMatchSnapshot()
})

it('stores activity', () => {
  expect(reducer(withIdentity, storeActivity({id: 112313123, target: address}))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, storeActivity({id: 112313123, target: address}))).toMatchSnapshot()
})

const withActivity = uportReducer(withIdentity, storeActivity({id: '112313123', target: address}))
const withActivityAndMultipleIdentities = uportReducer(withMultipleIdentities, storeActivity({id: '112313123', target: address}))
it('updates activity', () => {
  expect(reducer(withActivity, updateActivity(112313123, {hash: '0x123'}))).toMatchSnapshot()
  expect(reducer(withActivityAndMultipleIdentities, updateActivity(112313123, {hash: '0x123'}))).toMatchSnapshot()
  expect(reducer(withActivity, updateActivity(112313124, {hash: '0x123'}))).toEqual(toJs(withActivity))
})

const withOpenedActivity = uportReducer(withIdentity, storeActivity({id: '112313123', target: address, opened: true}))
const withOpenedActivityAndMultipleIdentities = uportReducer(withMultipleIdentities, storeActivity({id: '112313123', target: address, opened: true}))

it('opens activity', () => {
  expect(reducer(withActivity, openActivity(112313123))).toMatchSnapshot()
  expect(reducer(withOpenedActivity, openActivity(112313123))).toMatchSnapshot()
  expect(reducer(withActivityAndMultipleIdentities, openActivity(112313123))).toMatchSnapshot()
  expect(reducer(withOpenedActivityAndMultipleIdentities, openActivity(112313123))).toMatchSnapshot()
  expect(reducer(withActivity, openActivity(112313124))).toEqual(toJs(withActivity))
})

it('removes activity', () => {
  expect(reducer(withActivity, removeActivity(112313123))).toMatchSnapshot()
  expect(reducer(withActivityAndMultipleIdentities, removeActivity(112313123))).toMatchSnapshot()
  expect(reducer(withActivity, removeActivity(112313124))).toEqual(toJs(withActivity))
})

it('adds a number to the "request" stats for an address', () => {
  expect(reducer(withIdentity, updateInteractionStats(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'request'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, updateInteractionStats(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'request'))).toMatchSnapshot()
})

const withStats = uportReducer(withIdentity, updateInteractionStats(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'request'))
const withStatsAndMultipleIdentities = uportReducer(withMultipleIdentities, updateInteractionStats(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'request'))

it('adds a number to the "request" stats for an address weve request before', () => {
  expect(reducer(withStats, updateInteractionStats(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'request'))).toMatchSnapshot()
  expect(reducer(withStatsAndMultipleIdentities, updateInteractionStats(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'request'))).toMatchSnapshot()
})

it('adds a number to the "sign" stats for an address weve request before', () => {
  expect(reducer(withStats, updateInteractionStats(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'sign'))).toMatchSnapshot()
  expect(reducer(withStatsAndMultipleIdentities, updateInteractionStats(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'sign'))).toMatchSnapshot()
})

const attestation = {
  iss: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
  sub: address,
  claims: {name: 'Bob Smith'},
  token: 'SECRET_JWT_TOKEN'
}

const attestationHash = sha3_256(attestation.token)

it('stores an attestation to the attestations ledger', () => {
  expect(reducer(withIdentity, storeAttestation(attestation))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, storeAttestation(attestation))).toMatchSnapshot()
})

it('stores the attestation using its hash', () => {
  const state = reducer(withIdentity, storeAttestation(attestation))
  expect(state.byAddress[simpleIdentity.address].attestations[attestationHash]).toEqual(attestation)
})

const withAttestations = uportReducer(withIdentity, storeAttestation(attestation))
const withAttestationsAndMultipleIdentities = uportReducer(withMultipleIdentities, storeAttestation(attestation))

it('removes the attestation using its hash', () => {
  const state = reducer(withAttestations, removeAttestation(address, attestationHash))
  expect(state.byAddress[simpleIdentity.address].attestations[attestationHash]).toBeFalsy()
})

it('removes the attestation from ledger', () => {
  expect(reducer(withAttestations, removeAttestation(address, attestationHash))).toMatchSnapshot()
  expect(reducer(withAttestationsAndMultipleIdentities, removeAttestation(address, attestationHash))).toMatchSnapshot()
})

it('stores a pending attestation to the attestations ledger', () => {
  expect(reducer(withIdentity, addPendingAttestation(address, attestation.iss, 'name'))).toMatchSnapshot()
  expect(reducer(withIdentity, addPendingAttestation(address, attestation.iss, 'name', {applicant_id: 1234}))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, addPendingAttestation(address, attestation.iss, 'name'))).toMatchSnapshot()
})

const withPendingAttestations = uportReducer(withIdentity, addPendingAttestation(address, attestation.iss, 'name', {applicant_id: 1234}))
const withPendingAttestationsAndMultipleIdentities = uportReducer(withMultipleIdentities, addPendingAttestation(address, attestation.iss, 'name'))

it('updates existing ones if options change', () => {
  expect(reducer(withPendingAttestations, addPendingAttestation(address, attestation.iss, 'name', {failed: 'You are on OFAC list'}))).toMatchSnapshot()
  expect(reducer(withPendingAttestationsAndMultipleIdentities, addPendingAttestation(address, attestation.iss, 'name', {failed: 'You are on OFAC list'}))).toMatchSnapshot()
})

it('adds ones with different parameters', () => {
  expect(reducer(withPendingAttestations, addPendingAttestation(address, attestation.iss, 'email'))).toMatchSnapshot()
  expect(reducer(withPendingAttestationsAndMultipleIdentities, addPendingAttestation(address, '0x8dd7ef5c99be7a454b4a9869683a3a394fde9778', 'name'))).toMatchSnapshot()
})

it('removes pending attestations', () => {
  expect(reducer(withPendingAttestations, removePendingAttestation(address, attestation.iss, 'name'))).toMatchSnapshot()
  expect(reducer(withPendingAttestationsAndMultipleIdentities, removePendingAttestation(address, attestation.iss, 'name'))).toMatchSnapshot()
  expect(reducer(withIdentity, removePendingAttestation(address, attestation.iss, 'name'))).toMatchSnapshot()
  expect(reducer(withMultipleIdentities, removePendingAttestation(address, attestation.iss, 'name'))).toMatchSnapshot()
})

// it('removes the pending attestation', () => {
//   const state = reducer(withAttestations, removeAttestation(address, attestationHash))
//   expect(state.byAddress[simpleIdentity.address].attestations[attestationHash]).toBeFalsy()
// })

// it('removes the pending attestation from ledger', () => {
//   expect(reducer(withAttestations, removeAttestation(address, attestationHash))).toMatchSnapshot()
//   expect(reducer(withAttestationsAndMultipleIdentities, removeAttestation(address, attestationHash))).toMatchSnapshot()
// })

const withExternal = assocIn(
  withIdentity,
  ['external', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'], toClj({name: 'Bob'}))

it('stores external uport', () => {
  expect(reducer(withIdentity, storeExternalUport('0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', {name: 'Bob'}))).toMatchSnapshot()
  expect(reducer(withExternal, storeExternalUport('0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', {name: 'Bob'}))).toMatchSnapshot()
  expect(reducer(withExternal, storeExternalUport('0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', {name: 'Roberto Waters', country: 'ug'}))).toMatchSnapshot()
  expect(reducer(withExternal, storeExternalUport('0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', {country: 'ug'}))).toMatchSnapshot()
})

it('stores keychain level', () => {
  expect(reducer(undefined, storeKeyChainLevel('touch'))).toMatchSnapshot()
  expect(reducer(empty, storeKeyChainLevel('touch'))).toMatchSnapshot()
  expect(reducer(withIdentity, storeKeyChainLevel('touch'))).toMatchSnapshot()
})

it('ignores unsupported action', () => {
  expect(uportReducer(undefined, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(uportReducer(empty, {type: 'UNSUPPORTED'})).toEqual(empty)
  expect(uportReducer(withIdentity, {type: 'UNSUPPORTED'})).toEqual(withIdentity)
})

it('imports snapshot', () => {
  expect(reducer(undefined, importSnapshot({uport: toJs(withMultipleIdentities)}))).toEqual(toJs(withMultipleIdentities))
  expect(reducer(withMultipleIdentities, importSnapshot({uport: toJs(withMultipleIdentities)}))).toEqual(toJs(withMultipleIdentities))
  expect(reducer(withIdentity, importSnapshot({uport: toJs(withMultipleIdentities)}))).toEqual(toJs(withMultipleIdentities))
  expect(reducer(withIdentity, importSnapshot({uport: {}}))).toEqual(toJs(withIdentity))
})