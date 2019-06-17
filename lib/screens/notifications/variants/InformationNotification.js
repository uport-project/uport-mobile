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
// Frameworks
import React from 'react'
import { Text, View, Image } from 'react-native'
import Notification from '../Notification'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { textStyles, colors } from 'uPortMobile/lib/styles/globalStyles'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const avatarSize = props => {
  const size = 90
  return {
    width: size,
    height: size,
  }
}

const InformationNotification = props => {
  const handleAuthorize = () => {
    props.authorize(props.activity)
  }
  const handleCancel = () => {
    props.cancel(props.activity)
  }
  return (
    <Notification
      title='Notification Received'
      cardPress={props.selectRequest(props.activity)}
      cancelText='Dismiss'
      acceptText='View'
      completed={props.activity.authorizedAt}
      canceled={props.activity.canceledAt}
      cancel={handleCancel}
      accept={handleAuthorize}
      noButtons={false}>
      <View style={{ width: 120, height: 120, flex: 0, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name='backup-restore' size={80} color={Theme.colors.primary.brand} />
      </View>
      <Text style={[textStyles.h2, { margin: 10 }]}>Setup Account Recovery</Text>
    </Notification>
  )
}

export default InformationNotification
