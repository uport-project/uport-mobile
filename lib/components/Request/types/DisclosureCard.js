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
import React from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import InteractionStats from '../partials/InteractionStats'
import DataFlowHeader from '../partials/DataFlowHeader'
import RequestItem, { RequestItemList } from '../partials/RequestItem'
import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'
import Status from 'uPortMobile/lib/components/shared/Status'

// Selectors
import { clientProfile, currentRequest } from 'uPortMobile/lib/selectors/requests'
import { publicUport, currentAddress, interactionStats, hasPublishedDID } from 'uPortMobile/lib/selectors/identities'
import { requestedClaims, verifiedClaimsByType } from 'uPortMobile/lib/selectors/attestations'
import { working, errorMessage } from 'uPortMobile/lib/selectors/processStatus'
import { endpointArn } from 'uPortMobile/lib/selectors/snsRegistrationStatus'

import { toJs, get } from 'mori'
import verifiedByUport from 'uPortMobile/lib/utilities/verifiedByUport'
import { networks, defaultNetworkId } from 'uPortMobile/lib/utilities/networks'

// Actions
import { authorizeRequest, cancelRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'

// Styles
import { textStyles } from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 40,
    marginTop: 22
  }
})

export const DisclosureCard = (props) => {
  return (
    <View style={{alignItems: 'stretch', flex: 1}}>
      <DataFlowHeader
        sender={props.currentIdentity}
        recipient={props.client}
        verified={props.uportVerified}
      />
      {/* Request Hero */}
      <View style={styles.titleContainer}>
        <Text style={textStyles.h2}>
          {props.client && props.client.name ? props.client.name : 'This unidentified dApp'}
        </Text>
        <Text style={textStyles.p}>
          {!props.authorized ? 'is requesting this information' : 'requested this information'}
        </Text>
      </View>
      {/* Credentials List */}
      <RequestItemList>
        { Object.keys(props.requested || {}).map((claim, i) => (
          <RequestItem key={i + claim} type={claim.toUpperCase()} value={typeof props.requested[claim] !== 'object'
            ? props.requested[claim]
            : null}
            verifications={props.verified[claim]}
          />)
          )
        }
        { props.pushPermissions
        ? <RequestItem key='pushPermissions' type='Push Notifications' value={
            props.snsRegistered
              ? 'Allow'
              : (
                props.pushWorking
                ? 'Registering'
                : props.pushError || 'Not available'
              )
            } />
        : null
        }
        { props.network
        ? <RequestItem
          key={'requestednetwork'}
          type='Network'
          value={props.networkName}
        />
        : null}
        { props.network || props.account
        ? <RequestItem
          key={'accountaddress'}
          type='Address'
          value={props.account ||
            `New account will be created for ${props.actType === 'segregated'
                                                    ? props.client.name || props.client.address.slice(0, 10)
                                                    : props.networkName}`}
        />
        : null}
      </RequestItemList>
      <InteractionStats
        stats={props.interactionStats}
        actionText='shared your details'
        counterParty={props.client}
      />

      { props.createSubAccount
      ? <Status process='createSubAccount' />
      : null }

      { props.error
        ? <Text style={[textStyles.small, {color: 'red'}]}>
          { props.error }
        </Text>
        : null }
      { !props.authorized
      ? <AcceptCancelGroup
        disabled={props.pushWorking || !!props.error || props.createSubAccount}
        acceptText='Continue'
        cancelText='Cancel'
        onAccept={() => props.authorizeRequest(props.requestId)}
        onCancel={() => props.cancelRequest(props.requestId)}
      />
      : <View />}

    </View>
  )
}

DisclosureCard.propTypes = {
  pushPermissions: PropTypes.bool,
  network: PropTypes.string,
  actType: PropTypes.string,
  authorized: PropTypes.bool,
  verified: PropTypes.object,
  requested: PropTypes.object,
  currentIdentity: PropTypes.object,
  client: PropTypes.object,

  authorizeRequest: PropTypes.func,
  cancelRequest: PropTypes.func,
  clearRequest: PropTypes.func
}

const mapStateToProps = (state) => {
  const request = currentRequest(state) || {}
  const address = request.target || currentAddress(state)
  const account = request.account
  const network = networks[request.network] || {network_id: request.network, name: request.network}
  const networkName = network.name
  const client = clientProfile(state)
  const currentIdentity = toJs(publicUport(state))
  const requested = requestedClaims(state, request && request.requested)
  const verified = request && request.verified ? verifiedClaimsByType(state, request && request.verified) : {}
  const uportVerified = request && request.client_id ? verifiedByUport[request.client_id] : false
  const pushWorking = working(state, 'push')
  const pushError = errorMessage(state, 'push')
  const createSubAccount = working(state, 'createSubAccount')
  let stats
  let shareStats
  if (request) {
    stats = toJs(get(interactionStats(state), request.client_id)) || 0
    // console.log(stats)
    shareStats = { shared: stats.share || 0 }
  }
  return {
    currentIdentity,
    client,
    account,
    network: request.network,
    networkName,
    actType: request.actType,
    requestId: request.id,
    error: (request || {}).error,
    pushPermissions: !!request.pushPermissions,
    authorized: !!request.authorizedAt,
    pushWorking,
    createSubAccount,
    pushError,
    requested,
    verified,
    uportVerified,
    interactionStats: shareStats,
    snsRegistered: !!endpointArn(state)
  }
}

const mapDispatchToProps = (dispatch) => ({
  clearRequest: () => {
    dispatch(clearRequest())
  },
  authorizeRequest: (activity) => dispatch(authorizeRequest(activity)),
  cancelRequest: (activity) => dispatch(cancelRequest(activity))
})

export default connect(mapStateToProps, mapDispatchToProps)(DisclosureCard)
