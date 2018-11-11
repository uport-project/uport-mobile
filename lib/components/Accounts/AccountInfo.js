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
import { ScrollView, RefreshControl, Clipboard, Share, Platform} from 'react-native'
import { debounce } from 'lodash' 
import { wei2eth } from 'uPortMobile/lib/helpers/conversions'
import globalStyles, { colors } from 'uPortMobile/lib/styles/globalStyles'

import AccountTile from 'uPortMobile/lib/components/shared/AccountTile'

import { networksByName } from 'uPortMobile/lib/utilities/networks'
import { backIconGetter, shareIconGetter } from 'uPortMobile/lib/utilities/navButtonGetters'

import { networkSettingsForAddress } from 'uPortMobile/lib/selectors/chains'
import { working } from 'uPortMobile/lib/selectors/processStatus'

// actions
import { refreshBalance } from 'uPortMobile/lib/actions/uportActions'

export class AccountInfo extends React.Component {
  constructor (props) {
    super()
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    this.copyHandler = this.copyHandler.bind(this)
    this.showLightBox = this.showLightBox.bind(this)
  }
  componentDidMount () {
    backIconGetter(this.props.navigator)
    shareIconGetter(this.props.navigator)
  }
  onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'back') { // this is the same id field from the static navigatorButtons definition
        debounce(() => this.props.navigator.pop({
        }), 1000, {leading: true, trailing: false})()
      }
      if (event.id === 'share') {
        const message = this.props.network === 'Mainnet'
          ? `My Ethereum address is ${this.props.hexaddress}`
          : `My address on the ${this.props.network} network is ${this.props.hexaddress}. WARNING!!! Do not send real ETH here or you will loose it!!!`
        Share.share({
          message,
          url: `ethereum:${this.props.hexaddress}`,
          title: `Share ${this.props.network} address`
        }, {
          // Android only:
          dialogTitle: `Share ${this.props.network} address`
        })
      }
    }
  }

  refreshBalance () {
    this.props.refreshBalance(this.props.address)
  }

  copyHandler () {
    Clipboard.setString(this.props.hexaddress)
    this.props.navigator.dismissModal()
  }

  showLightBox () {
    this.props.navigator.showModal({
      screen: 'uport.accountFunding',
      passProps: {
        address: this.props.address,
        accountProfile: this.props.accountProfile
      },
      style: {
        backgroundBlur: 'light', // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
        backgroundColor: Platform.OS === 'ios' ? 'none' : 'white'
      }
    })
  }

  render () {
    return (
      <ScrollView
        contentContainerStyle={[globalStyles.menu, {backgroundColor: colors.white, padding: 30}]}
        style={[globalStyles.menuGroup, {flex: 1}]}
        // contentContainerStyle={{backgroundColor: colors.white, flex: 2, alignItems: 'center', padding: 30}}
        refreshControl={
          <RefreshControl
            refreshing={!!this.props.working}
            onRefresh={this.refreshBalance.bind(this)}
          />
        }>
        <AccountTile accountProfile={this.props.accountProfile} balance={this.props.balance} network={this.props.network} usdBalance={this.props.usdBalance} tileButton={this.showLightBox} buttonIcon={'plus-square'} />
      </ScrollView>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const settings = networkSettingsForAddress(state, ownProps.address)
  // const networkName = settings.network ? settings.network.charAt(0).toUpperCase() + settings.network.slice(1).toLowerCase() : null
  const ethBalance = settings.balance && settings.balance.ethBalance ? wei2eth(settings.balance.ethBalance) : 0
  const usdBalance = settings.balance && settings.balance.usdBalance ? settings.balance.usdBalance : 0
  const explorerUrl = (networksByName[settings.network]||{}).explorerUrl
  // const activities = toJs(activitiesForAddress(state, ownProps.address))
  return {
    ...ownProps,
    hexaddress: settings.hexaddress,
    balance: ethBalance,
    usdBalance: usdBalance,
    network: settings.network,
    working: working(state, 'balance'),
    explorerUrl
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    refreshBalance: (address) => dispatch(refreshBalance(address))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountInfo)
