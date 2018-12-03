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
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import metrics from 'uPortMobile/lib/styles/metrics'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import Ionicon from 'react-native-vector-icons/Ionicons'

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 3,
    borderTopWidth: 0,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 8,
    flex: 0,
    overflow: 'visible',
    paddingRight: metrics.spacing.horizontal.small,
    paddingLeft: metrics.spacing.horizontal.small,
    shadowColor: 'rgb(33, 21, 100)',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    zIndex: 10
  },
  balancesView: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: metrics.spacing.vertical.small
  }
})

const AccountTileSmall = (props) => {
  return (
    <View elevation={10} style={styles.container}>
      <Avatar borderColor={colors.white246} source={props.accountProfile || {avatar: require('uPortMobile/assets/images/eth-symbol2.png')}} initialsStyle={{fontSize: 36}} />
      <View style={styles.balancesView}>
        <Text style={{fontSize: metrics.font.size.regular}}> {props.balance ? props.balance : 0} ETH </Text>
        <Text> {props.usdBalance ? '$' + props.usdBalance.toFixed(2) : '$0'} </Text>
      </View>
      { props.onRefresh
      ? <TouchableOpacity style={{flex: 0, marginLeft: 8, marginLeft: 8}} onPress={props.onRefresh}>
        <Ionicon name={'ios-refresh-outline'} size={24} />
      </TouchableOpacity>
      : null }
    </View>
  )
}

AccountTileSmall.propTypes = {
  accountProfile: PropTypes.object,
  network: PropTypes.string,
  onRefresh: PropTypes.func
}

export default AccountTileSmall
