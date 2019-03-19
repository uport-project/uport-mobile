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
  StyleSheet,
  View,
  Image
} from 'react-native'
import { connectTheme } from 'uPortMobile/lib/styles'
import {Base as ProcessCard} from 'uPortMobile/lib/components/shared/ProcessCard'
import { Text } from 'uPortMobile/lib/components/shared'

// Selectors
import {
  currentStoredIdentity,
  otherIdentities,
  segmentId
} from 'uPortMobile/lib/selectors/identities'

import {
  switchIdentity
} from 'uPortMobile/lib/actions/uportActions'

import { track } from 'uPortMobile/lib/actions/metricActions'

export class OnboardingStart extends React.Component {
  constructor () {
    super()
    this.state = {
      cancelTouched: false,
      panel: 0,
      resetTouched: false,
      touched: false
    }
    // this.handleCancelPress = this.handleCancelPress.bind(this)
    this.handleCreatePress = this.handleCreatePress.bind(this)
    // this.handleRecoveryStart = this.handleRecoveryStart.bind(this)
  }
  componentDidMount () {
    this.props.trackSegment('Start')
  }
  handleCreatePress () {
    this.props.navigator.push({
      screen: 'onboarding.terms',
      title: 'Terms and Conditions',
      navigatorStyle: {
        navBarHidden: true
      }
    })
    // if (this.props.segmentId) analytics.track({userId: this.props.segmentId, event: '[MOBILE] Onboarding Start Create'})
  }
  // handleCancelPress () {
  //   this.props.switchIdentity(this.props.storedIdentity)
  //   this.props.navigator.pop()
  // }
  // handleRecoveryStart () {
  //   this.props.startSocialRecovery()
  //   this.props.navigator.push({
  //     screen: 'onboarding.recovery'
  //   })
  // }
  render () {
    return (
      <ProcessCard
        actionText='Create Identity'
        onContinue={this.handleCreatePress}
        skipTitle='Recover Identity'
        skippable
        onSkip={() => this.props.navigator.push({
          screen: 'recovery.seedInstructions',
          title: 'Terms and Conditions',
          navigatorStyle: {
            navBarHidden: true
          }
        })}
        >
          <Image
            style={{alignSelf: 'center', marginTop: 50, marginBottom: 40}}
            source={require('uPortMobile/assets/images/uport-blurple.png')}
          />
          <Text title>Mobile Identity</Text>
      </ProcessCard>
    )
  }
}

// { false && this.props.otherIdentities.length > 0
//   ? <TouchableHighlight
//     onPress={this.handleCancelPress}
//     style={{backgroundColor: 'rgba(0, 0, 0, 0.5'}}
//     >
//     <View style={[styles.button, {backgroundColor: this.state.cancelTouched ? 'white' : '#007AFF', marginBottom: heightRatio(30)}]}>
//       <Text style={[styles.buttonText, {color: this.state.cancelTouched ? colors.uportBlue : 'white'}]}>
//         Cancel
//       </Text>
//     </View>
//   </TouchableHighlight>
//   : null
// }
// { false ? <TouchableOpacity onPress={this.handleRecoveryStart}>
//   <View style={[styles.button, {borderWidth: 1}]}>
//     <Text style={[styles.buttonText, {color: 'black'}]}>
//       Restore
//     </Text>
//   </View>
// </TouchableOpacity>: null }

OnboardingStart.propTypes = {
  fetchCurrentCountry: PropTypes.func,
  navigator: PropTypes.object,
  otherIdentities: PropTypes.array,
  segmentId: PropTypes.string,
  storedIdentity: PropTypes.string,
  switchIdentity: PropTypes.func,
  trackSegment: PropTypes.func
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    otherIdentities: otherIdentities(state),
    segmentId: segmentId(state),
    storedIdentity: currentStoredIdentity(state)
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    fetchCurrentCountry: () => {
      dispatch(fetchCurrentCountry())
    },
    switchIdentity: (address) => {
      dispatch(switchIdentity(address))
    },
    trackSegment: (event) => {
      dispatch(track(`Onboarding ${event}`))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(OnboardingStart))
