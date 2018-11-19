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
import { View, Platform, KeyboardAvoidingView, TouchableOpacity, Clipboard } from 'react-native'
import { Text, KeyboardAwareScrollView, Checkbox } from '../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { OnboardingButton } from '../shared/Button'
import { seedWords } from 'uPortMobile/lib/selectors/recovery'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

import _ from 'lodash'

export class SeedBackupPhrase extends React.Component {

  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  constructor(props) {
    super(props)
    this.state = {
      copied: false
    }
    this.handleCopyToClipboard = this.handleCopyToClipboard.bind(this)
  }

  handleCopyToClipboard() {
    Clipboard.setString(this.props.seedWords.join(' '))
    this.setState({copied: true})
  }


  render () {
    const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
    
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView overScrollMode='always'>
          <Text p>This is your personal Recovery Phrase. This phrase protects your identity, so keep it safe and private. We recommend physically writing it down and storing copies in different locations.</Text>
          <View style={styles.seedPhraseCard}>
            <Text seedPhraseTitle>Recovery Phrase</Text>
            <View style={styles.seedPhraseCardColumnWrapper}>

              {_.map(_.chunk(this.props.seedWords, 6), (chunk, chunkIdx) => (
                <View key={chunkIdx} style={styles.column}>
                  {chunk.map((word, key) => (
                    <View key={key} style={styles.row}>
                      <Text seedPhraseNumber>{chunkIdx * 6 + 1 + key}.</Text>
                      <Text seedPhraseWord>{word}</Text>
                    </View>
                  ))}
                </View>  
              ))}

            </View>
          </View>

          <TouchableOpacity onPress={this.handleCopyToClipboard}>
            <Text infoButtonLabel>{this.state.copied ? '✓ Recovery Phrase Copied' : 'Copy To Clipboard'}</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
        <OnboardingButton
          onPress={() => this.props.navigator.push({
            screen: 'backup.seedConfirm',
            title: 'Your Recovery Phrase',
            backButtonTitle: '',
          })}
          >
          {'Confirm Seed'}
        </OnboardingButton>
      </View>
    )
  }
}

SeedBackupPhrase.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    seedWords: seedWords(state)
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
   
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SeedBackupPhrase)
