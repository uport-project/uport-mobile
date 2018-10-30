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
import { connect } from 'react-redux'

import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'

import {rootNavigator} from '../Home'
import {colors, font, fontLight} from 'uPortMobile/lib/styles/globalStyles'
import {notificationCount} from 'uPortMobile/lib/selectors/activities'
import Icon from 'react-native-vector-icons/Ionicons'

const styles = StyleSheet.create({
  button: {
    flex: 0,
    height: 44,
    width: 64,
    paddingRight: Platform.OS === 'ios' ? 0 : 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  notificationContainer: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.purple,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 10,
    paddingLeft: 10,
  },
  notificationContainerText: {
    color: colors.white,
    fontFamily: fontLight,
    fontSize: 13,
  }
})
export const Notifications = (props) => {
  if (props.unread) {
    return (     
      <TouchableOpacity
        style={styles.button}
        onPress={() => rootNavigator.showModal({
          screen: 'uport.notifications',
          title: 'Notifications'
        })}>
        <View style={styles.notificationContainer}>
        <Icon name="ios-notifications-outline" size={16} color="#fff" style={{marginRight: 5}}/>
        <Text style={styles.notificationContainerText}>
            {props.unread}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
  return null
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    unread: notificationCount(state)
  }
}

export default connect(mapStateToProps)(Notifications)
