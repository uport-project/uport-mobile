import React from 'react'
import { StyleSheet, Text, View, VirtualizedList, Platform } from 'react-native'
import { connect } from 'react-redux'
import { count, toJs, get } from 'mori'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { closeIconGetter } from 'uPortMobile/lib/utilities/navButtonGetters'
// Selectors
import { notifications, notificationCount } from 'uPortMobile/lib/selectors/activities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { requestedClaims } from 'uPortMobile/lib/selectors/attestations'

// Actions
import { authorizeRequest, cancelRequest, selectRequest } from 'uPortMobile/lib/actions/requestActions'
import { openActivity } from 'uPortMobile/lib/actions/uportActions'
import { NavigationActions } from 'uPortMobile/lib/utilities/NavigationActions'

// Components
import TransactionNotification from 'uPortMobile/lib/components/Notifications/Types/TransactionNotification'
import DisclosureNotification from 'uPortMobile/lib/components/Notifications/Types/DisclosureNotification'
import VerificationSignNotification from 'uPortMobile/lib/components/Notifications/Types/VerificationSignNotification'
import ConnectionNotification from 'uPortMobile/lib/components/Notifications/Types/ConnectionNotification'
import RecoveryNotification from 'uPortMobile/lib/components/Notifications/Types/RecoveryNotification'
import AttestationNotification from 'uPortMobile/lib/components/Notifications/Types/AttestationNotification'
import NetworkNotification from 'uPortMobile/lib/components/Notifications/Types/NetworkNotification'
import InformationNotification from 'uPortMobile/lib/components/Notifications/Types/InformationNotification'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
const isIOS = Platform.OS === 'ios' ? true : false

export class Notifications extends React.Component {

    static navigatorStyle = {
        largeTitle: true,
        navBarBackgroundColor: colors.brand,
        navBarButtonColor: colors.white,
        navBarTextColor: colors.white,
    }

    constructor (props) {
        super(props)
        NavigationActions.setNavigator(props.navigator)
        this.getNotificationType = this.getNotificationType.bind(this)
        this.renderItem = this.renderItem.bind(this)
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id == 'scan') { // this is the same id field from the static navigatorButtons definition
                this.props.navigator.showModal({
                    screen: 'uport.scanner',
                    animated: true,
                    navigatorStyle: {
                        navBarHidden: true
                    }
                })
            }
        }
    }

    componentDidMount() {
        this.updateInAppNotificationBadge(this.props.unreadNoticationCount)

        if(!isIOS) {
            MaterialIcons.getImageSource('qrcode-scan', 26, '#FFFFFF').then(icon => {
                this.props.navigator.setButtons(
                    {
                        fab: {
                            collapsedId: 'scan',
                            collapsedIcon: icon,
                            collapsedIconColor: colors.white,
                            backgroundColor: colors.brand
                        },
                    }
                )
            })
        }
    }

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
        }
    }
    renderItem ({item, index}) {
        return (
        <View key={`activity-${item.id}`}>
            {this.getNotificationType(item, this.props.lookupIssuer, this.props.selectRequest)}
        </View>
        )
    }

    updateInAppNotificationBadge(count) {
        this.props.navigator.setTabBadge({
            tabIndex: 2,
            badge: count || null,
            badgeColor: colors.red,
        })
    }

    componentDidUpdate(prevProps) {
        if(prevProps.unreadNoticationCount !== this.props.unreadNoticationCount) {
            this.updateInAppNotificationBadge(this.props.unreadNoticationCount)
        }   
    }

    renderNoNotifications() {
        return (
            <View style={styles.emptyStateContainer}>
                <Text style={{fontSize: 40, padding: 20}}>🎉</Text>
                <Text style={{fontSize: 22, fontWeight: 'bold', fontFamily: 'Montserrat'}}>Looking good!</Text>
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


    render () {
        return count(this.props.notifications)
            ? this.renderNotifications()
            : this.renderNoNotifications()
    }
}

const styles = StyleSheet.create({
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
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

const mapStateToProps = (state) => (
  {
    unreadNoticationCount: notificationCount(state),
    lookupIssuer: (clientId) => toJs(externalProfile(state, clientId)),
    notifications: notifications(state),
    requested: (activity) => requestedClaims(state, activity && activity.requested)
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