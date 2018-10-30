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
import { CREATE_ACCOUNT, CREATE_IDENTITY, ADD_IDENTITY, STORE_SUB_ACCOUNT, STORE_IDENTITY, SWITCH_IDENTITY, ADD_OWN_CLAIMS, REMOVE_OWN_CLAIM, STORE_EXTERNAL_UPORT,
         FETCH_NONCE, FETCH_BALANCE, FETCH_FUEL_BALANCE, REFRESH_SETTINGS, REFRESH_EXTERNAL_UPORT, STORE_FUEL_TOKEN,
         INCREASE_NONCE, SAVE_NONCE, SAVE_META_NONCE, SAVE_BALANCE, SAVE_FUEL_BALANCE, RESET_IDENTITY, REMOVE_IDENTITY, VERIFY_BY_SMS, VERIFY_BY_PHONE,
         VERIFY_PHONE_CODE, VERIFY_RECAPTCHA, VERIFY_FUNCAPTCHA, STORE_CONNECTION, REMOVE_CONNECTION, STORE_ACTIVITY, OPEN_ACTIVITY,
         UPDATE_ACTIVITY, REMOVE_ACTIVITY, UPDATE_INTERACTION_STATS, ADD_IMAGE, ADD_IMAGE_ONBOARDING, SAVE_IPFS_PROFILE, ADD_RECOVERY_ADDRESS,
         ADD_ATTESTATION, STORE_ATTESTATION, REMOVE_ATTESTATION, SAVE_PUBLIC_UPORT, CALL_FAUCET, SAVE_SEGMENT_ID, STORE_CURRENT_IDENTITY,
         CREATE_ENCRYPTION_KEY, STORE_ENCRYPTION_KEY, STORE_PUTUTU_TOKEN, ADD_PENDING_ATTESTATION, REMOVE_PENDING_ATTESTATION, STORE_KEYCHAIN_LEVEL, STORE_SECURITY_LEVEL } from 'uPortMobile/lib/constants/UportActionTypes'

// ADDING NEW ACTIONS PLEASE READ THIS!!!!
//
// If the action should be backed up add the `, _backup` attribute to the action.
// When should it be backed up?
//
// - is it backed by the reducer and not a saga?
// - is it something that can not be refreshed from the block chain etc? (eg. no need to backup nonces and balances)
// - is it not just related to UX? Some reducers are temporary and would not make sense on multiple device

const _backup = true

// For Creating new Identities there are 2 options:

// Create an identity (root identity)
export function createIdentity () {
  return { type: CREATE_IDENTITY }
}

// Create an account
export function createAccount (parent, network, clientId) {
  return { parent, network, clientId, type: CREATE_ACCOUNT }
}

// Add a new identity
export function addIdentity (network) {
  return { type: ADD_IDENTITY, network }
}

// or verificationSMS and call Unnu with token
// Use the two actions in sequence
// 1. Use to start phone verification saga
export function verificationSMS (phone) {
  return { type: VERIFY_BY_SMS, phone }
}

// Have the user receive a call instead
export function verificationCall () {
  return { type: VERIFY_BY_PHONE }
}

// User enters code or follows URL
// 2. Verify Phone
export function verifyPhoneCode (address, code) {
  return { type: VERIFY_PHONE_CODE, address, code }
}

export function verifyReCaptcha (address, reCaptchaToken) {
  return { type: VERIFY_RECAPTCHA, address, reCaptchaToken }
}

export function verifyFunCaptcha (address, funCaptchaToken) {
  return { type: VERIFY_FUNCAPTCHA, address, funCaptchaToken }
}

export function createEncryptionKey (address) {
  return {
    type: CREATE_ENCRYPTION_KEY,
    address
  }
}

export function storeIdentity (identity) {
  return {
    type: STORE_IDENTITY,
    identity,
    _backup
  }
}

export function storeSubAccount (identity) {
  return {
    type: STORE_SUB_ACCOUNT,
    identity,
    _backup
  }
}

export function storeCurrentIdentity (address) {
  return {
    type: STORE_CURRENT_IDENTITY,
    address,
    _backup
  }
}

export function saveSegmentId (segmentId) {
  return {
    type: SAVE_SEGMENT_ID,
    segmentId,
    _backup
  }
}

export function switchIdentity (address) {
  return {
    type: SWITCH_IDENTITY,
    address
  }
}

export function addClaims (address, claims) {
  return {
    type: ADD_OWN_CLAIMS,
    address,
    claims,
    _backup
  }
}

export function addImage (address, claimType, image) {
  return {
    type: ADD_IMAGE,
    address,
    claimType,
    image
  }
}

export function addImageOnboarding (avatarObj) {
  return {
    type: ADD_IMAGE_ONBOARDING,
    avatarObj
  }
}

export function removeClaims (address, claimType) {
  return {
    type: REMOVE_OWN_CLAIM,
    address,
    claimType,
    _backup
  }
}

