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
  Text,
  View,
  ScrollView,
  StyleSheet
} from 'react-native'
import { colors, font, fontLight, fontBold } from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  name: {
    fontFamily: fontLight,
    textAlign: 'left',
    color: colors.grey155,
    fontSize: 14,
    lineHeight: 23,
    marginLeft: 10,
    flex: 0,
    width: 83 // Using fixed width here to fix the first column size across items
  },
  value: {
    fontFamily: fontBold,
    textAlign: 'right',
    marginRight: 10,
    color: colors.grey130,
    fontSize: 14,
    lineHeight: 23,
    flex: 1
  },
  row: {
    flex: 0,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 10,
    // paddingLeft: 22,
    // paddingRight: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.white226
  },
  list: {
    flex: 0,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: colors.white226
  }
})
const RequestItem = (props) => (
  <View style={styles.row}>
    <Text style={styles.name}>{props.type.toUpperCase().slice(0, 1)}{props.type.toLowerCase().slice(1)}:</Text>
    <Text style={styles.value}>{props.value}</Text>
    { props.verifications && props.verifications.length > 0
    ? (<View>
      { props.verifications.map(a => (
        <Text key={`${props.type}-${a.iss.slice(0, 10)}`} style={{fontFamily: font, fontSize: 10, color: 'rgba(16,18,32,0.3)', letterSpacing: 0.5, lineHeight: 17, marginTop: 3}}>
          Verified by: {a.iss.slice(0, 10)}
        </Text>
        ))
      }
    </View>)
    : null }
  </View>
)

export const RequestItemList = (props) => (
  <ScrollView contentContainerStyle={styles.list} style={{flex: 0}}>
    {props.children}
  </ScrollView>
)

export default RequestItem
