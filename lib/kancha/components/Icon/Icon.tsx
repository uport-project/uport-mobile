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
import { Platform } from 'react-native'

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
}

/**
 * A definitive list of Icons to be listed here
 */
const Icons: { [index: string]: any } = {
  forward: Platform.OS === 'ios' ? 'ios-arrow-forward' : 'md-arrow-forward',
  link: Platform.OS === 'ios' ? 'ios-link' : 'md-link',
}

const Icon: React.FunctionComponent<IconProps> = ({
  font,
  name,
  size,
  color,
}: IconProps) => {
  const IconFont = font ? IconSets[font] : Ionicons
  return <IconFont name={Icons[name]} size={size} color={color} />
}

Icon.defaultProps = {
  size: 26,
  color: 'black',
  name: 'ionicons',
}

export default Icon
