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
import * as React from 'react'
import { connect } from 'react-redux'

import { currentRequest } from 'uPortMobile/lib/selectors/requests'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'

import Mori from 'mori'
import { sha3_256 } from 'js-sha3'
import { cancelRequest } from 'uPortMobile/lib/actions/requestActions'
import { removeAttestation } from 'uPortMobile/lib/actions/uportActions'

import AcceptCredential from './AcceptCredential'
import { Navigation } from 'react-native-navigation'
/**
 * Refactor the parsers and move to kancah utils
 */
import { parseClaimItem, extractMarketPlaceData } from 'uPortMobile/lib/utilities/parseClaims'
import { showMarketPlaceModal } from 'uPortMobile/lib/utilities/requestScreenManager'

interface AcceptCredentialProps {
  verification: any
}

const mapStateToProps = (state: any, ownProps: any) => {
  const request = currentRequest(state) || {}
  const address = (request && request.target) || currentAddress(state)
  const verification = request.attestations ? request.attestations[0] : { claim: { loading: 'loading' } }
  const claimType = Object.keys(verification.claim)[0]
  const { claimCardHeader } = parseClaimItem(verification)

  return {
    ...ownProps,
    address,
    verification,
    title: claimCardHeader,
    issuer: Mori.toJs(externalProfile(state, verification.iss)) || {},
    request,
  }
}

export const mapDispatchToProps = (dispatch: any) => ({
  authorizeRequest: (activity: any, claim: any) => {
    dispatch(cancelRequest(activity.id))
    const config = extractMarketPlaceData(claim)

    if (config) {
      setTimeout(() => {
        showMarketPlaceModal(config)
      }, 500)
    }
  },
  cancelRequest: (activity: any) => {
    dispatch(cancelRequest(activity.id))
    const attestation = activity.attestations && activity.attestations[0]
    if (attestation) {
      dispatch(removeAttestation(attestation.sub, sha3_256(attestation.token)))
    }
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AcceptCredential)
