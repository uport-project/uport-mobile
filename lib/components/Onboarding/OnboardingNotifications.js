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
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'

// Styles
import {colors, font, fontLight, textStyles, onboardingStyles} from 'uPortMobile/lib/styles/globalStyles'
import Icon from 'react-native-vector-icons/Ionicons'

import Permissions from 'react-native-permissions'
import { registerDeviceForNotifications } from 'uPortMobile/lib/actions/snsRegistrationActions'
import ProcessCard from '../shared/ProcessCard'
import { Text } from '../shared'
import { connectTheme } from 'uPortMobile/lib/styles'

const styles = StyleSheet.create({
  benefitText: {
    fontFamily: fontLight,
    marginLeft: 16,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
    color: colors.grey74
  }
})

const Benefit = (props) => (
  <View style={{alignSelf: 'stretch', alignItems: 'center', justifyContent: 'flex-start', margin: 16, flexDirection: 'row'}}>
    <Icon name='ios-checkmark-circle-outline' size={32} color={colors.purple} />
    <Text style={styles.benefitText}>{props.children}</Text>
  </View>
)

export const OnboardingNotifications = (props) => {
  return (
    <ProcessCard
      skippable
      actionText='Turn on notifications'
      onProcess={() => {
        Permissions.request('notification').then(response => {
          if (response === 'authorized') {
            props.registerDeviceForNotifications()
            props.navigator.push({
              screen: 'onboarding.testnetWarning',
              navigatorStyle: {
                navBarHidden: true
              }
            })
          }
        })
      }}
      onSkip={() => props.navigator.push({
        screen: 'onboarding.testnetWarning',
        navigatorStyle: {
          navBarHidden: true
        }
      })}
    >
      <Text title>
        Enable Notifications
      </Text>
      <Text p>
        App notifications are the main way to interact with others and stay notified of activity regarding your identity
      </Text>
      <View style={{alignItems: 'stretch', flex: 0, justifyContent: 'flex-start'}}>
        <Benefit>Login requests</Benefit>
        <Benefit>Pending transactions</Benefit>
        <Benefit>Signature requests</Benefit>
        <Benefit>New verifications</Benefit>
      </View>
    </ProcessCard>
  )
}

OnboardingNotifications.propTypes = {
  registerDeviceForNotifications: PropTypes.func
}

export const mapDispatchToProps = (dispatch) => {
  return {
    registerDeviceForNotifications: () => {
      dispatch(registerDeviceForNotifications())
    }
  }
}
export default connect(null, mapDispatchToProps)(connectTheme(OnboardingNotifications))
