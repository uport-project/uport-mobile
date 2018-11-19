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
import { Text, View, TouchableOpacity, Share } from 'react-native'
import AvatarNameHeader from '../shared/AvatarNameHeader'
import { internationalFormat } from 'uPortMobile/lib/utilities/phoneNumber'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Icon from 'react-native-vector-icons/Ionicons'
import { abbrAddress } from 'uPortMobile/lib/utilities/string'

import globalStyles, { colors } from 'uPortMobile/lib/styles/globalStyles'

const Viewer = (props) => {
  const url = `https://id.uport.me/req/${props.shareToken}`

  return (
  <View style={{flex: 1, backgroundColor: colors.white}}>
    <AvatarNameHeader avatar={props.avatar} name={props.name} />
    { props.shareToken
    ? <View style={{flexDirection: 'row', marginLeft: 15}}>
      <TouchableOpacity 
        style={{width: 44, height: 44}}
        onPress={() => {
          props.navigator.showModal({
            screen: 'uport.QRCodeModal',
            passProps: {
              title: props.name,
              url,
              onClose: props.navigator.dismissModal
            },
            navigatorStyle: {
              navBarHidden: true
            }
          })
        }}>
        <MaterialCommunityIcons name={'qrcode'} size={32} color={colors.purple} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{width: 44, height: 44}}
        onPress={() => Share.share({
          url,
          message: `${props.name}\n\n${url}`,
          title: `Share contact`
        }, {
          dialogTitle: `Share contact`
        })}
        >
        <Icon name={'ios-share-outline'} size={32} color={colors.purple} />
      </TouchableOpacity>
    </View>
    : null }
    <View style={globalStyles.infoList}>
      { props.userData && props.userData.email
      ? <View style={globalStyles.infoListItem}>
        <Text style={globalStyles.infoType}>Email</Text>
        <Text style={globalStyles.infoValue}>{props.email}</Text>
      </View>
      : null }
      { props.userData && props.userData.country
      ? <View style={globalStyles.infoListItem}>
        <Text style={globalStyles.infoType}>Location</Text>
        <Text style={globalStyles.infoValue}>{props.country}</Text>
      </View>
      : null }
      { props.userData && props.userData.phone
      ? <View style={globalStyles.infoListItem}>
        <Text style={globalStyles.infoType}>Phone</Text>
        <Text style={globalStyles.infoValue}>{internationalFormat(props.phone, props.country)}</Text>
      </View>
      : null }
    </View>
  </View>
)}

export default Viewer
