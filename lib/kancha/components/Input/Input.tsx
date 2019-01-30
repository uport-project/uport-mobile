import * as React from 'react'
import { TextInput, ViewStyle } from 'react-native'
import { Theme } from '@kancha'

const InputTypes = {
  Text: 'text',
  Radio: 'radio',
  Checkbox: 'checkbox',
}

interface InputProps {
  type?: 'text' | 'radio' | 'checkbox'
  value: string | undefined
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
      borderWidth: 1,
      padding: Theme.spacing.default,
      borderColor: this.state.focused ? Theme.colors.primary.brand : Theme.colors.primary.accessories,
    }
    return (
      <TextInput
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
