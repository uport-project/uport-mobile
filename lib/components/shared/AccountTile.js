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
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import metrics from 'uPortMobile/lib/styles/metrics'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import EvilIcon from 'react-native-vector-icons/Feather'

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: 'white',
    borderRadius: 16,
    borderTopWidth: 0,
    elevation: 10,
    flexDirection: 'column',
    marginTop: DeviceInfo.isIPhoneX_deprecated ? 35 : 5,
    overflow: 'visible',
    paddingRight: metrics.spacing.horizontal.large,
    paddingTop: metrics.spacing.vertical.large,
    paddingBottom: metrics.spacing.vertical.large,
    paddingLeft: metrics.spacing.horizontal.large,
    shadowColor: 'rgb(33, 21, 100)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    zIndex: 10
  },
  addFundsButton: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: 4,
    shadowColor: 'rgb(23, 3, 64)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12
  },
  addFundsButtonInactive: {
    backgroundColor: 'rgba(216,216,216,0.2)',
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.grey170,
    borderRadius: 4,
    shadowColor: 'rgb(23, 3, 64)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12
  },
  tileTopHalf: {
    flexDirection: 'row',
    // height: windowHeight * 0.10
  },
  tileBottomHalf: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: metrics.spacing.vertical.large
  },
  balancesView: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: metrics.spacing.vertical.medium
  }
})

const AccountTile = (props) => {
  return (
    <View elevation={10} style={styles.container}>
      <View style={styles.tileTopHalf}>
        <Avatar borderColor={colors.white246} source={props.accountProfile || {avatar: require('uPortMobile/images/eth-symbol2.png')}} initialsStyle={{fontSize: 36}} />
        <View style={styles.balancesView}>
          <Text style={{fontSize: metrics.font.size.large}}> {props.balance ? props.balance : 0} ETH </Text>
          <Text> {props.usdBalance ? '$' + props.usdBalance.toFixed(2) : '$0'} </Text>
        </View>
      </View>

      <View style={styles.tileBottomHalf}>
        <View>
          <Text style={{fontSize: metrics.font.size.regular}}>Ethereum Account</Text>
          <Text style={{fontSize: metrics.font.size.regular, color: colors.brand}}>{props.network ? props.network : null} </Text>
        </View>
        { props.buttonIcon === 'plus-square'
        ? <TouchableOpacity style={styles.addFundsButton} onPress={() => props.tileButton()}>
          <EvilIcon name={props.buttonIcon} size={metrics.font.size.regular} color='rgba(0,0,0,0.7)' />
          <Text style={{fontSize: metrics.font.size.regular, marginLeft: 8}}> ADD FUNDS </Text>
        </TouchableOpacity>
        : <View style={styles.addFundsButtonInactive}>
          <EvilIcon name={props.buttonIcon} size={metrics.font.size.regular} color={colors.grey170} />
          <Text style={{fontSize: metrics.font.size.regular, marginLeft: 8, color: colors.grey170}}> ADD FUNDS </Text>
        </View>
        }
      </View>

    </View>
  )
}

AccountTile.propTypes = {
  accountProfile: PropTypes.object,
  network: PropTypes.string
}

export default AccountTile
