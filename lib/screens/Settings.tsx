/***
 *  Copyright (C) 2018 ConsenSys AG
 *
 *  This file is part of uPort Mobile App
 *  uPort Mobile App is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  uPort Mobile App is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  ERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ***/

import * as React from 'react'
import { connect } from 'react-redux'
import { Screen, ListItem, Section, Device, Container } from '@kancha'
import { Navigation } from 'react-native-navigation'
import SCREENS from '../screens/Screens'
import { connections } from 'uPortMobile/lib/selectors/identities'
import { hdRootAddress, seedConfirmedSelector } from 'uPortMobile/lib/selectors/hdWallet'

interface SettingsProps {
  componentId: string
  connections: any[]
  hasHDWallet: boolean
  seedConfirmed: boolean
  version: number | string
  channel: string
}

interface SettingsState {
  devMode: boolean
  count: number
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
  constructor(props: SettingsProps) {
    super(props)

    /**
     * Enable devmode in simulator by default
     */
    this.state = {
      devMode: __DEV__ ? true : false,
      count: 0,
    }
  }

  goToScreen(screenID: string) {
    Navigation.push(this.props.componentId, {
      component: {
        name: screenID,
        options: {
          topBar: {
            largeTitle: {
              visible: false,
            },
          },
        },
      },
    })
  }

  incrementDeveloperModeCount() {
    this.setState(state => {
      return {
        count: state.count + 1,
        devMode: state.count >= 10,
      }
    })
  }

  render() {
    return (
      <Screen>
        <Section>
          <ListItem
            accessoryRight={`${this.props.version} (${this.props.channel})`}
            onPress={() => this.incrementDeveloperModeCount()}
            hideForwardArrow
          >
            Version
          </ListItem>
          <ListItem onPress={() => this.goToScreen(SCREENS.UPortId)}>uPort ID</ListItem>
          <ListItem onPress={() => this.goToScreen(SCREENS.TryUport)}>Try uPort</ListItem>
          <ListItem externalLink={'https://uport.zendesk.com/hc/en-us/requests/new'} last>
            Support
          </ListItem>
        </Section>
        {this.props.hasHDWallet && (
          <Section>
            <ListItem onPress={() => this.goToScreen(SCREENS.BACKUP.DataBackupInstructions)}>Account Back Up</ListItem>
            <ListItem
              warn={!this.props.seedConfirmed}
              accessoryRight={this.props.seedConfirmed ? undefined : 'Account At Risk'}
              onPress={() => this.goToScreen(SCREENS.BACKUP.CreateSeedInstructions)}
              last
            >
              Account Recovery
            </ListItem>
          </Section>
        )}
        <Section>
          <ListItem onPress={() => this.goToScreen(SCREENS.Device)}>Device</ListItem>
          {this.props.hasHDWallet && (
            <ListItem onPress={() => this.goToScreen(SCREENS.Hub)}>Identity Hub Status</ListItem>
          )}
          <ListItem onPress={() => this.goToScreen(SCREENS.Status)}>System Messages</ListItem>
          <ListItem onPress={() => this.goToScreen(SCREENS.Network)} last>
            Network
          </ListItem>
        </Section>
        <Section>
          <ListItem onPress={() => this.goToScreen(SCREENS.Privacy)}>Privacy Policy</ListItem>
          <ListItem last accessoryRight={'v1.2 (5/24/2018)'} onPress={() => this.goToScreen(SCREENS.Terms)}>
            Terms &amp; Conditions
          </ListItem>
        </Section>
        {this.state.devMode && (
          <Section title={'Developer Options'}>
            <ListItem last onPress={() => this.goToScreen(SCREENS.DesignSystem)}>
              Design System
            </ListItem>
          </Section>
        )}
        <Container paddingBottom />
      </Screen>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    connections: connections(state) || [],
    hasHDWallet: !!hdRootAddress(state),
    seedConfirmed: seedConfirmedSelector(state),
    version: Device.buildNumber,
    channel: state.settings && state.settings.channel,
  }
}

export default connect(mapStateToProps)(Settings)
