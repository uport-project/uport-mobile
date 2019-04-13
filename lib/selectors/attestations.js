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
import { toJs, toClj, hashMap, hasKey, count, selectKeys, vector, assoc, flatten, get, getIn, vals, map, reduce, reduceKV, inc, updateIn, sortedMap, first, groupBy, keys, dissoc, filter, reverse, concat, conj } from 'mori'
import { currentIdentity, ownClaims, currentDID, currentDidObject, hasEncryptionKey } from './identities'
import { profileForDID, allProfiles } from './vc'
import _ from 'lodash'

const externalIdentities = state => {
  const external = toJs(get(state.uport, 'external')) || {}
  const vcProfiles = allProfiles(state)
  _.forEach(vcProfiles, (profile) => {
    external[profile.address] = Object.assign(external[profile.address] ? external[profile.address] : {}, profile)
  })
  return toClj(external)
}

// NEEDS ERROR HANDLING
// Props needs to have the following values:
// - `issuer` an address
export const issuedBy = (state, props) => {
  return filter((att) => get(att, 'iss') === props.issuer, attestationLedger(state))
}

const claimsForSpec = (spec, claims) => {
  const claimType = typeof spec === 'object' ? spec.type : spec
  if (typeof claimType !== 'string') return []

  const candidates = filter(claim => hasKey(get(claim, 'claim'), claimType), claims)
  if (typeof spec === 'object' && spec.iss) {
    const iss = spec.iss.includes ? spec.iss : [spec.iss]
    return filter(claim => iss.includes(get(claim, 'iss')), candidates)
  } else {
    return candidates
  }
}
export const requestedAttestations = (state, requested) => {
  const all = onlyLatestAttestations(state)
  return flatten(map(spec => claimsForSpec(spec, all), requested))
}

const requested = (state, params) => params

const forIssuerAndClaimType = (state, iss, claimType) => ({iss, claimType})

// Props needs to have the following values:
// - `claimType` (eg. `name` or `phone`)
// - `claimValue` (eg. `Alice` ....)

export const forTypeAndValue = (state, props) => {
  return filter((att) => getIn(att, ['claim', props.claimType]) === props.claimValue, onlyLatestAttestations(state))
}

// This represents an array of claim objects
// { sub: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
// claim: { employer: 'Consensys AG' },
// iss: '0x88647b5a94cd8347c8f76c7b79c85bbfbf0e13a9',
// iat: 1482268217248,
// exp: 1482354617248,
// token: 'tokenstring' }

// Return a mori object of the attestations for the current identity
export const attestationLedger = createSelector(
  [currentIdentity, currentDidObject],
  (identity, did) => concat(reverse(vals(get(identity, 'attestations'))), reverse(vals(get(did, 'attestations'))))
)

// Return a mori object of the most recent attestations for the current identity
export const onlyLatestAttestations = createSelector(
  [attestationLedger],
  (attestations) => map(first, vals(groupBy(a => vector(get(a, 'iss'), get(a, 'claim')), attestations)))
)

const pendingAttestationsMap = createSelector(
  [currentIdentity],
  identity => get(identity, 'pendingAttestations')
)

const pendingAttestationsSeq = createSelector(
  [pendingAttestationsMap],
  pending => reduceKV((v, iss, claims) => concat(
      v, reduceKV(
        (v2, claimType, options) => conj(v2, hashMap('iss', iss, 'claimType', claimType, 'options', options)),
        vector(),
        claims
      )
    )
  ,
  vector(), pending)
)

export const pendingAttestations = createSelector(
  [pendingAttestationsSeq],
  pending => toJs(pending)
)

export const pendingAttestationFor = createSelector(
  [pendingAttestationsMap, forIssuerAndClaimType],
  (pending, {iss, claimType}) => {
    const options = toJs(getIn(pending, [iss, claimType]))
    return options ? {iss, claimType, options} : undefined
  }
)

