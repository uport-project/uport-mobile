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
import { Alert, RefreshControl, Dimensions, DeviceInfo, Clipboard, Linking, Share, StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native'
import { connect } from 'react-redux'
import QRCode from 'react-native-qrcode'
import EvilIcon from 'react-native-vector-icons/Feather'
import Ionicon from 'react-native-vector-icons/Ionicons'
import { DangerButton } from 'uPortMobile/lib/components/shared/Button'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import metrics from 'uPortMobile/lib/styles/metrics'
import { refreshBalance } from 'uPortMobile/lib/actions/uportActions'
import { FAUCETS } from 'uPortMobile/lib/utilities/networks'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import { working } from 'uPortMobile/lib/selectors/processStatus'

import { wei2eth } from 'uPortMobile/lib/helpers/conversions'

// selectors
import { networkSettingsForAddress } from 'uPortMobile/lib/selectors/chains'

const styles = StyleSheet.create({
  cardContainer: {
    borderColor: 'transparent',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingTop: DeviceInfo.isIPhoneX_deprecated ? 35 : 10,
    paddingBottom: DeviceInfo.isIPhoneX_deprecated ? 35 : 0
  },
  screenContentContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'column'
  },
  warningMessageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  warningMessage: {
    paddingVertical: 15,
    fontSize: metrics.font.size.large,
    lineHeight: metrics.font.lineHeight.large
  },
  instructionsText: {
    flexDirection: 'row',
    flex: 1,
    textAlign: 'left',
    fontSize: metrics.font.size.medium,
    color: 'white'
  },
  address: {
    padding: 10,
    textAlign: 'center',
    fontSize: metrics.font.size.medium,
    color: 'white'
  },
  addressButton: {
    marginBottom: 10,
    borderColor: '#CCCCCC',
    backgroundColor: '#7958D8',
    borderRadius: 5,
    paddingVertical: 20
  },
  instructionsTextView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: metrics.spacing.horizontal.regular,
    marginRight: metrics.spacing.horizontal.regular
  },
  addressTextView: {
    marginLeft: metrics.spacing.horizontal.small,
    marginRight: metrics.spacing.horizontal.small,
    alignSelf: 'center',
    paddingTop: 15
  },
  qrCodeView: {
    marginTop: metrics.spacing.vertical.large,
    paddingBottom: metrics.spacing.vertical.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeBorder: {
    borderWidth: 4,
    borderColor: '#333333',
    shadowColor: 'black',
    shadowOffset: {width: 0,height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 20
  },
  externalLink: {
    color: colors.brand,
    padding: 10, 
    fontSize: metrics.font.size.medium
  }
})

export class AccountFunding extends React.Component {
  constructor (props) {
    super(props)
    this.copyHandler = this.copyHandler.bind(this)
    this.close = this.close.bind(this)
    this.shareHandler = this.shareHandler.bind(this)
    this.refreshBalanceHandler = this.refreshBalanceHandler.bind(this)

    this.state = {
      showAddress: false
    }
    if (this.props.navigator) {
      this.props.navigator.setStyle({navBarHidden: true})
    }
  }

  copyHandler () {
    Clipboard.setString(this.props.hexAddress)
    Alert.alert('Address copied', this.props.hexAddress)
  }

  shareHandler () {
    const message = this.props.network === 'mainnet'
          ? `My Ethereum address is ${this.props.hexAddress}`
          : `My address on the ${this.props.network} network is ${this.props.hexAddress}. WARNING!!! Do not send real ETH here or you will loose it!!!`
    Share.share({
      message,
      url: `ethereum:${this.props.hexAddress}`,
      title: `Share ${this.props.network} address`
    })
  }

  close () {
    this.props.navigator.dismissModal()
  }

  refreshBalanceHandler () {
    this.props.refreshBalance(this.props.address)
  }

  showAddress () {
    this.setState({
      showAddress: true
    })
  }

  renderWarningMessage () {
    return (
      <View style={styles.warningMessageContainer}>
        <EvilIcon name='alert-triangle' size={metrics.font.size.extraLarge} color={colors.red} />
        <Text style={styles.warningMessage}>This account is on the test Ethereum network { this.props.network }. Do not send real ETH to this address or you will loose it.
        </Text>
        <DangerButton onPress={() => this.showAddress()} >Okay, I understand</DangerButton>
      </View>
    )
  }

  renderEthAddress () {
    return (
      <View>
        <View>
          <Text style={{fontSize: metrics.font.size.large, textAlign: 'center'}}>Ethereum account</Text>
          <Text style={{fontSize: metrics.font.size.regular, textAlign: 'center'}}>{this.props.network ? capitalizeFirstLetter(this.props.network) : null} | {this.props.balance ? this.props.balance : 0} ETH</Text>
        </View>
        <View style={styles.qrCodeView}>
          <View style={styles.qrCodeBorder}>
            <QRCode
              value={this.props.hexAddress}
              size={Dimensions.get('window').height * 0.25}
              bgColor='white'
              fgColor='#333333' />
          </View>
        </View>

        <View style={styles.addressTextView}>
          <TouchableOpacity style={{flexDirection: 'column', alignSelf: 'center', alignItems: 'center'}} onPress={() => this.copyHandler()} style={styles.addressButton}>
            <Text style={styles.address}>{this.props.hexAddress}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{flexDirection: 'column', alignSelf: 'center', alignItems: 'center'}} onPress={() => this.shareHandler()}>
          <Text style={{ textAlign: 'center', fontSize: metrics.font.size.medium }}>Share Address</Text>
          <Ionicon name={'ios-share-outline'} size={32} />
        </TouchableOpacity>
        
        {
          this.props.network !== 'mainnet'
            ? <View style={{marginTop: 30}}>
                <Text style={{fontSize: metrics.font.size.medium, textAlign: 'center'}}>
                  Request test Ether for free
                </Text>
                <View style={{alignItems: 'center', paddingTop: 10}}>

                {
                  this.renderFaucetLink(this.props.network)
                }

                </View>
              </View>
            : null
        }
      </View>
    )
  }

  renderFaucetLink(network) {
    const protocol = 'https'
    return (
      <TouchableOpacity onPress={() => Linking.openURL(`${protocol}://${FAUCETS[network].url}`)}>
        <Text style={styles.externalLink}> 
          { capitalizeFirstLetter(network) } <EvilIcon name='external-link' size={metrics.font.size.medium} color={colors.brand} />
        </Text>
      </TouchableOpacity>
    )
  }

  render () {
    return (
      <View style={styles.cardContainer}>
        <View style={{zIndex: 1, elevation: 1, flex: 0, justifyContent: 'flex-end', flexDirection: 'row'}}>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', flex: 0, padding: 15}} onPress={() => this.props.close ? this.props.close() : this.close()}>
            <EvilIcon name='x' size={metrics.font.size.medium} color={colors.brand} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.screenContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={!!this.props.working}
              onRefresh={this.refreshBalanceHandler}
            />
        }>
          {
            this.state.showAddress || this.props.network === 'mainnet'
              ? this.renderEthAddress()
              : this.renderWarningMessage()
          }
        </ScrollView>
    </View>
    )
  }
}

AccountFunding.propTypes = {
  hexAddress: PropTypes.string,
  network: PropTypes.string,
  refreshBalance: PropTypes.func
}

const mapStateToProps = (state, ownProps) => {
  const settings = networkSettingsForAddress(state, ownProps.address)
  const ethBalance = settings.balance && settings.balance.ethBalance ? wei2eth(settings.balance.ethBalance) : 0
  const usdBalance = settings.balance && settings.balance.usdBalance ? settings.balance.usdBalance : 0

  return {
    ...ownProps,
    balance: ethBalance,
    usdBalance: usdBalance,
    address: settings.address,
    hexAddress: settings.hexaddress,
    network: settings.network,
    working: working(state, 'balance'),
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    refreshBalance: (address) => dispatch(refreshBalance(address))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountFunding)
