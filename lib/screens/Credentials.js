import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Linking,
} from 'react-native'
import { Icon, Theme, Device } from '@kancha'
import { Navigation } from 'react-native-navigation'
import { toJs } from 'mori'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { connect } from 'react-redux'
import { notificationCount } from 'uPortMobile/lib/selectors/activities'
import { ownClaims } from 'uPortMobile/lib/selectors/identities'
import { parseClaimItem, extractClaimType } from 'uPortMobile/lib/utilities/parseClaims'
import { onlyLatestAttestationsWithIssuer } from 'uPortMobile/lib/selectors/attestations'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Feather from 'react-native-vector-icons/Feather'
import SCREENS from './Screens'

class Accounts extends React.Component {
  constructor(props) {
    super(props)

    this.renderCard = this.renderCard.bind(this)
    Navigation.events().bindComponent(this)
  }

  componentDidMount() {
    this.setDefaultButtons()
  }

  /** Method from Navigator */
  navigationButtonPressed(event) {
    if (event.buttonId === 'scanButton') {
      Navigation.mergeOptions('Scanner', {
        sideMenu: {
          right: {
            visible: true,
          },
        },
      })
    }
  }

  async setDefaultButtons() {
    const scanIcon = await Icon.getImageSource('ionicons', Icon.Names.scan, 30)
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        ...(Device.isIOS
          ? {
              rightButtons: [
                {
                  id: 'scanButton',
                  icon: scanIcon,
                  color: 'white',
                },
              ],
            }
          : {}),
      },
    })
  }

  renderCard({ item }) {
    const { claimCardHeader } = parseClaimItem(item)
    return (
      <TouchableOpacity
        onPress={() =>
          Navigation.push(this.props.componentId, {
            component: {
              name: SCREENS.Credential,
              passProps: { verification: item, claimType: extractClaimType(item) },
            },
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
              <Text style={styles.titleText}>{claimCardHeader}</Text>
              <Text style={styles.subtitleText}>{item.issuer && item.issuer.name && item.issuer.name}</Text>
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
            <Text style={styles.titleText}>Try uPort</Text>
            <Text style={styles.subtitleText}>Tap to start in your browser</Text>
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
            keyExtractor={(item, index) => `${item.token}-${index}`}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.intro}>
              <Text style={styles.introHeader}>Get started</Text>
              <Text style={styles.introtext}>Try out uPort and receive your first credential.</Text>
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
    verifications: onlyLatestAttestationsWithIssuer(state),
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
