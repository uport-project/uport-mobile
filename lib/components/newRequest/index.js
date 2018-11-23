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
import React, {Component} from 'react'
import { Text, TouchableOpacity, View, SafeAreaView, VirtualizedList, StyleSheet, DeviceInfo, Platform, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { count, toJs } from 'mori'
import { colors, fontBold } from 'uPortMobile/lib/styles/globalStyles'
import NetworkStatusBar from 'uPortMobile/lib/components/shared/NetworkStatusBar'

import InteractionStats from './partials/InteractionStats'

// Selectors
import { currentRequestType, currentRequestId, currentRequestAuthorized } from 'uPortMobile/lib/selectors/requests'
import { clientProfile, currentRequest, destinationProfile } from 'uPortMobile/lib/selectors/requests'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'

// Actions
import { authorizeRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'

// Components
import DisclosureCard from './types/DisclosureCard'
import TransactionCard from './types/TransactionCard'
import { lightStyles } from 'uPortMobile/lib/styles/index'
const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 0,
    marginLeft: 8,
    marginRight: 8,
    marginTop: Platform.select({
      android: 5,
      ios: DeviceInfo.isIPhoneX_deprecated ? 40 : 26
    }),
    marginBottom: DeviceInfo.isIPhoneX_deprecated ? 25 : 5,
    borderColor: 'rgba(229,229,229,1)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,1)',
    shadowColor: 'rgb(63,63,63)',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,   
    // boxShadow: [0 0 11 0] rgba(0,0,0,0.1);
  },
  cardTitle: {
    flex: 1,
    fontFamily: fontBold,
    fontSize: 24,
    //textAlign: 'center',
    color: '#3F3D4B'
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    marginBottom: 8
  },
  disclosureBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 22,
    paddingLeft: 16,
    paddingRight: 22,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  cancelButton: {
    borderColor: colors.grey74,
    borderWidth: 1,
    marginRight: 10
  },
  authButton: {
    backgroundColor: colors.lightPurple,
    marginLeft: 10
  },
  buttonText: {
    fontFamily: fontBold,
    fontSize: 18
  },
  cancelButtonText: {
    color: colors.grey74
  },
  authButtonText: {
    color: colors.white
  }
})

const cardTitle = {
  'sign': 'Confirm Transaction',
  'disclosure': 'Login'
}

export class Request extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    screenBackgroundColor: 'rgba(249,249,250,1)',
    statusBarHideWithNavBar: false,
  }

  constructor(props) {
    super(props);
    // if you want to listen on navigator events, set this up
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.props.navigator.setDrawerEnabled({
      side: 'right',
      enabled: false
    })
  }

  onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
    if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id == 'cancel') { // this is the same id field from the static navigatorButtons definition
        this.props.cancelRequest(this.props.requestId)
      }
    }
  }

  pickCard () {
    switch (this.props.requestType) {
      case 'sign':
        return (<TransactionCard />)
      case 'disclosure':
        return (<DisclosureCard />)
      }
  }
  // Render actual cards here like in old RequestCard
  render() {
    return (
    <View style={lightStyles.lightBoxCardContainer}>
      <NetworkStatusBar />
      <View style={{position: 'absolute', bottom: 0, justifyContent: 'center', width: '100%'}}>
        { this.pickCard() }
      </View>
    </View>
    )
  }
}

const mapStateToProps = (state) => {
  const request = currentRequest(state)
  const address = request && request.target || currentAddress(state)
  const client = clientProfile(state)
  const contact = destinationProfile(state, address) || client || {}

  return {
    requestType: currentRequestType(state),
    requestId: currentRequestId(state),
    authorized: currentRequestAuthorized(state),
    contact
  }
}

export const mapDispatchToProps = (dispatch) => (
  {
    authorizeRequest: (requestId) => dispatch(authorizeRequest(requestId)),
    clearRequest: () => dispatch(clearRequest())
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(Request)
