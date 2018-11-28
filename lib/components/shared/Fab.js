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

import React from 'react'

import {
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

const fabSize = 56
const iconSize = 24

const styles = StyleSheet.create({
  fab: {
    backgroundColor: colors.brand,
    borderRadius: fabSize / 2,
    width: fabSize,
    height: fabSize,
    padding: (fabSize - iconSize) / 2,
    elevation: 10,
    bottom: iconSize,
    shadowColor: 'rgb(0,0,0)',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.3,
  }
})

export default (props) => (
  <View style={{flex: 0, alignSelf: 'center'}}>
    <TouchableOpacity style={styles.fab} onPress={props.onPress}>
      <MaterialCommunityIcons name={props.icon} size={24} color={colors.white216} />
    </TouchableOpacity>
  </View>
)
