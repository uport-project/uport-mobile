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
import { toJs, getIn } from 'mori'
import { connect } from 'react-redux'
import { View, TouchableOpacity, FlatList } from 'react-native'
import { Text } from '../shared'
import NetworkStatusBar from 'uPortMobile/lib/components/shared/NetworkStatusBar'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { NavigationActions } from 'uPortMobile/lib/utilities/NavigationActions'
import { onlyPendingAndLatestAttestations } from 'uPortMobile/lib/selectors/attestations'
import { notificationCount } from 'uPortMobile/lib/selectors/activities'
import { currentAvatar, currentName, myAccounts, contacts } from 'uPortMobile/lib/selectors/identities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import Fab from '../shared/Fab'
import { debounce } from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons'
import S from 'string'

export class Home extends React.Component {

  constructor (props) {
    super(props)
    NavigationActions.setNavigator(props.navigator)
    this.state = {
      selectedTab: 0
    }
    this.getFlatListData = this.getFlatListData.bind(this)
    this.renderFlatListItem = this.renderFlatListItem.bind(this)
    this.renderFlatListItemVerifications = this.renderFlatListItemVerifications.bind(this)
    this.renderFlatListItemContacts = this.renderFlatListItemContacts.bind(this)
    this.renderFlatListItemAccounts = this.renderFlatListItemAccounts.bind(this)
    this.keyExtractor = this.keyExtractor.bind(this)
  }

  renderNavBar () {
    const { styles, colors, metrics } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navBarButton}
          onPress={() => this.props.navigator.push({
            screen: 'uport.more',
            title: 'More'
          })}>
          <Icon name='ios-menu' color={colors.brand} size={metrics.navBar.menuIcon} />
        </TouchableOpacity>

