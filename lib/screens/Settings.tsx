import * as React from 'react'
import { connect } from 'react-redux'
import { Screen, ListItem, Section, Theme, Device } from '@kancha'

import { Navigator } from 'react-native-navigation'

import DeviceInfo from 'react-native-device-info'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { connections } from 'uPortMobile/lib/selectors/identities'
import { hdRootAddress, seedConfirmedSelector } from 'uPortMobile/lib/selectors/hdWallet'

interface SettingsProps {
  navigator: Navigator
  connections: any[]
  hasHDWallet: boolean
  seedConfirmed: boolean
  version: number | string
  channel: string
}

class Settings extends React.Component<SettingsProps> {
  static navigatorStyle = {
    ...Theme.navigation,
    largeTitle: true,
  }

  constructor(props: SettingsProps) {
    super(props)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
  }

  onNavigatorEvent(event: any) {
    // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') {
      // this is the event type for button presses
      if (event.id === 'scan') {
        // this is the same id field from the static navigatorButtons definition
        this.props.navigator.showModal({
          screen: 'uport.scanner',
          navigatorStyle: {
            navBarHidden: true,
          },
        })
      }
    }
  }

  componentDidMount() {
    if (!Device.isIOS) {
      MaterialIcons.getImageSource('qrcode-scan', 26, '#FFFFFF').then(icon => {
        this.props.navigator.setButtons({
          fab: {
            collapsedId: 'scan',
            collapsedIcon: icon,
            collapsedIconColor: Theme.colors.primary.background,
            backgroundColor: Theme.colors.brand,
          },
        })
      })
    }
  }

  goToScreen(screenID: string) {
    this.props.navigator.push({ screen: screenID })
  }

  render() {
    return (
      <Screen>
        <Section>
          <ListItem accessoryRight={`${this.props.version} (${this.props.channel})`}>App Version</ListItem>
          <ListItem onPress={() => this.goToScreen('advanced.uport')}>uPort ID</ListItem>
          <ListItem onPress={() => this.goToScreen('advanced.try-uport')}>Try uPort</ListItem>
          <ListItem externalLink={'https://chat.uport.me'} last>
            Support
          </ListItem>
        </Section>
        {this.props.hasHDWallet && (
          <Section>
            <ListItem
              warn={!this.props.seedConfirmed}
              accessoryRight={this.props.seedConfirmed ? undefined : 'Account At Risk'}
              onPress={() => this.goToScreen('backup.seedInstructions')}
            >
              Account Back Up
            </ListItem>
            <ListItem last onPress={() => this.goToScreen('backup.dataInstructions')}>
              Account Recovery
            </ListItem>
          </Section>
        )}
        <Section>
          <ListItem onPress={() => this.goToScreen('advanced.device')}>Device</ListItem>
          {this.props.hasHDWallet && (
            <ListItem onPress={() => this.goToScreen('advanced.hub')}>Identity Hub Status</ListItem>
          )}
          <ListItem onPress={() => this.goToScreen('advanced.status')}>System Messages</ListItem>
          <ListItem onPress={() => this.goToScreen('advanced.network')} last>
            Network
          </ListItem>
        </Section>
        <Section>
          <ListItem onPress={() => this.goToScreen('settings.privacy')}>Privacy Policy</ListItem>
          <ListItem last accessoryRight={'v1.2 (5/24/2018)'} onPress={() => this.goToScreen('settings.terms')}>
            Terms &amp; Conditions
          </ListItem>
        </Section>
      </Screen>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    connections: connections(state) || [],
    hasHDWallet: !!hdRootAddress(state),
    seedConfirmed: seedConfirmedSelector(state),
    version: DeviceInfo.getBuildNumber(),
    channel: state.settings && state.settings.channel,
  }
}

export default connect(mapStateToProps)(Settings)
