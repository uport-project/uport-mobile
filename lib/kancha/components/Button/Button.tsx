import * as React from 'react'
import { TouchableHighlight, TouchableOpacity, ViewStyle } from 'react-native'
import { Text, Theme, Container } from '@kancha'

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
   * The text to be displayed
   */
  bold?: boolean

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

  /**
   * Disbable the button
   */
  disabled?: boolean

  /**
   * The button is a navigation button
   */
  navButton?: boolean

  icon?: React.ReactNode

  noPadding?: boolean

  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through' | undefined
}

const Button: React.FC<ButtonProps> & {
  Types: Kancha.BrandTypeStatic
  Block: Kancha.BlocksStatic
} = ({
  type,
  block,
  fullWidth,
  onPress,
  disabled,
  buttonText,
  centered,
  bold,
  navButton,
  icon,
  noPadding,
  textDecorationLine,
  children,
}) => {
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
    ...(noPadding ? {} : { padding: Theme.spacing.default }),
    alignItems: 'center',
    ...(fullWidth ? {} : { maxWidth: 300 }),
    borderRadius: Theme.roundedCorners.buttons,
    ...(centered ? { alignSelf: 'center' } : {}),
    ...(disabled ? { opacity: 0.8 } : {}),
  }

  return navButton ? (
    <TouchableOpacity style={style} onPress={onPress} disabled={disabled}>
      <Text
        textDecorationLine={textDecorationLine}
        type={Text.Types.NavButton}
        buttonTextColor={disabled ? 'secondary' : type}
        block={block}
      >
        {buttonText}
      </Text>
    </TouchableOpacity>
  ) : (
    <TouchableHighlight
      disabled={disabled}
      onPress={onPress}
      style={style}
      underlayColor={block === ButtonBlocks.Clear ? 'transparent' : type && Theme.colors[type].underlay}
    >
      <Container flexDirection={'row'}>
        {icon && icon}
        <Text
          textDecorationLine={textDecorationLine}
          type={Text.Types.Button}
          buttonTextColor={disabled ? 'secondary' : type}
          block={block}
          bold={bold}
        >
          {buttonText}
        </Text>
      </Container>
    </TouchableHighlight>
  )
}

Button.Types = ButtonBrandOptions
Button.Block = ButtonBlocks

export default Button
