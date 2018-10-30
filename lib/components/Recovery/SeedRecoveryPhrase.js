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
import bip39 from 'uPortMobile/lib/browserified/bip39'
import { connect } from 'react-redux'
import { View, Platform, KeyboardAvoidingView, TouchableOpacity, ScrollView } from 'react-native'
import { Text, KeyboardAwareScrollView, TextInput } from '../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { startSeedRecovery } from 'uPortMobile/lib/actions/recoveryActions'
import { clearMessage } from 'uPortMobile/lib/actions/processStatusActions'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import { working, errorMessage } from 'uPortMobile/lib/selectors/processStatus'
import { OnboardingButton } from '../shared/Button'
import Status from '../shared/Status'
import _ from 'lodash'

export class SeedRecoveryPhrase extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      phrase: '',
      wordlist: bip39.wordlists.EN,
      suggestedWords: []
    }
    this.handleStartSeedRecovery = this.handleStartSeedRecovery.bind(this)
    this.handlePhraseChange = this.handlePhraseChange.bind(this)
    this.addWord = this.addWord.bind(this)
    this.isValidPhrase = this.isValidPhrase.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if ((!this.props.currentAddress && nextProps.currentAddress) 
      ||(this.props.currentAddress && nextProps.currentAddress !== this.props.currentAddress) ) {
      this.props.navigator.push({
        screen: 'recovery.seedSuccess',
        backButtonTitle: '',
        navigatorStyle: {
          navBarHidden: true
        }
      })
    }
  }    

  handleStartSeedRecovery() {
    this.props.startSeedRecovery(this.state.phrase.trim())
  }

  handlePhraseChange(phrase) {
    if (this.props.errorMessage) {
      this.props.clearMessage()
    }

    const lastWord = phrase.toLowerCase().split(' ').pop()
    let suggestedWords = []

    if (lastWord.length > 1) {
      suggestedWords = _.filter(this.state.wordlist, (word) => _.startsWith(word, lastWord))
      if (suggestedWords.length === 1 && suggestedWords[0] === lastWord) {
        suggestedWords = []
      }
    }

    this.setState({phrase, suggestedWords})
  }

  addWord(word) {
    const words = this.state.phrase.split(' ')
    words.pop()
    words.push(word)
    const phrase = `${words.join(' ')} `
    this.setState({phrase, suggestedWords: []})
  }

  isValidPhrase() {
    return this.state.phrase.trim().split(/\s+/g).length === 12
      && bip39.validateMnemonic(this.state.phrase.trim())
  }

  render () {

    const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <View style={styles.container}>
        <View style={[styles.contentContainer, styles.container]}>
          <Text title>Enter Recovery Phrase</Text>
          <TextInput
            multiline
            autoCorrect={false}
            autoCapitalize='none'
            label='Recovery Phrase'
            placeholder='Enter 12-word recovery phrase'
            value={this.state.phrase}
            onChangeText={this.handlePhraseChange}
            />
          <Status process='recovery' />
          <View style={styles.seedRecoverySuggestedWords}>
            {this.state.suggestedWords.map(word => (
              <TouchableOpacity 
                key={word} 
                disabled={word === ''}
                onPress={() => this.addWord(word)}>
                <View style={styles.seedRecoveryWordButton}>
                  <Text seedConfirmButtonLabel>{word}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={0}
          >
          <View style={styles.opaqueContainer}>
          <OnboardingButton
            onPress={this.handleStartSeedRecovery}
            disabled={this.props.working || !this.isValidPhrase()}
            >
            {'Next'}
          </OnboardingButton>
          </View>
        </KeyboardAvoidingView>
      </View>
    )
  }
}

SeedRecoveryPhrase.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    currentAddress: currentAddress(state),
    working: working(state, 'recovery'),
    errorMessage: errorMessage(state, 'recovery')
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    startSeedRecovery: (phrase) => dispatch(startSeedRecovery(phrase)),
    clearMessage: () => dispatch(clearMessage('recovery')),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(SeedRecoveryPhrase))
