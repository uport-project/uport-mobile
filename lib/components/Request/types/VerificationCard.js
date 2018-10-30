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
// Framework
import { connect } from 'react-redux'
// Components
import { VerificationCard } from 'uPortMobile/lib/components/Verifications/VerificationCard'
// Selectors
import { currentRequest } from 'uPortMobile/lib/selectors/requests'
import { attestationsForTypeAndValue } from 'uPortMobile/lib/selectors/attestations'
import { externalIdentities, currentAddress } from 'uPortMobile/lib/selectors/identities'

import { toJs, get } from 'mori'
import { sha3_256 } from 'js-sha3'

// Actions
import { authorizeRequest, cancelRequest } from 'uPortMobile/lib/actions/requestActions'
import { removeAttestation } from 'uPortMobile/lib/actions/uportActions'

const mapStateToProps = (state, ownProps) => {
  const request = currentRequest(state) || {}
  const address = request && request.target || currentAddress(state)
  const verification = request.attestations ? request.attestations[0] : {claim: {loading: 'loading'}}
  const claimType = Object.keys(verification.claim)[0]
  const claimValue = verification.claim[claimType]
  const claims = (typeof claimValue === 'object')
    ? // Object.keys(claimValue).map(key => ({key: key, value: claimValue[key]}))
    Object.keys(claimValue).reduce(function(accumulator, current) {
      if(typeof(claimValue[current]) !== 'object'){
        accumulator.push({key: current, value: claimValue[current]})
      }
      return accumulator
    }, [])
    : Object.keys(verification['claim']).map(key => ({key: key, value: verification['claim'][key]}))

  return {
    address,
    verification,
    attestationsForTypeAndValue: (attestation) => {
      return attestationsForTypeAndValue(state,
        {
          claimType: attestation.type,
          claimValue: attestation.value
        }
      )
    },
    claims,
    title: claimType,
    issuer: toJs(get(externalIdentities(state), verification.iss)) || {},
    showActions: true,
    request
  }
}

export const mapDispatchToProps = (dispatch) => ({
  authorizeRequest: (activity) => dispatch(cancelRequest(activity.id)),
  cancelRequest: (activity) => {
    dispatch(cancelRequest(activity.id))
    const attestation = activity.attestations && activity.attestations[0]
    if (attestation) {
      dispatch(removeAttestation(attestation.sub, sha3_256(attestation.token)))
    }
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(VerificationCard)
