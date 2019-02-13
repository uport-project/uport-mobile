import * as React from 'react'
import { TextInput, ViewStyle } from 'react-native'
import { Theme, TextThemeMap, Container, Icon } from '@kancha'

const InputTypes = {
  Text: 'text',
  Radio: 'radio',
  Checkbox: 'checkbox',
}

interface InputProps {
  type?: 'text' | 'radio' | 'checkbox'
  value?: string | undefined
  autoFocus?: boolean
  textType?: string
  placeholder?: string
  onChangeText?: (text: string) => void
  valid?: boolean
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
        ...this.state,
        focused: !state.focused,
      }
    })
  }

  renderTextInput() {
    const focusedColor = this.props.valid ? Theme.colors.primary.brand : Theme.colors.warning.accessories
    const borderColor = this.state.focused ? focusedColor : Theme.colors.primary.accessories
    const inputStyles: ViewStyle = {
      flex: 1,
      padding: Theme.spacing.default,
      borderRadius: Theme.roundedCorners.textInputs,
      ...(this.props.textType ? { ...TextThemeMap[this.props.textType] } : {}),
    }

    return (
      <Container
        flexDirection={'row'}
        alignItems={'center'}
        flex={1}
        br={Theme.roundedCorners.textInputs}
        borderColor={focusedColor}
        borderWidth={2}
        paddingRight={5}
      >
        <TextInput
          placeholder={this.props.placeholder}
          autoFocus={this.props.autoFocus}
          autoCapitalize={'none'}
          autoCorrect={false}
          defaultValue={this.props.value}
          style={inputStyles}
          onChangeText={this.props.onChangeText}
          onBlur={() => this.toggleFocus()}
          onFocus={() => this.toggleFocus()}
        />
        {this.props.valid && <Icon name={'success'} color={Theme.colors.confirm.accessories} size={32} />}
      </Container>
    )
  }

  render() {
    return this.renderTextInput()
  }
}

export default Input
