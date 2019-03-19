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
import { View, Platform, KeyboardAvoidingView } from 'react-native'
import { Text, KeyboardAwareScrollView, Checkbox } from '../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { seedWords } from 'uPortMobile/lib/selectors/recovery'
import { showRecoverySeed } from 'uPortMobile/lib/actions/recoveryActions'
import { OnboardingButton } from '../shared/Button'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

export class SeedBackupInstructions extends React.Component {

  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  constructor (props) {
    super(props)
    this.state = {
      agree: false
    }
    this.handleOnContinuePress = this.handleOnContinuePress.bind(this)
    this.pushNextScreen = this.pushNextScreen.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.seedWords.length == 0 && nextProps.seedWords.length > 0) {
      this.pushNextScreen()
    }
  }  

  handleOnContinuePress() {
    if (this.props.seedWords.length > 0) {
      this.pushNextScreen()      
    } else {
      this.props.showRecoverySeed()
    }
  }

  pushNextScreen() {
    this.props.navigator.push({
      screen: 'backup.seedPhrase',
      title: 'Your Recovery Phrase',
      backButtonTitle: '',
    })
  }

  render () {
    const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView overScrollMode='always'>
          <Text p>Your account is currently at risk. Please back up your seed phrase to ensure that you can recover your account in the event of a lost or compromised device.</Text>
          <Checkbox
            checked={this.state.agree}
            onPress={()=> {this.setState({agree: !this.state.agree})}}
            labelText='I understand that I am responsible for keeping my seed phrase private and safe. Losing my seed phrase will result in an inability to recover my account.'
            />
        </KeyboardAwareScrollView>
        <OnboardingButton
          disabled={!this.state.agree}
          onPress={this.handleOnContinuePress}
          >
          {'Setup Seed Recovery'}
        </OnboardingButton>
      </View>
    )
  }
}

SeedBackupInstructions.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    seedWords: seedWords(state)
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    showRecoverySeed: () => dispatch(showRecoverySeed())
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SeedBackupInstructions)