// Return a mori object with the following structure
// This represents an object that has keys for the attestations and an object
// with values and the number of attestations for each attestation
// { employer: { 'Consensys AG': 5 } }
export const thirdPartyAttestationSummary = createSelector(
  [onlyLatestAttestations],
  (attestations) =>
    reduce(
      (summary, att) => {
        // TODO this only deals with a single entry claims map. It should handle multiples
        const claim = get(att, 'claim')
        const claimType = first(keys(claim))
        return updateIn(summary, [claimType, get(claim, claimType)], inc)
      },
      sortedMap(),
      attestations
    )
)

// Return a mori object with the follow structure
// This represents a summary of all attestations with included claims
// { employer: { 'Consensys AG': 5 },
//   name: { 'Ashoka Finley': 0 },
//   phone: { '13104041586': 0 } }
export const attestationSummaryStats = createSelector(
  [thirdPartyAttestationSummary, ownClaims],
  (attestations, own) =>
    reduceKV((summary, type, value) => updateIn(summary, [type, value], (amount) => amount || 0),
          attestations,
          dissoc(own, 'connections'))
)

// Return a JS object from the attestationSummaryStats
export const attestationSummary = createSelector(
  [attestationSummaryStats],
  (summary) => toJs(summary))

// Return a mori object with all the attestations for the current identity
export const allClaims = createSelector(
  [attestationSummaryStats],
  summary => reduceKV((m, type, value) => assoc(m, type, first(keys(value))), hashMap(), summary)
)

// Return a JS object of the requested claims
// Return an empty object if none are present
export const requestedClaims = createSelector(
  [allClaims, requested],
  (claims, params) => toJs(selectKeys(claims, map(claimType => typeof claimType === 'object' ? claimType.type : claimType, params)))
)

// NEEDS ERROR HANDLING
// Returns a js object for typeAndValue for only the latest attestations
// Returns an empty array if none are present
export const attestationsForTypeAndValue = createSelector(
  [forTypeAndValue], (attestations) => toJs(attestations)
)

// Not Used
export const attestationsIssuedBy = createSelector(
  [issuedBy], (attestations) => toJs(attestations)
)

// Not Used
export const verifiedClaims = createSelector(
  [requestedAttestations],
  (attestations) => toJs(attestations)
)

// Returns a JS object of tokens of verifiedClaims
// Returns an empty object if none are found
export const verifiedClaimsTokens = createSelector(
  [requestedAttestations],
  (attestations) => toJs(map(a => get(a, 'token'), attestations))
)

// Not Used
export const verifiedClaimsByClaim = createSelector(
  [requestedAttestations],
  (attestations) => toJs(groupBy(a => get(a, 'claim'), attestations))
)

export const requestedWithIssuer = createSelector(
  [requestedAttestations, externalIdentities],
  (attestations, issuers) => map(att => assoc(att, 'issuer', get(issuers, get(att, 'iss'), {})), attestations)
)

export const verifiedClaimsByType = createSelector(
  [requestedWithIssuer],
  (attestations) => toJs(groupBy(a => first(keys(get(a, 'claim'))), attestations))
)

export const attestationsForIssuerAndType = createSelector(
  [onlyLatestAttestations, forIssuerAndClaimType],
  (attestations, {iss, claimType}) => filter((att) => get(att, 'iss') === iss && getIn(att, ['claim', claimType]), attestations)
)

export const pendingOrIssuedAttestationFor = createSelector(
  [pendingAttestationFor, attestationsForIssuerAndType],
  (pending, attestations) => !!(pending || count(attestations) > 0)
)

export const onlyPendingAndLatestAttestations = createSelector(
  [pendingAttestationsSeq, onlyLatestAttestations, externalIdentities],
  (pending, latest, issuers) => toJs(map(
    att => assoc(att, 'issuer', get(issuers, get(att, 'iss'), {})),
    concat(pending, latest)))
)

export const hasAttestations = createSelector(
  [onlyPendingAndLatestAttestations],
  attestations => attestations.length > 0
)
