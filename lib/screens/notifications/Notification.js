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
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'

import { colors, font } from 'uPortMobile/lib/styles/globalStyles'
const styles = StyleSheet.create({
  cardContainer: {
    flex: 0,
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  notificationContainer: {
    alignSelf: 'stretch',
    flex: 0,
    backgroundColor: colors.white,
    elevation: 2,
    borderRadius: Platform.OS === 'android' ? 0 : 8,
    shadowColor: 'rgba(0,0,0,0.07)',
    shadowOffset: {width: 0, height: -1},
    shadowRadius: 12,
    marginBottom: 26,
    margin: 4
  },
  cardTitle: {
    fontFamily: font,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: colors.grey74,
    padding: 19,
    paddingTop: 0
  },
  cardHeader: {
    marginTop: 19,
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    alignItems: 'stretch',
    borderBottomColor: colors.white226,
    marginBottom: 19
  }
})

const Notification = ({
  title,
  children,
  type,
  completed,
  noButtons,
  canceled,
  acceptText,
  cancelText,
  cancel,
  accept,
  cardPress
}) => (
  <TouchableOpacity
    onPress={cardPress}
    style={styles.notificationContainer}>
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {title}
        </Text>
      </View>
      {children }
      { !(noButtons || completed || canceled)
      ? <AcceptCancelGroup
        acceptText={acceptText}
        cancelText={cancelText}
        onAccept={accept}
        onCancel={cancel}
     />
      : null }
    </View>
  </TouchableOpacity>
)

export default Notification
