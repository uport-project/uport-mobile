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
import { StyleSheet, Text, View } from 'react-native'
import Avatar from './Avatar'
import { colors, textStyles } from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  nameStyle: {
    flex: 1,
    marginLeft: 24,
    textAlign: 'left',
    paddingLeft: 2
  }
})

const AvatarNameHeader = (props) => {
  return (
    <View style={{
      alignItems: 'center',
      flexDirection: 'row',
      padding: 15
    }}>
      <Avatar size={96} source={props.avatar}
        />
      <Text style={[textStyles.h1, styles.nameStyle]}>{props.name}</Text>
    </View>
  )
}

export default AvatarNameHeader
