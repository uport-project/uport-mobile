/***
 *  Copyright (C) 2018 ConsenSys AG
 *
 *  This file is part of uPort Mobile App
 *  uPort Mobile App is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  uPort Mobile App is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  ERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ***/

import * as React from 'react'
import { Animated, Easing, Image, ImageSourcePropType } from 'react-native'
import { Device } from '@kancha'

import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import EvilIcons from 'react-native-vector-icons/EvilIcons'

const IconSets: { [index: string]: any } = {
  ionicons: Ionicons,
  feather: Feather,
  fontawesome: FontAwesome,
  evil: EvilIcons,
}

interface IconProps {
  /** Name of the icon font eg. ionicons, fontawesome */
  font?: string

  /** Name of the icon from the set */
  name: string

  /** The size of the icon */
  size?: number

  /** The color of the icon */
  color?: string

  /** Spinn the icon */
  animated?: boolean

  /** Use image for animating */
  image?: ImageSourcePropType
}

/**
 * A definitive list of Icons to be listed here
 */
interface IconsStatic {
  [index: string]: any
  forward: string
  link: string
  sync: string
  success: string
  checkbox_empty: string
  checkbox_checked: string
  rocket: string
  share: string
  close: string
  edit: string
  more: string
  checkmark: string
  scan: string
  qrcode: string
}

const Icons: IconsStatic = {
  forward: Device.isIOS ? 'ios-arrow-forward' : 'md-arrow-forward',
  link: Device.isIOS ? 'ios-link' : 'md-link',
  sync: Device.isIOS ? 'ios-sync' : 'md-sync',
  success: Device.isIOS ? 'ios-checkmark-circle-outline' : 'md-checkmark-circle-outline',
  checkbox_empty: Device.isIOS ? 'ios-radio-button-off' : 'md-radio-button-off',
  checkbox_checked: Device.isIOS ? 'ios-checkmark-circle' : 'md-checkmark-circle',
  rocket: Device.isIOS ? 'ios-rocket' : 'md-rocket',
  share: Device.isIOS ? 'ios-share' : 'md-share',
  scan: Device.isIOS ? 'ios-qr-scanner' : 'md-qr-scanner',
  close: Device.isIOS ? 'close' : 'close',
  checkmark: Device.isIOS ? 'ios-checkmark' : 'md-checkmark',
  edit: Device.isIOS ? 'edit' : 'edit',
  more: Device.isIOS ? 'ios-more' : 'ios-more',
  qrcode: Device.isIOS ? 'qrcode' : 'qrcode',
}

const IconImageSource = (font: string, icon: string, size: number) => {
  return IconSets[font].getImageSource(icon, size)
}

const Icon: React.FunctionComponent<IconProps> & {
  Names: IconsStatic
  getImageSource: (font: string, icon: string, size: number) => any
} = ({ font, name, size, color, animated, image }: IconProps) => {
  const IconFont = font ? IconSets[font] : Ionicons
  const spinValue = new Animated.Value(0)

  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
    }),
  ).start()

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const StaticIcon = <IconFont name={Icons[name]} size={size} color={color} />
  const AnimatedIcon = (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      {image && <Image source={image} style={{ width: size, height: size }} />}
    </Animated.View>
  )

  return animated ? AnimatedIcon : StaticIcon
}

Icon.defaultProps = {
  size: 26,
  color: 'black',
  name: 'ionicons',
}

Icon.Names = Icons
Icon.getImageSource = IconImageSource

export default Icon
