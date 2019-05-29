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
import { Platform } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

export const backIconGetter = (navigator, buttons) => {
  Icon.getImageSource(Platform.OS === 'ios' ? 'ios-arrow-back-outline' : 'md-back', 32, colors.purple).then(back => {
    navigator.setButtons(
      buttons || {
        leftButtons: [
          {
            id: 'back',
            icon: back,
          },
        ],
      },
    )
  })
}

export const closeIconGetter = (navigator, buttons) => {
  Icon.getImageSource(Platform.OS === 'ios' ? 'ios-close' : 'md-close', 32, colors.purple).then(icon => {
    navigator.setButtons(
      buttons || {
        leftButtons: [
          {
            id: 'close',
            icon,
          },
        ],
      },
    )
  })
}

export const shareIconGetter = (navigator, buttons) => {
  Icon.getImageSource(Platform.OS === 'ios' ? 'ios-share' : 'md-share', 32, colors.purple).then(icon => {
    navigator.setButtons(
      buttons || {
        rightButtons: [
          {
            id: 'share',
            icon,
          },
        ],
      },
    )
  })
}
