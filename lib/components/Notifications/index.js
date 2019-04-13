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
import { StyleSheet, Text, View, VirtualizedList } from 'react-native'
import { connect } from 'react-redux'
import { count, toJs, get } from 'mori'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { closeIconGetter } from 'uPortMobile/lib/utilities/navButtonGetters'
// Selectors
import { notifications } from 'uPortMobile/lib/selectors/activities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { requestedClaims } from 'uPortMobile/lib/selectors/attestations'

// Actions
import { authorizeRequest, cancelRequest, selectRequest } from 'uPortMobile/lib/actions/requestActions'
import { openActivity } from 'uPortMobile/lib/actions/uportActions'

// Components
import TransactionNotification from './Types/TransactionNotification'
import DisclosureNotification from './Types/DisclosureNotification'
import VerificationSignNotification from './Types/VerificationSignNotification'
import ConnectionNotification from './Types/ConnectionNotification'
import RecoveryNotification from './Types/RecoveryNotification'
import AttestationNotification from './Types/AttestationNotification'
import NetworkNotification from './Types/NetworkNotification'
import InformationNotification from './Types/InformationNotification'
import SignTypedDataNotification from './Types/SignTypedDataNotification'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: colors.white246
  },
  list: {
    margin: 4,
    marginTop: 26,
    alignItems: 'stretch',
    justifyContent: 'flex-start'
  }
})

export class Notifications extends React.Component {
  constructor (props) {
    super()
    this.getNotificationType = this.getNotificationType.bind(this)
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    this.renderItem = this.renderItem.bind(this)
  }

  componentDidMount () {
    closeIconGetter(this.props.navigator)
  }

  onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'close') { // this is the same id field from the static navigatorButtons definition
        this.props.navigator.dismissModal()
      }
    }
  }

  // getReadableTime (timestamp) {
  //   let dateObj = new Date(timestamp * 1000)
  //   return (dateObj.getDate())
  // }

  getNotificationType (item, issuer, selectRequest) {
    const activity = toJs(item)
    switch (activity.type) {
      case 'sign':
        return <TransactionNotification activity={activity} issuer={issuer} selectRequest={selectRequest} cancel={this.props.cancelRequest} authorize={this.props.authorizeRequest} />
      case 'disclosure':
        return <DisclosureNotification activity={activity} issuer={issuer} selectRequest={selectRequest} cancel={this.props.cancelRequest} authorize={this.props.authorizeRequest} requested={this.props.requested} />
      case 'verificationSign':
        return <VerificationSignNotification activity={activity} issuer={issuer} selectRequest={selectRequest} cancel={this.props.cancelRequest} authorize={this.props.authorizeRequest} requested={this.props.requested} />
      case 'connect':
        return <ConnectionNotification activity={activity} issuer={issuer} selectRequest={selectRequest} cancel={this.props.cancelRequest} authorize={this.props.authorizeRequest} />
      case 'attestation':
        return <AttestationNotification activity={activity} issuer={issuer} selectRequest={selectRequest} cancel={this.props.cancelRequest} authorize={this.props.selectRequest} />
      case 'recover':
        return <RecoveryNotification activity={activity} issuer={issuer} selectRequest={selectRequest} cancel={this.props.cancelRequest} authorize={this.props.authorizeRequest} />
      case 'net':
        return <NetworkNotification activity={activity} issuer={issuer} selectRequest={selectRequest} cancel={this.props.cancelRequest} authorize={this.props.authorizeRequest} />
      case 'information':
        return <InformationNotification activity={activity} infoType={activity.infoType} selectRequest={() => {}} cancel={this.props.cancelRequest} authorize={this.props.authorizeRequest} />
      case 'eip712Sign':
        return <SignTypedDataNotification activity={activity} issuer={issuer} selectRequest={selectRequest} cancel={this.props.cancelRequest} authorize={this.props.authorizeRequest} requested={this.props.requested} />
    }
  }
  renderItem ({item, index}) {
    return (
      <View key={`activity-${item.id}`}>
        {this.getNotificationType(item, this.props.lookupIssuer, this.props.selectRequest)}
      </View>
    )
  }
  render () {
    return (
      <View style={styles.container}>
        <VirtualizedList
          data={this.props.notifications}
          getItem={get}
          getItemCount={count}
          renderItem={this.renderItem}
          keyExtractor={i => get(i, 'id').toString()}
          contentContainerStyle={styles.list}
        />
        {count(this.props.notifications)
          ? null
          : <Text>No Notifications</Text>
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => (
  {
    lookupIssuer: (clientId) => toJs(externalProfile(state, clientId)),
    notifications: notifications(state),
    requested: (activity) => activity.type === 'disclosure' ? requestedClaims(state, activity && activity.requested) : undefined
  }
)

export const mapDispatchToProps = (dispatch) => (
  {
    selectRequest: (activity) => dispatch(selectRequest(activity.id)),
    authorizeRequest: (activity) => dispatch(authorizeRequest(activity.id)),
    cancelRequest: (activity) => dispatch(cancelRequest(activity.id)),
    hideRequest: (activity) => dispatch(openActivity(activity.id)) // marking an activity as opened hides it
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(Notifications)
