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
import { StyleSheet, View, Text, TouchableOpacity, DeviceInfo } from 'react-native'
import { colors, windowHeight, windowWidth } from 'uPortMobile/lib/styles/globalStyles'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import EvilIcon from 'react-native-vector-icons/Feather'

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderTopWidth: 0,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    //height: windowHeight * 0.11,
    flex: 0,
    //marginTop: DeviceInfo.isIPhoneX_deprecated ? 35 : 5,
    overflow: 'visible',
    paddingRight: windowWidth * 0.01,
    paddingTop: windowHeight * 0.01,
    paddingBottom: windowHeight * 0.01,
    paddingLeft: windowWidth * 0.033,
    shadowColor: 'rgb(33, 21, 100)',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    width: windowWidth * 0.93,
    zIndex: 10
  },
  balancesView: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: windowHeight * 0.018
  }
})

const AccountTileSmall = (props) => {
  return (
    <View elevation={10} style={styles.container}>
      <Avatar size={windowWidth * 0.13} borderColor={colors.white246} source={props.accountProfile || {avatar: require('uPortMobile/images/eth-symbol2.png')}} initialsStyle={{fontSize: 36}} />
      <View style={styles.balancesView}>
        <Text style={{fontSize: windowWidth * 0.05}}> {props.balance ? props.balance : 0} ETH </Text>
        <Text> {props.usdBalance ? '$' + props.usdBalance.toFixed(2) : '$0'} </Text>
      </View>
    </View>
  )
}

AccountTileSmall.propTypes = {
  accountProfile: PropTypes.object,
  network: PropTypes.string
}

export default AccountTileSmall
