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
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { setAnalyticsOptOut } from 'uPortMobile/lib/actions/settingsActions'
import ProcessCard from '../shared/ProcessCard'
import { Text, KeyboardAwareScrollView } from '../shared'
import {colors} from 'uPortMobile/lib/styles/globalStyles'
import metrics from 'uPortMobile/lib/styles/metrics'
import { connectTheme } from 'uPortMobile/lib/styles'


export const OnboardingOptOut = (props) => {
  return (
    <ProcessCard
      skippable
      actionText='Agree'
      skipTitle='Opt Out'
      onProcess={() => {
        props.navigator.push({
          screen: 'onboarding.complete',
          navigatorStyle: {
            navBarHidden: true
          }
        })
      }}
      onSkip={() => {
        props.optOut()
        props.navigator.push({
          screen: 'onboarding.complete',
          navigatorStyle: {
            navBarHidden: true
          }
        })
      }}
    >
      <KeyboardAwareScrollView>
        <Text title>
          Help uPort improve
        </Text>
        <Text legal>
          uPort includes basic event tracking to better understand how the app is being used. Events are anonymized and never tracked across a specific user's activities. You may disable this feature below. 
        </Text>
        <Text legal>
          By allowing analytics, you'll help the uPort team track important metrics, which will let us deliver better features and quicker bug fixes!
        </Text>
        <Text legal noMargin>What we track:</Text>
        <Text legal noMargin li>app crashes</Text>
        <Text legal noMargin li>errors during selective disclosure or transaction signing</Text>
        <Text legal noMargin li>number of successful dapp interactions</Text>
        <Text legal li>number of accounts per identity</Text>
        <Text legal bold> * we never collect addresses or private keys</Text>

      </KeyboardAwareScrollView>
    </ProcessCard>

  )
}

OnboardingOptOut.contextTypes = {
  theme: PropTypes.object
}

OnboardingOptOut.propTypes = {
  optOut: PropTypes.func
}

export const mapDispatchToProps = (dispatch) => {
  return {
    optOut: () => {
      dispatch(setAnalyticsOptOut(true))
    }
  }
}
export default connect(null, mapDispatchToProps)(connectTheme(OnboardingOptOut))