export function storeConnection (address, connectionType, connection) {
  return {
    type: STORE_CONNECTION,
    address,
    connectionType,
    connection,
    _backup
  }
}

export function removeConnection (address, connectionType, connection) {
  return {
    type: REMOVE_CONNECTION,
    connectionType,
    address,
    connection,
    _backup
  }
}

export function storeExternalUport (address, profile) {
  return {
    type: STORE_EXTERNAL_UPORT,
    address,
    profile,
    _backup
  }
}

export function saveNonce (address, nonce) {
  return {
    type: SAVE_NONCE,
    address,
    nonce
  }
}

export function saveMetaNonce (address, nonce, timestamp) {
  return {
    type: SAVE_META_NONCE,
    address,
    nonce,
    timestamp
  }
}

export function saveBalance (address, balance, usdBalance) {
  return {
    type: SAVE_BALANCE,
    address,
    balance,
    usdBalance
  }
}

export function saveFuel (address, balance) {
  return {
    type: SAVE_FUEL_BALANCE,
    address,
    balance
  }
}

export function incNonce (address) {
  return { type: INCREASE_NONCE, address }
}

export function refreshNonce (address) {
  return { type: FETCH_NONCE, address }
}

export function refreshBalance (address) {
  return { type: FETCH_BALANCE, address }
}

export function refreshFuelBalance (address) {
  return { type: FETCH_FUEL_BALANCE, address }
}

export function refreshSettings (address) {
  return { type: REFRESH_SETTINGS, address }
}

export function resetIdentity () {
  return { type: RESET_IDENTITY }
}

export function removeIdentity (address) {
  return { type: REMOVE_IDENTITY, address, _backup }
}
// Call this to reload public profile when interacting with any external address, like a contact, app, contract
export function refreshExternalUport (clientId) {
  return { type: REFRESH_EXTERNAL_UPORT, clientId }
}

export function addRecoveryAddress (address, recoveryAddress, recoveryType) {
  return {
    type: ADD_RECOVERY_ADDRESS,
    address,
    recoveryAddress,
    recoveryType,
    _backup
  }
}

export function storeEncryptionKey (address, publicEncKey) {
  return {
    type: STORE_ENCRYPTION_KEY,
    address,
    publicEncKey,
    _backup
  }
}

export function storePututuToken (address, pututuToken) {
  return {
    type: STORE_PUTUTU_TOKEN,
    address,
    pututuToken
  }
}

export function storeFuelToken (address, token) {
  return { type: STORE_FUEL_TOKEN, address, token, _backup }
}

export function storeActivity (activity) {
  return {
    type: STORE_ACTIVITY,
    activity,
    _backup
  }
}

export function updateActivity (activityId, changes) {
  return {
    type: UPDATE_ACTIVITY,
    activityId: activityId && activityId.toString(),
    changes,
    _backup
  }
}

export function openActivity (activityId) {
  return {
    type: OPEN_ACTIVITY,
    activityId: activityId && activityId.toString(),
    _backup
  }
}

export function removeActivity (activityId) {
  return {
    type: REMOVE_ACTIVITY,
    activityId: activityId && activityId.toString(),
    _backup
  }
}

export function updateInteractionStats (address, party, interactionType) {
  return {
    type: UPDATE_INTERACTION_STATS,
    address,
    party,
    interactionType,
    _backup
  }
}

export function addPendingAttestation (address, iss, claimType, options = {}) {
  return {
    type: ADD_PENDING_ATTESTATION,
    address,
    iss,
    claimType,
    options,
    _backup
  }
}

export function removePendingAttestation (address, iss, claimType) {
  return {
    type: REMOVE_PENDING_ATTESTATION,
    address,
    iss,
    claimType,
    _backup
  }
}

// Expects an attestation object not a token itself
// The attestations object is basically the JWT payload with the jwt added under the `token` key
// This is not meant to be called directly
export function storeAttestation (attestation) {
  return {
    type: STORE_ATTESTATION,
    attestation,
    _backup
  }
}

export function removeAttestation (address, attestationHash) {
  return {
    type: REMOVE_ATTESTATION,
    address,
    attestationHash,
    _backup
  }
}

export function savePublicUport (address) {
  return {
    type: SAVE_PUBLIC_UPORT,
    address
  }
}

export function callFaucet (address) {
  return {
    type: CALL_FAUCET,
    address
  }
}

export function saveIpfsProfile (address, ipfsHash) {
  return {
    type: SAVE_IPFS_PROFILE,
    address,
    ipfsHash
  }
}

export function storeKeyChainLevel (level) {
  return {
    type: STORE_KEYCHAIN_LEVEL,
    level
  }
}

export function storeSecurityLevel (address, level) {
  return {
    type: STORE_SECURITY_LEVEL,
    address,
    level
  }
}
