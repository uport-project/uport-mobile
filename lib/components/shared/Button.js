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
import React, {Component} from 'react'
import { Text, TouchableHighlight, View, StyleSheet } from 'react-native'
import { colors, font, fontBold } from 'uPortMobile/lib/styles/globalStyles'
import { throttle, debounce } from 'lodash'

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    margin: 15,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  cancelButton: {
    borderColor: colors.grey74,
    borderWidth: 1,
    padding: 15
  },
  primaryButton: {
    backgroundColor: colors.lightPurple,
    padding: 15
  },
  disabledButton: {
    borderWidth: 1,
    borderColor: colors.grey185,
    backgroundColor: 'rgba(0,0,0,0)',
    padding: 15
  },
  buttonText: {
    fontFamily: fontBold,
    fontSize: 18,
    textAlign: 'center'
  },
  cancelButtonText: {
    color: colors.grey74
  },
  disabledButtonText: {
    color: colors.grey185
  },
  primaryButtonText: {
    color: colors.white
  },
  centeredButton: {
    borderColor: colors.green,
    borderWidth: 1,
    marginLeft: 15,
    marginRight: 15
  },
  centeredButtonText: {
    color: colors.green,
    padding: 3,
    fontSize: 18,
    fontFamily: fontBold,
    lineHeight: 25
  },
  skipButton: {
    borderWidth: 0,
    marginTop: 0
  },
  skipButtonText: {
    fontFamily: font,
    fontSize: 18,
    lineHeight: 25,
    color: colors.purple
  }
})

export class Button extends Component {

  constructor (props) {
    super()
    this.onPress = debounce(props.onPress, 1000, {leading: true, trailing: false})
  }
  render () {
    const props = this.props
    const active = this.state && this.state.active
    return (
      <TouchableHighlight
        disabled={props.disabled}
        style={[styles.button, props.disabled ? styles.disabledButton : (props.style || styles.cancelButton)]}
        underlayColor={props.underlayColor || colors.purple}
        onPress={this.onPress}
        onShowUnderlay={() => this.setState({active: true})}
        onHideUnderlay={() => this.setState({active: false})}
      >
        <Text style={[
          styles.buttonText,
          (props.textStyle || styles.cancelButtonText),
          props.disabled
          ? styles.disabledButtonText
          : (active
            ? { color: props.underlayTextColor || colors.white }
            : {})
        ]}>{props.children}</Text>
      </TouchableHighlight>
    )
  }
}

export const PrimaryButton = (props) => (
  <Button
    disabled={props.disabled}
    style={[styles.primaryButton, props.style]}
    textStyle={styles.primaryButtonText}
    onPress={props.onPress}
  >
    {props.children}
  </Button>
)

export const CancelButton = (props) => (
  <Button
    disabled={props.disabled}
    style={[styles.cancelButton, props.style]}
    textStyle={styles.cancelButtonText}
    onPress={props.onPress}
  >
    {props.children || 'Cancel'}
  </Button>
)

export const Centered = (props) => (
  <View style={{flex: 0, alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'center'}}>
    {props.children}
  </View>
)

export const SkipButton = (props) => (
  <Centered>
    <Button
      disabled={props.disabled}
      style={styles.skipButton}
      textStyle={styles.skipButtonText}
      onPress={props.onPress}
    >
      {props.title ? props.title : 'Skip'}
    </Button>
  </Centered>
)

export const CenteredActionButton = (props) => {
  const buttonStyles = props.color ? [styles.centeredButton, {borderColor: props.color}] : styles.centeredButton
  const textStyles = props.color ? [styles.centeredButtonText, {color: props.color}] : styles.centeredButtonText
  return (
    <Centered>
      <Button
        disabled={props.disabled}
        style={buttonStyles}
        textStyle={textStyles}
        onPress={props.onPress}
      >
        {props.children}
      </Button>
    </Centered>
  )
}

export const OnboardingButton = (props) => (
  <CenteredActionButton
    disabled={props.disabled}
    color={props.disabled ? colors.grey216 : colors.purple}
    onPress={props.onPress}
  >
    {props.children}
  </CenteredActionButton>
)

export const AcceptCancelGroup = (props) => {
  return (
    <View style={{flex: 0, flexDirection: 'row', justifyContent: 'space-between'}}>
      <CancelButton onPress={props.onCancel} style={{marginRight: 10}}>
        {props.cancelText}
      </CancelButton>
      <PrimaryButton
        disabled={props.disabled}
        onPress={props.onAccept}>
        {props.acceptText}
      </PrimaryButton>
    </View>
  )
}

export const DangerButton = (props) => (
  <CenteredActionButton
    disabled={props.disabled}
    color={props.disabled ? colors.grey216 : colors.red}
    onPress={props.onPress}
  >
    {props.children}
  </CenteredActionButton>
)
