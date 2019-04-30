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
import PropTypes from 'prop-types'
import { StyleSheet, View, Text, TouchableHighlight, Platform } from 'react-native'
import { colors, font, windowHeight, windowWidth } from 'uPortMobile/lib/styles/globalStyles'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { Navigation } from 'react-native-navigation'

const styles = StyleSheet.create({
  container: {
    flex: 0,
    height: windowHeight,
    paddingTop: Platform.OS === 'ios' ? 26 : 0,
    width: windowWidth,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    alignItems: 'stretch',
    backgroundColor: colors.white,
  },
  titleBar: {
    margin: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  title: {
    fontFamily: font,
    color: colors.grey74,
    fontSize: 16,
    marginLeft: 16,
  },
})

const ClosableView = props => {
  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <TouchableHighlight
          onPress={() => {
            Navigation.dismissModal(props.componentId)
            props.onClose && props.onClose()
          }}
        >
          <EvilIcon size={24} name='close' color='rgba(155,155,155,1)' />
        </TouchableHighlight>
        {props.title ? <Text style={styles.title}>{props.title}</Text> : null}
      </View>
      <View style={{ flex: 1 }}>{props.children}</View>
    </View>
  )
}

ClosableView.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func,
}

export default ClosableView
