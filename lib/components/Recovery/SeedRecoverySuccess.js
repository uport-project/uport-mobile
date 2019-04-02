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
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, Platform, ScrollView } from 'react-native'
import { Text, KeyboardAwareScrollView, Checkbox } from '../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { Button, Centered } from '../shared/Button'
import Status from 'uPortMobile/lib/components/shared/Status'
import SuccessIcon from 'uPortMobile/lib/components/shared/SuccessIcon'
import { startMain } from 'uPortMobile/lib/start'

import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import { fuelToken } from 'uPortMobile/lib/selectors/chains'
import { working, errorMessage } from 'uPortMobile/lib/selectors/processStatus'

import { track } from 'uPortMobile/lib/actions/metricActions'

export class SeedRecoverySuccess extends React.Component {
  constructor () {
    super()
    this.handlePress = this.handlePress.bind(this)
  }

  handlePress () {
    if (this.props.fullyRestored) {
      this.props.trackSegment('restored from backup')
      startMain()
    } else {
      this.props.navigator.push({
        screen: 'onboarding.terms',
        navigatorStyle: {
          navBarHidden: true
        }
      })
    }
  }
  render () {
    const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <View style={[styles.container, styles.brandContainer]}>
        <View style={[styles.column, styles.infoBox]}>
          <Text title invert>Success</Text>
          <View style={{paddingBottom: 30, alignItems: 'center'}}>
            <SuccessIcon width={100} height={100} />
          </View>
          { this.props.working || !!this.props.errorMessage
          ? <Status process='sync' color='white' />
          : <View>
            <Text p noMargin invert>Your account has been</Text>
            <Text p noMargin invert>successfully recovered!</Text>
          </View>}
        </View>
        <Centered>
          <Button
            style={styles.invertedButton}
            disabled={this.props.working || !!this.props.errorMessage}
            textStyle={styles.invert}
            onPress={this.handlePress}
            >
            {'Continue'}
          </Button>
        </Centered>
      </View>
    )
  }
}

SeedRecoverySuccess.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  const address = currentAddress(state)
  const ft = fuelToken(state)
  console.log({address, ft})
  return {
    working: working(state, 'sync'),
    errorMessage: errorMessage(state, 'sync'),
    fullyRestored: address && address !== 'new' // && ft
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    trackSegment: (event) => {
      dispatch(track(`Onboarding Complete ${event}`))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(SeedRecoverySuccess))
