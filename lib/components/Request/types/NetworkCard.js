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
import React from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'

// Components
import DataFlowHeader from '../partials/DataFlowHeader'
import RequestItem, { RequestItemList } from '../partials/RequestItem'
import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'
import Status from 'uPortMobile/lib/components/shared/Status'

// Selectors
import { clientProfile, currentRequest } from 'uPortMobile/lib/selectors/requests'
import { publicUport } from 'uPortMobile/lib/selectors/identities'
// Actions
import { authorizeRequest, cancelRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'
import verifiedByUport from 'uPortMobile/lib/utilities/verifiedByUport'

import { toJs } from 'mori'

// Styles
import { textStyles } from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 40,
    marginTop: 22
  }
})

export const NetworkCard = (props) => {
  return (
    <View style={{alignItems: 'stretch', flex: 1}}>
      <DataFlowHeader
        sender={props.client}
        recipient={props.currentIdentity}
        verified={props.uportVerified}
      />
      {/* Request Hero */}
      <View style={styles.titleContainer}>
        <Text style={textStyles.h2}>
          {props.client && props.client.name ? props.client.name : 'This unidentified dApp'}
        </Text>
        <Text style={textStyles.p}>
          has created this account for you
        </Text>
      </View>
      <RequestItemList>
        <RequestItem
          key={'network'}
          type='Network'
          value={props.network}
        />
        <RequestItem
          key={'address'}
          type='Address'
          value={props.address}
        />
      </RequestItemList>
      { props.error
        ? <Text style={[textStyles.small, {color: 'red'}]}>
          { props.error }
        </Text>
        : null }
      { !props.authorized
      ? <AcceptCancelGroup
        disabled={!!props.error}
        acceptText='Add Account'
        cancelText='Cancel'
        onAccept={() => props.authorizeRequest(props.requestId)}
        onCancel={() => props.cancelRequest(props.requestId)}
      />
      : <View />}

    </View>
  )
}

NetworkCard.propTypes = {
  requestId: PropTypes.number,
  network: PropTypes.string,
  error: PropTypes.string,
  address: PropTypes.string,
  authorized: PropTypes.bool,
  verified: PropTypes.object,
  currentIdentity: PropTypes.object,
  client: PropTypes.object,
  authorizeRequest: PropTypes.func,
  cancelRequest: PropTypes.func,
  clearRequest: PropTypes.func
}

const mapStateToProps = (state) => {
  const request = currentRequest(state) || {}
  const subIdentity = request.subIdentity || {}
  const uportVerified = request && request.client_id ? Object.keys(verifiedByUport).indexOf(request.client_id) > -1 : false
  return {
    requestId: request.id,
    currentIdentity: toJs(publicUport(state)),
    authorized: !!request.authorizedAt,
    network: subIdentity.network,
    address: subIdentity.address,
    client: clientProfile(state),
    error: request.error,
    uportVerified
  }
}

const mapDispatchToProps = (dispatch) => (
  {
    clearRequest: () => {
      dispatch(clearRequest())
    },
    authorizeRequest: (requestId) => dispatch(authorizeRequest(requestId)),
    cancelRequest: (requestId) => dispatch(cancelRequest(requestId))
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(NetworkCard)
