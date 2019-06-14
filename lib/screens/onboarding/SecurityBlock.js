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
import { Text, StyleSheet, AppState } from 'react-native'
import ProcessCard from '../../components/shared/ProcessCard'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { onboardingStyles, textStyles } from 'uPortMobile/lib/styles/globalStyles'
import { RNUportSigner } from 'react-native-uport-signer'
import { Navigation } from 'react-native-navigation'

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    margin: 45,
  },
  message: {
    marginBottom: 22,
  },
})

class OnboardingSecurityBlock extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      appState: AppState.currentState,
    }
    this._handleAppStateChange = this._handleAppStateChange.bind(this)
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange = nextAppState => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      RNUportSigner.hasSecureKeyguard().then(hasSecureKeyguard => {
        if (hasSecureKeyguard) {
          Navigation.popToRoot(this.props.componentId)
        }
      })
    }
    this.setState({ appState: nextAppState })
  }

  render() {
    return (
      <ProcessCard
        actionText='Go To Security Settings'
        onContinue={() => {
          RNUportSigner.launchSecuritySettings()
        }}>
        <Text style={onboardingStyles.title}>Update Security Settings</Text>
        <Ionicons size={100} name='warning' color={'#D63A59'} />
        <Text style={[textStyles.p, styles.message]}>
          Uport ID requires that your device is protected by a pin or password.
        </Text>
        <Text style={[textStyles.p, styles.message]}>
          Navigate to the security settings for your device and set one to continue.
        </Text>
      </ProcessCard>
    )
  }
}

export default OnboardingSecurityBlock
