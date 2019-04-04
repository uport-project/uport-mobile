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
// Frameworks
import React from 'react'
import { connect } from 'react-redux'
import { Text, View, Platform, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native'
import { toJs, get } from 'mori'

import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import NestedInfo from 'uPortMobile/lib/components/shared/NestedInfo'
import ExpirationItem from 'uPortMobile/lib/components/Verifications/ExpirationItem'
import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'

// Selectors
import { externalIdentities, currentAddress } from 'uPortMobile/lib/selectors/identities'
import { attestationsForTypeAndValue } from 'uPortMobile/lib/selectors/attestations'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { sha3_256 } from 'js-sha3'

// Actions
import { removeAttestation } from 'uPortMobile/lib/actions/uportActions'
import { authorizeRequest, cancelRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'

// Styles
import { colors, font, fontBold, fontLight } from 'uPortMobile/lib/styles/globalStyles'

import S from 'string'

export class VerificationCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      selectedVerification: false,
    }
    this.dismissModal = this.dismissModal.bind(this)
    this.deleteVerification = this.deleteVerification.bind(this)
  }

  deleteVerification() {
    const tokenHash = sha3_256(this.props.verification.token)
    this.props.removeAttestation(this.props.address, tokenHash)
  }

  render() {
    const showUrl = this.props.issuer && this.props.issuer.url !== undefined
    return (
      <View style={styles.cardContainer}>
        <View style={styles.fromContainer}>
          <View style={styles.row}>
            <Text style={styles.fromIssuer}>
              from:{' '}
              <Text style={{ fontWeight: '600' }}>
                {this.props.issuer && this.props.issuer.name
                  ? this.props.issuer.name
                  : this.props.verification.iss && this.props.verification.iss.slice(0, 16)}
              </Text>
            </Text>
            <ExpirationItem d={this.props.verification.exp} />
          </View>
          {showUrl && (
            <View style={styles.url}>
              <TouchableOpacity onPress={() => Linking.openURL(this.props.issuer.url)}>
                <Text style={{ color: colors.purple }}>{this.props.issuer.url}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.verificationContainer}>
          <NestedInfo componentId={this.props.componentId} data={this.props.verification.claim} />
        </View>
        {this.props.showActions ? (
          <AcceptCancelGroup
            acceptText={'Accept'}
            cancelText='Delete'
            onAccept={() => this.props.authorizeRequest(this.props.request)}
            onCancel={() => this.props.cancelRequest(this.props.request)}
          />
        ) : null}
      </View>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    address: ownProps.verification.sub,
    issuer: (ownProps.verification && toJs(externalProfile(state, ownProps.verification.iss))) || {},
  }
}

const mapDispatchToProps = dispatch => {
  return {
    removeAttestation: (address, token) => dispatch(removeAttestation(address, token)),
    authorizeRequest: activity => dispatch(cancelRequest(activity.id)),
    cancelRequest: activity => dispatch(cancelRequest(activity.id)),
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 0,
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  url: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10,
  },
  fromContainer: {
    backgroundColor: colors.white,
    padding: 22,
  },
  fromIssuer: {
    fontFamily: fontLight,
    fontSize: 14,
    lineHeight: 19,
    color: colors.grey74,
  },
  verificationContainer: {
    flex: 1,
    flexDirection: 'column',
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VerificationCard)
