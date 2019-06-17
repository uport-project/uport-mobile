import React from 'react'
import { StyleSheet, Text, View, VirtualizedList, Platform } from 'react-native'
import { Navigation } from 'react-native-navigation'
import { connect } from 'react-redux'
import { count, toJs, get } from 'mori'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
// Selectors
import { notifications, notificationCount } from 'uPortMobile/lib/selectors/activities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { requestedClaims } from 'uPortMobile/lib/selectors/attestations'

// Actions
import { authorizeRequest, cancelRequest, selectRequest } from 'uPortMobile/lib/actions/requestActions'
import { openActivity } from 'uPortMobile/lib/actions/uportActions'

// Components
import TransactionNotification from './notifications/variants/TransactionNotification'
import DisclosureNotification from './notifications/variants/DisclosureNotification'
import VerificationSignNotification from './notifications/variants/VerificationSignNotification'
import ConnectionNotification from './notifications/variants/ConnectionNotification'
import RecoveryNotification from './notifications/variants/RecoveryNotification'
import AttestationNotification from './notifications/variants/AttestationNotification'
import NetworkNotification from './notifications/variants/NetworkNotification'
import InformationNotification from './notifications/variants/InformationNotification'
import InfoNotification from './notifications/variants/InfoNotification'
import SignTypedDataNotification from './notifications/variants/SignTypedDataNotification'

import { Icon } from '@kancha'

export class Notifications extends React.Component {
  constructor(props) {
    super(props)
    this.getNotificationType = this.getNotificationType.bind(this)
    this.renderItem = this.renderItem.bind(this)
  }

  componentDidMount() {
    this.updateInAppNotificationBadge(this.props.unreadNoticationCount)
  }

  getNotificationType(item, issuer, selectRequest) {
    const activity = toJs(item)

    switch (activity.type) {
      case 'sign':
        return (
          <TransactionNotification
            activity={activity}
            issuer={issuer}
            selectRequest={selectRequest}
            cancel={this.props.cancelRequest}
            authorize={this.props.authorizeRequest}
          />
        )
      case 'disclosure':
        return (
          <DisclosureNotification
            activity={activity}
            issuer={issuer}
            selectRequest={selectRequest}
            cancel={this.props.cancelRequest}
            authorize={this.props.authorizeRequest}
            requested={this.props.requested}
          />
        )
      case 'verificationSign':
        return (
          <VerificationSignNotification
            activity={activity}
            issuer={issuer}
            selectRequest={selectRequest}
            cancel={this.props.cancelRequest}
            authorize={this.props.authorizeRequest}
          />
        )
      case 'connect':
        return (
          <ConnectionNotification
            activity={activity}
            issuer={issuer}
            selectRequest={selectRequest}
            cancel={this.props.cancelRequest}
            authorize={this.props.authorizeRequest}
          />
        )
      case 'attestation':
        return (
          <AttestationNotification
            activity={activity}
            issuer={issuer}
            selectRequest={selectRequest}
            cancel={this.props.cancelRequest}
            authorize={this.props.selectRequest}
          />
        )
      case 'recover':
        return (
          <RecoveryNotification
            activity={activity}
            issuer={issuer}
            selectRequest={selectRequest}
            cancel={this.props.cancelRequest}
            authorize={this.props.authorizeRequest}
          />
        )
      case 'net':
        return (
          <NetworkNotification
            activity={activity}
            issuer={issuer}
            selectRequest={selectRequest}
            cancel={this.props.cancelRequest}
            authorize={this.props.authorizeRequest}
          />
        )
      case 'information':
        return (
          <InformationNotification
            activity={activity}
            infoType={activity.infoType}
            selectRequest={() => {}}
            cancel={this.props.cancelRequest}
            authorize={this.props.authorizeRequest}
          />
        )
      case 'infoReq':
        return (
          <InfoNotification
            activity={activity}
            issuer={issuer}
            infoType={activity.infoType}
            selectRequest={() => {}}
            cancel={this.props.cancelRequest}
            authorize={this.props.authorizeRequest}
          />
        )
      case 'eip712Sign':
        return (
          <SignTypedDataNotification
            activity={activity}
            issuer={issuer}
            selectRequest={selectRequest}
            cancel={this.props.cancelRequest}
            authorize={this.props.selectRequest}
          />
        )
    }
  }
  renderItem({ item, index }) {
    return (
      <View key={`activity-${item.id}`}>
        {this.getNotificationType(item, this.props.lookupIssuer, this.props.selectRequest)}
      </View>
    )
  }

  updateInAppNotificationBadge(count) {
    Navigation.mergeOptions(this.props.componentId, {
      bottomTab: {
        badge: (count > 0 && count.toString()) || null,
        badgeColor: colors.red,
      },
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.unreadNoticationCount !== this.props.unreadNoticationCount) {
      this.updateInAppNotificationBadge(this.props.unreadNoticationCount)
    }
  }

  renderNoNotifications() {
    return (
      <View style={styles.emptyStateContainer}>
        <Icon name={'bell'} font={'feather'} color={colors.white226} size={100} />
        <Text style={{ fontSize: 22, color: colors.grey91, paddingTop: 20 }}>You don't have any notifications</Text>
      </View>
    )
  }

  renderNotifications() {
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
      </View>
    )
  }

  render() {
    return count(this.props.notifications) ? this.renderNotifications() : this.renderNoNotifications()
  }
}

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: colors.white246,
  },
  list: {
    margin: 4,
    marginTop: 26,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
})

const mapStateToProps = state => ({
  unreadNoticationCount: notificationCount(state),
  lookupIssuer: clientId => toJs(externalProfile(state, clientId)),
  notifications: notifications(state),
  requested: activity => requestedClaims(state, activity),
})

export const mapDispatchToProps = dispatch => ({
  selectRequest: activity => dispatch(selectRequest(activity.id)),
  authorizeRequest: activity => dispatch(authorizeRequest(activity.id)),
  cancelRequest: activity => dispatch(cancelRequest(activity.id)),
  hideRequest: activity => dispatch(openActivity(activity.id)), // marking an activity as opened hides it
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Notifications)
