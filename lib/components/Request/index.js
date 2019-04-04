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
import React, { Component } from 'react'
import {
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  VirtualizedList,
  StyleSheet,
  DeviceInfo,
  Platform,
} from 'react-native'
import { connect } from 'react-redux'
import IonIcon from 'react-native-vector-icons/Ionicons'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { count, toJs } from 'mori'
import { colors, font, fontBold } from 'uPortMobile/lib/styles/globalStyles'
import NetworkStatusBar from 'uPortMobile/lib/components/shared/NetworkStatusBar'

// Selectors
import { currentRequestType, currentRequestId, currentRequestAuthorized } from 'uPortMobile/lib/selectors/requests'

// Actions
import { authorizeRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'

// Components
import ConnectionCard from './types/ConnectionCard'
import VerificationCard from './types/VerificationCard'
import NetworkCard from './types/NetworkCard'
import PropertyCard from './types/PropertyCard'
import VerificationSignCard from './types/VerificationSignCard'
import Eip712SignCard from './types/Eip712SignCard'
import PersonalSignCard from './types/PersonalSignCard'

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 0,
    marginLeft: 8,
    marginRight: 8,
    marginTop: Platform.select({
      android: 5,
      ios: DeviceInfo.isIPhoneX_deprecated ? 40 : 26,
    }),
    marginBottom: DeviceInfo.isIPhoneX_deprecated ? 25 : 5,
    borderColor: 'rgba(229,229,229,1)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,1)',
    shadowColor: 'rgb(63,63,63)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    // boxShadow: [0 0 11 0] rgba(0,0,0,0.1);
  },
  cardTitle: {
    flex: 1,
    color: colors.brand,
    fontFamily: font,
    fontSize: 20,
    textAlign: 'center',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 22,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    borderColor: colors.grey74,
    borderWidth: 1,
    marginRight: 10,
  },
  authButton: {
    backgroundColor: colors.lightPurple,
    marginLeft: 10,
  },
  buttonText: {
    fontFamily: fontBold,
    fontSize: 18,
  },
  cancelButtonText: {
    color: colors.grey74,
  },
  authButtonText: {
    color: colors.white,
  },
})

const cardTitle = {
  sign: 'Confirm Transaction',
  disclosure: 'Login Request',
  connect: 'Contact Request',
  verificationSign: 'Signature Request',
  personalSign: 'Signature Request',
}

export class Request extends Component {
  pickCard() {
    switch (this.props.requestType) {
      case 'connect':
        return <ConnectionCard componentId={this.props.componentId} />
      case 'attestation':
        console.tron.log('Verify')
        return <VerificationCard componentId={this.props.componentId} />
      case 'net':
        return <NetworkCard componentId={this.props.componentId} />
      case 'property':
        return <PropertyCard componentId={this.props.componentId} />
      case 'verificationSign':
        return <VerificationSignCard componentId={this.props.componentId} />
      case 'eip712Sign':
        return <Eip712SignCard componentId={this.props.componentId} />
      case 'personalSign':
        return <PersonalSignCard componentId={this.props.componentId} />
    }
  }
  // Render actual cards here like in old RequestCard
  render() {
    return (
      <View style={{ flex: 1 }}>
        <NetworkStatusBar />
        <View style={styles.card}>
          <View
            style={[
              styles.titleBar,
              this.props.requestType === 'attestation' ? { marginBottom: 0, paddingBottom: 10 } : {},
            ]}
          >
            <Text style={styles.cardTitle}>{cardTitle[this.props.requestType]}</Text>
            <TouchableOpacity
              onPress={this.props.clearRequest}
              style={{
                position: 'absolute',
                height: 44,
                width: 44,
                top: 16,
                right: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EvilIcon size={24} name='close' color='rgba(155,155,155,1)' />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>{this.pickCard()}</View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  requestType: currentRequestType(state),
  requestId: currentRequestId(state),
  authorized: currentRequestAuthorized(state),
})

export const mapDispatchToProps = dispatch => ({
  authorizeRequest: requestId => dispatch(authorizeRequest(requestId)),
  clearRequest: () => dispatch(clearRequest()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Request)
