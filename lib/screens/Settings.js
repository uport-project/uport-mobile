import React from 'react'
import { connect } from 'react-redux'
import { Platform } from 'react-native'
import { Screen, ListItem, Section, Theme } from '@kancha'

import DeviceInfo from 'react-native-device-info'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { connections } from 'uPortMobile/lib/selectors/identities'
import {
  hdRootAddress,
  seedConfirmedSelector,
} from 'uPortMobile/lib/selectors/hdWallet'

const isIOS = Platform.OS === 'ios' ? true : false

class Settings extends React.Component {
  static navigatorStyle = {
    largeTitle: true,
    navBarNoBorder: false,
    navBarTransparent: false,
    navBarTranslucent: false,
    navBarBackgroundColor: Theme.colors.primary.brand,
    navBarButtonColor: Theme.colors.primary.background,
    navBarTextColor: Theme.colors.primary.background,
  }

  constructor(props) {
    super(props)

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
  }

  onNavigatorEvent(event) {
    // this is the onPress handler for the two buttons together
    if (event.type == 'NavBarButtonPress') {
      // this is the event type for button presses
      if (event.id == 'scan') {
        // this is the same id field from the static navigatorButtons definition
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

  componentDidMount() {
    if (!isIOS) {
      MaterialIcons.getImageSource('qrcode-scan', 26, '#FFFFFF').then(icon => {
        this.props.navigator.setButtons({
          fab: {
            collapsedId: 'scan',
            collapsedIcon: icon,
            collapsedIconColor: colors.white,
            backgroundColor: colors.brand,
          },
        })
      })
    }
  }

  goToScreen(screenID) {
    this.props.navigator.push({ screen: screenID })
  }

  render() {
    return (
      <Screen>
        <Section>
          <ListItem
            infoNoteRight={`${this.props.version} (${this.props.channel})`}
          >
            App Version
          </ListItem>
          <ListItem onPress={() => this.goToScreen('advanced.uport')}>
            uPort ID
          </ListItem>
          <ListItem onPress={() => this.goToScreen('advanced.try-uport')}>
            Try uPort
          </ListItem>
          <ListItem externalLink={'https://chat.uport.me'} last>
            Support
          </ListItem>
        </Section>
        {this.props.hasHDWallet && (
          <Section>
            <ListItem
              warn={this.props.seedConfirmed == undefined}
              infoNoteRight={
                this.props.seedConfirmed ? undefined : 'Account At Risk'
              }
              onPress={() => this.goToScreen('backup.seedInstructions')}
            >
              Account Back Up
            </ListItem>
            <ListItem
              last
              onPress={() => this.goToScreen('backup.dataInstructions')}
            >
              Account Recovery
            </ListItem>
          </Section>
        )}
        <Section>
          <ListItem onPress={() => this.goToScreen('advanced.device')}>
            Device
          </ListItem>
          {this.props.hasHDWallet && (
            <ListItem onPress={() => this.goToScreen('advanced.hub')}>
              Identity Hub Status
            </ListItem>
          )}
          <ListItem onPress={() => this.goToScreen('advanced.status')}>
            System Messages
          </ListItem>
          <ListItem onPress={() => this.goToScreen('advanced.network')} last>
            Network
          </ListItem>
        </Section>
        <Section>
          <ListItem>Privacy Policy</ListItem>
          <ListItem
            last
            infoNoteRight={'v1.2 (5/24/2018)'}
            onPress={() => this.goToScreen('settings.terms')}
          >
            Terms &amp; Conditions
          </ListItem>
        </Section>
      </Screen>
    )
  }
}

const mapStateToProps = state => {
  return {
    connections: connections(state) || [],
    hasHDWallet: !!hdRootAddress(state),
    seedConfirmed: seedConfirmedSelector(state),
    version: DeviceInfo.getBuildNumber(),
    channel: state.settings && state.settings.channel,
  }
}

export default connect(mapStateToProps)(Settings)
