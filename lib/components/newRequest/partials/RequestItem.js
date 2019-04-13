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
  StyleSheet,
  TouchableHighlight
} from 'react-native'
import { colors, font, fontLight, fontBold } from 'uPortMobile/lib/styles/globalStyles'
import { Linking } from 'react-native'
const styles = StyleSheet.create({
  name: {
    fontFamily: fontLight,
    textAlign: 'left',
    color: colors.grey155,
    fontSize: 14,
    lineHeight: 23,
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

function issuer ({issuer: {name, url}, iss}) {
  if (name && url) {
    return `${name}\n${url}`
  }
  return name || url || iss.slice(0, 16)
}
const RequestItem = (props) => (
  <View style={[styles.row, props.spec ? {backgroundColor: 'rgba(255,240,240,1)'} : {}]}>
    <Text style={[styles.name, props.spec && props.spec.essential ? {color: 'red'} : {} ]}>{props.type.toUpperCase().slice(0, 1)}{props.type.toLowerCase().slice(1)}{props.spec && props.spec.essential ? ' *' : null }:</Text>
    <View style={{flex: 1, flexDirection: 'column'}}>
      {props.value && typeof props.value !== 'object' ? <Text style={styles.value}>{ props.value }</Text> : null }
      { props.vc
      ? <Text key={`${props.type}-${props.vc.iss.slice(0, 20)}`}
        style={{fontFamily: font, fontSize: 10, color: 'rgba(16,18,32,1)', letterSpacing: 0.5, lineHeight: 17, marginTop: 3, textAlign: 'right'}}>
        Verified by:
        {issuer(props.vc)}
      </Text>
    : (props.spec
    ? <View
      style={{marginTop: 3, flexDirection: 'column'}}>
      <Text
      style={{fontFamily: font, fontSize: 10, color: 'rgba(32,18,16,1)', letterSpacing: 0.5, lineHeight: 17, textAlign: 'right'}}>{props.spec.reason || 'Missing'}</Text>
      {props.spec.url
      ? <View style={{flex: 0, padding: 4, backgroundColor: colors.brand}}><TouchableHighlight onPress={() => Linking.openURL(props.spec.url)} ><Text style={{textAlign: 'center', color: 'white'}}>Apply for Credential...</Text></TouchableHighlight></View>
      : null }
    </View>
    : null) }
    </View>

  </View>
)

export const RequestItemList = (props) => (
  <ScrollView contentContainerStyle={styles.list} style={{flex: 0, backgroundColor: colors.white, borderRadius: 8}}>
    {props.children}
  </ScrollView>
)

export default RequestItem