        {this.props.unreadNoticationCount > 0 && <TouchableOpacity
          style={styles.navBarButton}
          onPress={() => this.props.navigator.showModal({
            screen: 'uport.notifications',
            title: 'Notifications'
          })}>
          <View style={styles.notifications}>
            <Icon 
              name='ios-notifications-outline' 
              size={metrics.navBar.notificationsIcon}
              color={colors.primaryInverted}
              style={{marginRight: metrics.spacing.horizontal.small}}/>
            <Text style={styles.notificationText}>
              {this.props.unreadNoticationCount}
            </Text>
          </View>
        </TouchableOpacity>}
      </View>
    )
  }

  getFlatListData () {
    switch (this.state.selectedTab) {
      case 0:
        return this.props.verifications
        break
      case 1: 
        return this.props.accounts
        break
      case 2: 
        return this.props.contacts
        break
    }
  }

  keyExtractor (item, index) {
    switch (this.state.selectedTab) {
      case 0:
        return `${item.iat}-${index}`
        break
      case 1: 
        return item.address
        break
      case 2: 
        return item.address
        break
    }
  }

  renderFlatListItem ({item}) {
    switch (this.state.selectedTab) {
      case 0:
        return this.renderFlatListItemVerifications(item)
        break
      case 1: 
        return this.renderFlatListItemAccounts(item)
        break
      case 2: 
        return this.renderFlatListItemContacts(item)
        break
    }
  }

  extractClaimType (verification) {
    if (verification.claimType) {
      return verification.claimType
    }
    return Object.keys(verification.claim).map(claim => S(claim).humanize().titleCase().s).join(', ')
  }

  extractClaims (verification) {
    if (verification.claimType) {
      return 'pending'
    }
    const claim = verification.claim[Object.keys(verification.claim)[0]]
    if (typeof claim === 'object') {
      return Object.keys(claim).slice(0, 3).map(t => claim[t]).join(', ')
    } else {
      return claim
    }
  }  

  renderFlatListItemVerifications (item) {
    const { styles, colors, metrics } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <TouchableOpacity
        onPress={debounce(() => this.props.navigator.push({
          screen: 'uport.verificationCard',
          passProps: {
            verification: item
          }
        }), 1000, {leading: true, trailing: false})}
        style={styles.listRow} >
        <View style={styles.listItemAvatar}>
          <Avatar size={50} source={item.issuer} />
        </View>
        <View>
          <Text bold>
            {this.extractClaimType(item)}
          </Text>
          <Text secondary>
            {item.issuer ? item.issuer.name : `${item.iss.slice(0, 10)}...`}
          </Text>
        </View>
      </TouchableOpacity>      
    )
  }

  renderFlatListItemAccounts (item) {
    const { styles, colors, metrics } = this.context.theme ? this.context.theme : defaultTheme

    const networkName = item.network.charAt(0).toUpperCase() + item.network.slice(1).toLowerCase()
    const accountProfile=item.clientId ? this.props.accountProfileLookup(item.clientId) : null
    
    return (
      <TouchableOpacity
        style={styles.listRow}
        onPress={debounce(() => this.props.navigator.push({
          screen: 'uport.accountInfo',
          title: (accountProfile ? accountProfile.name : 'Ethereum'),
          subTitle: networkName,
          passProps: {
            address: item.address,
            network: networkName,
            accountProfile: accountProfile
          }
        }), 1000, {leading: true, trailing: false})}>
          <View style={styles.listItemAvatar}>
          <Avatar size={50} source={accountProfile || {avatar: require('uPortMobile/assets/images/eth-symbol2.png')}} />
        </View>
        <Text>
          {accountProfile ? accountProfile.name : 'Ethereum (' + networkName + ')'}
        </Text>
      </TouchableOpacity>      
      )
  }

  renderFlatListItemContacts (item) {
    const { styles, colors, metrics } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <TouchableOpacity
        style={styles.listRow}
        onPress={debounce(() => this.props.navigator.push({
          screen: 'uport.contactInfo',
          title: 'Contact',
          passProps: {
            name: item.name,
            address: item.address,
            avatar: item.avatar,
            shareToken: item.shareToken
          }
        }), 1000, {leading: true, trailing: false})}>
        <View style={styles.listItemAvatar}>
          <Avatar size={50} source={item} />
        </View>
        <Text>
          {item.name ? item.name : `${item.address.slice(0, 30)}...`}
        </Text>
      </TouchableOpacity>)
  }

  render () {
    const { styles, colors, metrics } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <View style={styles.homeContainer}>
        <NetworkStatusBar />
        <View style={styles.homeTopContainer}>

          {this.renderNavBar()}
          
          <TouchableOpacity onPress={debounce(() => {
              this.props.navigator.push({
                screen: 'uport.myInfo',
                title: 'My Information',
              })
            }, 1000, {leading: true, trailing: false})}>
            <View style={styles.contentContainer}>
              <Avatar size={96} source={this.props.avatar} />
              <Text h1>{this.props.name}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tabBarButton, this.state.selectedTab === 0 && styles.tabBarButtonActive]}
              onPress={() => this.setState({ selectedTab: 0 })}
              >
              <Text tabBarLabel style={[this.state.selectedTab !== 0 && styles.tabBarButtonInActive]}>
                Verifications
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBarButton, this.state.selectedTab === 1 && styles.tabBarButtonActive]}
              onPress={() => this.setState({ selectedTab: 1 })}
              >
              <Text tabBarLabel style={[this.state.selectedTab !== 1 && styles.tabBarButtonInActive]}>
                Accounts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBarButton, this.state.selectedTab === 2 && styles.tabBarButtonActive]}
              onPress={() => this.setState({ selectedTab: 2 })}
              >
              <Text tabBarLabel style={[this.state.selectedTab !== 2 && styles.tabBarButtonInActive]}>
                Contacts
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        <FlatList
          contentContainerStyle={{paddingBottom: 100}}
          data={this.getFlatListData()}
          renderItem={this.renderFlatListItem}
          keyExtractor={this.keyExtractor}
        />

        <Fab
          icon='qrcode-scan'
          onPress={() => this.props.navigator.push({
            screen: 'uport.scanner',
            animated: false,
            navigatorStyle: {
              navBarHidden: true
            }
          })}
        />
      </View>
    )
  }
}

Home.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    unreadNoticationCount: notificationCount(state),
    avatar: currentAvatar(state),
    name: currentName(state),
    contacts: contacts(state) || [],
    accounts: myAccounts(state),
    accountProfileLookup: (clientId) => toJs(externalProfile(state, clientId)),
    verifications: onlyPendingAndLatestAttestations(state),
    lookupIssuer: (clientId) => toJs(externalProfile(state, clientId)),
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(Home))
