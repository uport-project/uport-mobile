import * as React from 'react'
import { TouchableNativeFeedback, TouchableHighlight, ButtonProperties, ViewStyle } from 'react-native'
import { Device } from '@kancha'

const ButtonTypes = {
  Primary: 'primary',
  Secondary: 'secondary',
  Tertiary: 'tertiary',
  Accent: 'accent',
}

const ButtonBlocks = {
  Outlined: 'outlined',
  Filled: 'filled',
  Clear: 'clear',
}

interface ButtonProps extends ButtonProperties {
  /** 
   * The button type. This sets the theme color
   */
  type: 'primary' | 'secondary' | 'tertiary' | 'accent' | undefined;
  /** 
   * The block appearance of the button
   */
  block: 'outlined' | 'filled' | 'clear' | undefined;
  /** 
   * The button type. This sets the theme color
   */
  onPress: () => void;

}

const Button: React.FC<ButtonProps> & { Types?: {[index: string]: string | undefined}, Block?: {[index: string]: string | undefined} } = (props) => {

  const style: ViewStyle = {

  }
  return Device.isIOS
    ? <TouchableHighlight style={style}>{props.children}</TouchableHighlight>
    : <TouchableNativeFeedback style={style}>{props.children}</TouchableNativeFeedback>
}

Button.Types = ButtonTypes;
Button.Block = ButtonBlocks;

export default Button

