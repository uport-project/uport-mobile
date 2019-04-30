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
import { StyleSheet, Platform } from 'react-native'

export default {
  buttonHeight: 54,
  navBar: {
    button: 44,
    menuIcon: 40,
    notificationsIcon: 16,
  },
  tabBar: {
    button: 32,
  },
  checkBoxHeight: 30,
  borderWidth: {
    medium: 2,
    small: StyleSheet.hairlineWidth,
  },
  borderRadius: {
    medium: 8,
    small: 4,
  },

  spacing: {
    horizontal: {
      extraLarge: 40,
      large: 30,
      medium: 15,
      small: 5
    },
    vertical: {
      extraLarge: 40,
      large: 25,
      medium: 15,
      small: 5
    }
  },
  
  font: {
    monospace: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    size: {
      extraLarge: 38,
      large: 24,
      medium: 16,
      regular: 14,
      small: 12,
    },
    lineHeight: {
      extraLarge: 40,
      large: 30,
      medium: 27,
      regular: 22,
      small: 19,
    },
    name: {}
  }
  



}