import React from 'react'
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableNativeFeedback,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Linking,
} from 'react-native'
import { toJs, count } from 'mori'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { connect } from 'react-redux'
import { notificationCount } from 'uPortMobile/lib/selectors/activities'
import { currentAddress, ownClaims, myAccounts } from 'uPortMobile/lib/selectors/identities'
import { parseClaimItem, extractClaimType } from 'uPortMobile/lib/utilities/parseClaims'
import { onlyPendingAndLatestAttestations } from 'uPortMobile/lib/selectors/attestations'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Feather from 'react-native-vector-icons/Feather'
const isIOS = Platform.OS === 'ios' ? true : false

class Accounts extends React.Component {
  static navigatorStyle = {
    largeTitle: true,
    navBarTextFontFamily: 'Montserrat',
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  constructor(props) {
    super(props)

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    this.renderCard = this.renderCard.bind(this)
  }

  onNavigatorEvent(event) {
    // this is the onPress handler for the two buttons together
    if (event.type == 'NavBarButtonPress') {
      // this is the event type for button presses
      if (event.id == 'scan' && isIOS) {
        // this is the same id field from the static navigatorButtons definition
        this.props.navigator.toggleDrawer({
          side: 'right',
        })
      } else if (event.id == 'scan' && !isIOS) {
        this.props.navigator.showModal({
          screen: 'uport.scanner',
          animated: true,
          navigatorStyle: {
            navBarHidden: true,
          },
        })
      }
    }
  }

  updateInAppNotificationBadge(count) {
    this.props.navigator.setTabBadge({
      tabIndex: 3,
      badge: count || null,
      badgeColor: colors.red,
    })
  }

  componentDidMount() {
    this.updateInAppNotificationBadge(this.props.unreadNoticationCount)

    MaterialIcons.getImageSource('qrcode-scan', 26, '#FFFFFF').then(icon => {
      const IOSButtons = {
        rightButtons: [
          {
            id: 'scan',
            icon: icon,
          },
        ],
      }
      const AndroidButtons = {
        fab: {
          collapsedId: 'scan',
          collapsedIcon: icon,
          collapsedIconColor: colors.white,
          backgroundColor: colors.brand,
        },
      }
      this.props.navigator.setButtons(isIOS ? IOSButtons : AndroidButtons)
    })
  }

  renderCard({ item }) {
    const { claimTypeHeader, claimTypeTitle, claimCardHeader, claimSubject } = parseClaimItem(item)
    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigator.push({
            screen: 'screen.Credential',
            passProps: { verification: item, claimType: extractClaimType(item) },
          })
        }
        style={styles.card}
      >
        <View style={styles.cardInner}>
          <View style={[styles.header, { flexDirection: 'row' }]}>
            <View>
              <Avatar
                size={60}
                source={item.issuer || { avatar: require('uPortMobile/assets/images/ethereum-white-icon.png') }}
              />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.titleText}>{'Some reallly really long very long name'}</Text>
              <Text style={styles.subtitleText}>
                {item.issuer && item.issuer.name ? item.issuer.name : `Unknown issuer`}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  openDemoUrl(url) {
    Linking.openURL(`https://${url}`)
  }

  renderUpdateProfile() {
    return (
      <View style={{ padding: 15 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Hey {this.props.name}</Text>
      </View>
    )
  }

  renderTryDemoCard() {
    return (
      <TouchableOpacity style={[styles.card, styles.demoCard]} onPress={() => this.openDemoUrl('demo.uport.me')}>
        <View style={styles.cardInner}>
          <View style={styles.header}>
            <Text style={styles.titleText}>Try uPort Demo</Text>
            <Text style={styles.subtitleText}>Tap to start the demo in your browser</Text>
          </View>
          <View style={[styles.banner, { paddingVertical: 25 }]}>
            <Feather name='external-link' size={80} color={'#426996'} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle='light-content' />
        {this.props.verifications.length > 0 ? (
          <FlatList
            contentContainerStyle={styles.container}
            data={this.props.verifications}
            renderItem={this.renderCard}
            // ListHeaderComponent={this.renderUpdateProfile.bind(this)}
            // ListFooterComponent={this.renderTryDemoCard.bind(this)}
            keyExtractor={(item, index) => `${item.token}-${index}`}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.intro}>
              <Text style={styles.introHeader}>Get started</Text>
              <Text style={styles.introtext}>Try out the uPort demo to get your first credential.</Text>
              <Feather name='chevron-down' size={30} color={colors.grey130} style={{ alignSelf: 'center' }} />
            </View>
            {this.renderTryDemoCard()}
          </ScrollView>
        )}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  intro: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    margin: 10,
    borderColor: '#F3EAD3',
  },
  introtext: {
    fontSize: 14,
    lineHeight: 24,
    color: '#333333',
  },
  introHeader: {
    marginBottom: 5,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 26,
    color: '#333333',
  },
  container: {
    paddingTop: 30,
  },
  scrollContent: {},
  card: {
    // height: 200,
    shadowOpacity: 0.2,
    shadowRadius: 25,
    shadowColor: '#000000',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 5,
    elevation: 3,
    marginHorizontal: 20,
  },
  cardInner: {
    flex: 1,
    borderRadius: 5,
  },
  header: {
    padding: 15,
    flex: 1,
  },
  titleText: {
    fontFamily: 'Montserrat',
    fontSize: 20,
    paddingBottom: 5,
    color: '#333333',
    flexWrap: 'wrap',
  },
  subtitleText: {
    fontSize: 14,
    color: '#888888',
  },
  banner: {
    backgroundColor: colors.white246,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const mapStateToProps = state => {
  const userData = toJs(ownClaims(state)) || {}
  return {
    verifications: onlyPendingAndLatestAttestations(state),
    unreadNoticationCount: notificationCount(state),
    name: typeof state.myInfo.changed.name !== 'undefined' ? state.myInfo.changed.name : userData.name,
  }
}

export const mapDispatchToProps = dispatch => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Accounts)
