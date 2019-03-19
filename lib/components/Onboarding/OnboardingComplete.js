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
// Frameworks
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Image,
  StyleSheet,
  Text,
  View,
  Platform
} from 'react-native'

import { startMain } from 'uPortMobile/lib/start'

// Actions
import { activationEvent } from 'uPortMobile/lib/actions/userActivationActions'
import { registerDeviceForNotifications } from 'uPortMobile/lib/actions/snsRegistrationActions'

// Selectors
import {
  currentAddress,
  segmentId
} from 'uPortMobile/lib/selectors/identities'
import { completed } from 'uPortMobile/lib/selectors/processStatus'

// Styles
import { Button, Centered } from '../shared/Button'
// import ProcessCard from '../shared/ProcessCard'
import Status from '../shared/Status'

// Styles
import {colors, textStyles, onboardingStyles} from 'uPortMobile/lib/styles/globalStyles'

import { track } from 'uPortMobile/lib/actions/metricActions'

const styles = StyleSheet.create({
  button: {
    borderColor: colors.white,
    borderWidth: 1
  },
  buttonText: {
    color: colors.white
  }
})

export class OnboardingComplete extends React.Component {
  constructor () {
    super()
    this.state = {
      touched: false
    }
    this.handlePress = this.handlePress.bind(this)
  }
  componentDidMount () {
    this.props.trackSegment('Open')
    Platform.OS === 'android' ? this.props.registerDeviceForNotifications() : null
  }

  handlePress () {
    this.props.trackSegment('Get Started')
    startMain()
    this.props.finishOnboarding()
  }

  render () {
    const finishedText = 'Congratulations! You created your identity.'
    const waitingText = 'Registering your identity may take up to a few minutes.'
    return (
      <View
        style={[onboardingStyles.container, {backgroundColor: colors.purple, padding: 50, justifyContent: 'space-around'}]}
      >
        <View style={{alignItems: 'center'}}>
          <Image
            source={require('uPortMobile/assets/images/uport-white.png')} />
        </View>
        <Text style={[textStyles.p, {color: colors.white}]}>
          {this.props.completed ? finishedText : waitingText}
        </Text>
        <Centered>
          <Button
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={this.handlePress}
            disabled={!this.props.completed}
            opacity={this.props.completed ? 1 : 0.3}
          >
            Continue
          </Button>
        </Centered>
      </View>
    )
  }
}

OnboardingComplete.propTypes = {
  address: PropTypes.string,
  segmentId: PropTypes.string,
  finishOnboarding: PropTypes.func,
  completed: PropTypes.bool,
  trackSegment: PropTypes.func
}
const mapStateToProps = (state) => {
  return {
    address: currentAddress(state),
    segmentId: segmentId(state),
    completed: !!currentAddress(state)
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    finishOnboarding: () => {
      dispatch(activationEvent('ONBOARDED'))
      dispatch(track('Onboarding Complete Finished'))
    },
    registerDeviceForNotifications: () => {
      dispatch(registerDeviceForNotifications())
    },
    trackSegment: (event) => {
      dispatch(track(`Onboarding Complete ${event}`))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingComplete)
