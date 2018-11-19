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
import { ActivityIndicator, Text, TouchableHighlight, View, Linking, Platform, StyleSheet } from 'react-native'
import globalStyles, { colors } from 'uPortMobile/lib/styles/globalStyles'
import Icon from 'react-native-vector-icons/Ionicons'

const ForwardArrow = () => <Icon name={Platform.OS === 'ios' ? 'ios-arrow-forward-outline' : 'md-arrow-forward'} color={colors.grey216} style={{marginLeft: 16}} size={20} />
const ExternalLink = () => <Icon name={Platform.OS === 'ios' ? 'ios-link-outline' : 'md-link'} color={colors.grey216} style={{marginLeft: 16}} size={20} />

function actionLink (props) {
  if (props.onPress) return props.onPress
  if (props.navigator && props.destination) return () => props.navigator.push({screen: props.destination, title: props.linkTitle || props.title})
  if (props.href) return () => Linking.openURL(props.href)
}
const MenuItem = (props) => {
  const navigate = props.navigator && props.destination
  const onPress = actionLink(props)
  if (onPress && !props.working) {
    return (<TouchableHighlight onPress={onPress}>
      <View style={[globalStyles.menuItem, props.topBorder && {borderTopWidth: StyleSheet.hairlineWidth}]}>
        <Text style={globalStyles.menuItemText}>{props.title}</Text>
        <View style={{flexDirection: 'row'}}>
          {props.working ? <View style={{width: 18, height: 18, marginRight: 9}}><ActivityIndicator /></View> : null}
          <Text style={[globalStyles.menuItemTextRight, props.danger ? globalStyles.danger : {}]}>{props.value}</Text>
          { navigate
          ? <ForwardArrow />
          : null }
          { props.href
          ? <ExternalLink />
          : null }
        </View>
      </View>
    </TouchableHighlight>)
  }
  return (
    <View style={[globalStyles.menuItem, props.last ? globalStyles.menuGroup : {}]}>
      <Text style={[globalStyles.menuItemText]}>{props.title}</Text>
      { props.value
      ? <Text style={[globalStyles.menuItemTextRight, props.danger ? globalStyles.danger : {}]}>{props.value}</Text>
      : null }
    </View>
  )
}

export default MenuItem
