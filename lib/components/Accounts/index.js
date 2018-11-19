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
// Libraries
import React from 'react'
import { toJs } from 'mori'
import { Text, TouchableOpacity, View, FlatList } from 'react-native'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
// Selectors
// import { notifications } from 'uPortMobile/lib/selectors/activities'
import { myAccounts } from 'uPortMobile/lib/selectors/identities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import Icon from 'react-native-vector-icons/Ionicons'
// Styles
import globalStyles, { colors, font } from 'uPortMobile/lib/styles/globalStyles'
import { backIconGetter } from 'uPortMobile/lib/utilities/navButtonGetters'

export const AccountItem = ({item, accountProfile, networkName, navigator}) => (
  <TouchableOpacity
    style={[globalStyles.menuItem]}
    key={item.address}
    onPress={debounce(() => navigator.push({
      screen: 'uport.accountInfo',
      title: (accountProfile ? accountProfile.name : 'Ethereum'),
      subTitle: networkName,
      passProps: {
        address: item.address,
        network: networkName,
        accountProfile: accountProfile
        // activities: item.activities,
        // attestations: allIdentitiesObj[address].attestations,
        // balance: item.balance,
        // controllerAddress: allIdentitiesObj[address].controllerAddress,
        // deviceAddress: allIdentitiesObj[address].deviceAddress,
        // fuel: allIdentitiesObj[address].fuel,
        // fuelToken: allIdentitiesObj[address].fuelToken,
        // hexAddress: allIdentitiesObj[address].hexAddress,
        // identityFactoryAddress: allIdentitiesObj[address].identityFactoryAddress,
        // ipfsProfile: allIdentitiesObj[address].ipfsProfile,
        // nonce: allIdentitiesObj[address].nonce,
        // own: item.own,
        // publicKey: item.publicKey,
        // recoveryAddress: allIdentitiesObj[address].recoveryAddress,
        // stats: item.stats
      }
    }), 1000, {leading: true, trailing: false})}>
    <Avatar size={50} borderColor={colors.white246} source={accountProfile || {avatar: require('uPortMobile/assets/images/eth-symbol2.png')}} />
    <Text style={[globalStyles.menuItemText, {flex: 1, marginLeft: 19}]}>
      {accountProfile ? accountProfile.name : 'Ethereum (' + networkName + ')'}
    </Text>
    <Icon name={'ios-arrow-forward-outline'} color={colors.grey216} size={20} />
  </TouchableOpacity>
)
export const keyExtractor = (item, index) => (
  item.address
)
export class Accounts extends React.Component {
  constructor (props) {
    super()
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    props.navigator.setStyle({
      navBarNoBorder: true,
      navBarTextColor: colors.grey74,
      navBarButtonColor: colors.purple,
      navBarFontSize: 18,
      navBarFontFamily: font
    })
  }
  componentDidMount () {
    backIconGetter(this.props.navigator)
  }
  onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'back') { // this is the same id field from the static navigatorButtons definition
        this.props.navigator.pop({
        })
      }
    }
  }

  renderItem ({item}) {
    const networkName = item.network.charAt(0).toUpperCase() + item.network.slice(1).toLowerCase()
    return (
      <AccountItem item={item} accountProfile={item.clientId ? this.props.accountProfileLookup(item.clientId) : null} networkName={networkName} navigator={this.props.navigator} />
    )
  }

  render () {
    return (
      <View style={{backgroundColor: colors.white246, flex: 1}}>
        <FlatList
          style={{backgroundColor: '#ffffff', flex: 1}}
          data={this.props.accounts}
          renderItem={this.renderItem.bind(this)}
          keyExtractor={keyExtractor}
        />
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    accounts: myAccounts(state),
    accountProfileLookup: (clientId) => toJs(externalProfile(state, clientId))
  }
}

export default connect(mapStateToProps)(Accounts)
