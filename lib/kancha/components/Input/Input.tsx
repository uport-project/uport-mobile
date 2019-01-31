import * as React from 'react'
import { TextInput, ViewStyle } from 'react-native'
import { Theme, TextThemeMap } from '@kancha'

const InputTypes = {
  Text: 'text',
  Radio: 'radio',
  Checkbox: 'checkbox',
}

interface InputProps {
  type?: 'text' | 'radio' | 'checkbox'
  value: string | undefined
  autoFocus?: boolean
  textType?: string
}

interface InputState {
  focused: boolean
}

class Input extends React.Component<InputProps, InputState> {
  state = {
    focused: false,
  }

  toggleFocus() {
    this.setState(state => {
      return {
        focused: !state.focused,
      }
    })
  }

  renderTextInput() {
    const inputStyles: ViewStyle = {
      flex: 1,
      borderWidth: 2,
      padding: Theme.spacing.default,
      borderColor: this.state.focused ? Theme.colors.primary.brand : Theme.colors.primary.accessories,
      borderRadius: Theme.roundedCorners.textInputs,
      ...(this.props.textType ? { ...TextThemeMap[this.props.textType] } : {}),
    }
    return (
      <TextInput
        autoFocus={this.props.autoFocus}
        autoCapitalize={'none'}
        autoCorrect={false}
        value={this.props.value}
        style={inputStyles}
        onBlur={() => this.toggleFocus()}
        onFocus={() => this.toggleFocus()}
      />
    )
  }

  render() {
    return this.renderTextInput()
  }
}

export default Input
