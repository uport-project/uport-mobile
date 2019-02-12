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

const IconSets: { [index: string]: any } = {
  ionicons: Ionicons,
  feather: Feather,
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

const Icons: { [index: string]: any } = {
  forward: Device.isIOS ? 'ios-arrow-forward' : 'md-arrow-forward',
  link: Device.isIOS ? 'ios-link' : 'md-link',
  sync: Device.isIOS ? 'ios-sync' : 'md-sync',
  success: Device.isIOS ? 'ios-checkmark-circle-outline' : 'md-checkmark-circle-outline',
  checkbox_empty: Device.isIOS ? 'ios-radio-button-off' : 'md-radio-button-off',
  checkbox_checked: Device.isIOS ? 'ios-checkmark-circle' : 'md-checkmark-circle',
  tickmark: Device.isIOS ? 'ios-checkmark-circle-outline' : 'md-checkmark-circle-outline',
}

const Icon: React.FunctionComponent<IconProps> = ({ font, name, size, color, animated, image }: IconProps) => {
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

export default Icon
