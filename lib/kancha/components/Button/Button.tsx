import * as React from 'react'
import { TouchableNativeFeedback, TouchableHighlight, ButtonProperties, ViewStyle } from 'react-native'
import { Device, Text } from '@kancha'
import { Theme } from '../../themes/default'
import { Centered } from 'uPortMobile/lib/components/shared/Button'

/**
 *  Implemenation details: Will move static types to theor own file or namespace later
 */

const ButtonBlocks: Kancha.BlocksStatic = {
  Outlined: 'outlined',
  Filled: 'filled',
  Clear: 'clear',
}

const ButtonBrandOptions: Kancha.BrandTypeStatic = {
  Primary: 'primary',
  Secondary: 'secondary',
  Tertiary: 'tertiary',
  Accent: 'accent',
  Warning: 'warning',
  Confirm: 'confirm',
  Custom: 'custom',
}

interface ButtonProps {
  /**
   * The button type. This sets the theme color
   */
  type?: Kancha.BrandPropOptions
  /**
   * The block appearance of the button
   */
  block?: Kancha.BlockPropsOptions
  /**
   * The text to be displayed
   */
  buttonText?: string

  /**
   * Remove width limitations
   */
  fullWidth?: boolean
  /**
   * The button type. This sets the theme color
   */
  onPress: () => void

  /**
   * Center the button horizontally on screen
   */
  centered?: boolean
}

const Button: React.FC<ButtonProps> & {
  Types: Kancha.BrandTypeStatic
  Block: Kancha.BlocksStatic
} = ({ type, block, fullWidth, onPress, buttonText, centered, children }) => {
  const style: ViewStyle = {
    ...(block && block === 'filled'
      ? { backgroundColor: type ? Theme.colors[type].button : Theme.colors.primary.button }
      : {}),
    ...(block && block === 'outlined'
      ? {
          backgroundColor: Theme.colors.primary.background,
          borderWidth: 2,
          borderColor: type ? Theme.colors[type].button : Theme.colors.primary.button,
        }
      : {}),
    padding: Theme.spacing.default,
    alignItems: 'center',
    ...(fullWidth ? {} : { maxWidth: 300 }),
    borderRadius: Theme.roundedCorners.buttons,
    flex: 1,
    ...(centered ? { alignSelf: 'center' } : {}),
  }
  return Device.isIOS ? (
    <TouchableHighlight style={style}>
      <Text type={Text.Types.Body} buttonTextColor={type} block={block}>
        {buttonText}
      </Text>
    </TouchableHighlight>
  ) : (
    <TouchableNativeFeedback style={style}>{children}</TouchableNativeFeedback>
  )
}

Button.Types = ButtonBrandOptions
Button.Block = ButtonBlocks

export default Button
