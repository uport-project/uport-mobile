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
import { showRecoverySeed } from 'uPortMobile/lib/actions/recoveryActions'
import { OnboardingButton, SkipButton } from '../shared/Button'
import RecoveryIcon from 'uPortMobile/lib/components/shared/RecoveryIcon'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet';
import { pendingMigration } from 'uPortMobile/lib/selectors/migrations';
export class SeedRecoveryInstructions extends React.Component {


  render () {
    const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView overScrollMode='always'>
          <Text title>Recover Identity</Text>
          <View style={{paddingBottom: 30, alignItems: 'center'}}>
            <RecoveryIcon width={97} height={108} />
          </View>
          {this.props.migrating
          ? <Text p>It looks like you may have upgraded your device and the keychain was not restored. This could also be the result of a change in the system security settings for your device.</Text>
          : null}
          <Text p>To recover your account you will need to enter your 12-word Recovery Seed Phrase in the order you recieved them.</Text>
        </KeyboardAwareScrollView>
        <OnboardingButton
          onPress={() => this.props.navigator.push({
            screen: 'recovery.seedPhrase',
            backButtonTitle: '',
            navigatorStyle: {
              navBarHidden: false
            }
          })}
          >
          {'Continue'}
        </OnboardingButton>
        <SkipButton
          title='Cancel'
          onPress={() => this.props.navigator.pop()}
          />
      </View>
    )
  }
}

SeedRecoveryInstructions.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    existingIdentity: hdRootAddress(state),
    migrating: pendingMigration(state, 'RecoverSeed')
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(SeedRecoveryInstructions))
