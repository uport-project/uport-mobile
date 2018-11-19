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
import authorize from 'uPortMobile/lib/helpers/authorize'
import { startSwitchingDataBackup } from 'uPortMobile/lib/actions/settingsActions'
import { dataBackup } from 'uPortMobile/lib/selectors/settings'
import { Text, KeyboardAwareScrollView, Checkbox } from '../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { OnboardingButton } from '../shared/Button'
import Status from '../shared/Status'
import { completed, working } from 'uPortMobile/lib/selectors/processStatus'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

export class DataBackupInstructions extends React.Component {

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
    if (this.props.dataBackup !== nextProps.dataBackup) {
      this.pushNextScreen()
    }
  }
  
  pushNextScreen() {
    this.props.navigator.push({
      screen: 'backup.dataSuccess',
      navigatorStyle: {
        navBarHidden: true,
      },
    })  
  }

  handleOnContinuePress() {
    authorize('Verify identity to Backup Account')
    .then(authorized => {
      if (authorized) {
        this.props.startSwitchingDataBackup(!this.props.dataBackup)
      }
    })
  }

  render () {
    const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView overScrollMode='always'>
          <Text p>{!this.props.dataBackup ? 'Your account is not currently backed up. If you need to recover your account, you will be able to recover your uPort ID and main address, but you will not be able to recover claims, credentials, or app-specific accounts.' : 'Your account is currently backed up. This means in the event of a recovery you\'ll be able to recover your uPort ID, application accounts, and associated claims and data. By turning backup off, you will delete the encrypted copy of your data on our backup server and will be able to recover only your uPort ID, but not application accounts, claims or data.'}</Text>
          <Checkbox
            checked={this.state.agree}
            onPress={()=> {this.setState({agree: !this.state.agree})}}
            labelText= {!this.props.dataBackup ? 'I understand that backing up my account stores an encrypted copy of my claims and data on a central server.': 'I understand that turning backup off means I will not be able to restore app-specific Ethereum accounts or any identity data in the event of recovery.'}
            />
        </KeyboardAwareScrollView>
        <Status process='deleteBackup' />
        <Status process='sync' />
        <OnboardingButton
          disabled={this.props.working || !this.state.agree}
          onPress={this.handleOnContinuePress}
          >
          {!this.props.dataBackup ? 'Backup Account' : 'Delete Backup'}
        </OnboardingButton>
      </View>
    )
  }
}

DataBackupInstructions.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    dataBackup: dataBackup(state),
    completedSync: completed(state, 'sync'),
    completedDelete: completed(state, 'deleteBackup'),
    working: working(state, 'deleteBackup'),
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    startSwitchingDataBackup: (value) => dispatch(startSwitchingDataBackup(value))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(DataBackupInstructions)

