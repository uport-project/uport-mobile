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
import PropTypes from 'prop-types'
import { View, Text, Platform, StyleSheet, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import * as Animatable from 'react-native-animatable'

// Styles
import { colors, font, fontBold } from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  CardStateBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#CCCCCC',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    // marginTop: 20,
    alignSelf: 'stretch',
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10
  },
  CardStateBoxIconBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        flexBasis: 40
      },
      android: {
        flexBasis: 100
      }
    })
  },
  CardStateBoxTextBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10
  }
})
const CardStateBox = (props) => (
  <View style={[styles.CardStateBox, props.style, {backgroundColor: props.state !== 'error' ? (props.state === 'pending' ? colors.grey155 : colors.green) : colors.uportRed }]}>
    <View style={styles.CardStateBoxTextBox}>
      {
        props.state === 'success'
          ? (
            <Text style={{
              color: colors.white,
              fontSize: 18,
              fontFamily: fontBold,
              letterSpacing: 1,
              lineHeight: 24}}>
              Transaction Successful
            </Text>
          )
          : null
      }
      {
        props.state === 'pending'
          ? (
              <Text style={{
                color: colors.white,
                fontSize: 18,
                fontFamily: fontBold,
                letterSpacing: 1,
                lineHeight: 24,
                paddingRight: 5}}>
                Transaction Pending
              </Text>
          )
          : null
      }
      {
        props.state === 'error'
          ? (
            <View style={{ flexDirection: 'row' }}>
              <Text style={{
                color: colors.uportRed,
                fontSize: 18,
                fontFamily: fontBold,
                letterSpacing: 1,
                lineHeight: 24,
                paddingRight: 5}}>
                Error:
              </Text>
              <Text style={{
                color: colors.darkGrey,
                fontSize: 12,
                fontFamily: fontBold,
                letterSpacing: 1,
                lineHeight: 15}}
                ellipsizeMode='tail'>
                { props.text }
              </Text>
            </View>
          )
          : null
      }
    </View>

    <View style={styles.CardStateBoxIconBox}>
      {
        props.state === 'success'
          ? (
            <Icon
              name='ios-checkmark-circle'
              color={colors.white}
              style={{
                fontSize: 20,
                marginTop: 2
              }} />
          )
          : null
      }
      {
        props.state === 'error'
          ? (
            <Icon
              name='ios-alert'
              color={colors.uportRed}
              style={{
                backgroundColor: 'transparent',
                fontSize: 30,
                marginTop: 2,
                padding: 10
              }} />
          )
          : null
      }
      {
        props.state === 'pending'
          ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          )
          : null
      }
    </View>
  </View>
)

CardStateBox.propTypes = {
  state: PropTypes.string,
  text: PropTypes.string
}

export default CardStateBox
