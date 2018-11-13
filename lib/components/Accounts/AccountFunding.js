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
import { toJs } from 'mori'
import QRCode from 'react-native-qrcode'
import EvilIcon from 'react-native-vector-icons/Feather'
import { DangerButton } from 'uPortMobile/lib/components/shared/Button'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { refreshBalance } from 'uPortMobile/lib/actions/uportActions'
import { FAUCETS } from 'uPortMobile/lib/utilities/networks'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import { working } from 'uPortMobile/lib/selectors/processStatus'

import { wei2eth } from 'uPortMobile/lib/helpers/conversions'

// selectors
import { networkSettingsForAddress } from 'uPortMobile/lib/selectors/chains'

// dimensions
export const windowWidth = Dimensions.get('window').width
export const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
  cardContainer: {
    height: windowHeight,
    width: windowWidth,
    borderColor: 'transparent',
    flex: 1,
    paddingTop: DeviceInfo.isIPhoneX_deprecated ? 35 : 10,
    paddingBottom: DeviceInfo.isIPhoneX_deprecated ? 35 : 0
  },
  card: {
    alignItems: 'stretch', 
    borderTopWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    bottom: 0,
    height: windowHeight, // * 0.86,
    justifyContent: 'flex-end',
    paddingBottom: 30,
    position: 'absolute',
    width: windowWidth
  },
  screenContentContainer: {
    alignItems: 'center'
  },
  warningMessageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  warningMessage: {
    paddingVertical: 15,
    fontSize: windowHeight * 0.025,
    lineHeight: windowHeight * 0.030,
  },
  instructionsText: {
    flexDirection: 'row',
    flex: 1,
    textAlign: 'left',
    fontSize: windowHeight * 0.025,
    color: 'white'
  },
  address: {
    padding: 10,
    fontSize: windowWidth * 0.033,
    color: 'white',
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
    marginLeft: windowWidth * 0.05,
    marginRight: windowWidth * 0.05
  },
  addressTextView: {
    marginLeft: windowWidth * 0.05,
    marginRight: windowWidth * 0.05,
    paddingTop: 15,
    
  },
  qrCodeView: {
    marginTop: windowHeight * 0.03,
    paddingBottom: windowHeight * 0.02,
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
    fontSize: windowHeight * 0.025
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
    this.props.navigator.dismissLightBox()
  }

  refreshBalanceHandler () {
    this.props.refreshBalance(this.props.address)
  }

  showAddress() {
    this.setState({
      showAddress: true
    })
  }

  renderWarningMessage() {
    return (
      <View style={styles.warningMessageContainer}>
        <EvilIcon name='alert-triangle' size={windowHeight * 0.1} color={colors.red} />
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
          <Text style={{fontSize: windowHeight * 0.040, textAlign: 'center'}}>Ethereum account</Text>
          <Text style={{fontSize: windowHeight * 0.020, textAlign: 'center'}}>{this.props.network ? capitalizeFirstLetter(this.props.network) : null} | {this.props.balance ? this.props.balance : 0} ETH</Text>
        </View>
        <View style={styles.qrCodeView}>
          <View style={styles.qrCodeBorder}>
            <QRCode
              value={this.props.hexAddress}
              size={windowHeight * 0.25}
              bgColor='white'
              fgColor='#333333' />
          </View>
        </View>

        <View style={styles.addressTextView} onPress={() => this.copyHandler()}>
          <TouchableOpacity onLongPress={() => this.shareHandler()} onPress={() => this.copyHandler()} style={styles.addressButton}>
            <Text style={styles.address}>{this.props.hexAddress}</Text>
          </TouchableOpacity>
          <Text style={{textAlign: 'center', fontSize: windowHeight * 0.015, }}>Tap address to copy. Press and hold to share. </Text>
        </View>
        
        {
          this.props.network !== 'mainnet'
            ? <View style={{marginTop: 30}}>
                <Text style={{fontSize: windowHeight * 0.025, textAlign: 'center'}}>
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
          { capitalizeFirstLetter(network) } <EvilIcon name='external-link' size={windowHeight * 0.025} color={colors.brand} />
        </Text>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={[styles.cardContainer, { backgroundColor: this.props.isModal ? 'none' : '#FFFFFF' }]}>
        <View style={{zIndex: 1, elevation: 1, flex: 0, justifyContent: 'flex-end', flexDirection: 'row'}}>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', flex: 0, padding: 15}} onPress={() => this.props.close ? this.props.close() : this.close()}>
            <EvilIcon name='x' size={windowHeight * 0.05} color={colors.brand} />
          </TouchableOpacity>
        </View>
        <ScrollView 
          refreshControl={
            <RefreshControl
              refreshing={!!this.props.working}
              onRefresh={this.refreshBalanceHandler.bind(this)}
            />
          }>
          <View style={styles.screenContentContainer}>
            {
              this.state.showAddress || this.props.network === 'mainnet'
                ? this.renderEthAddress()
                : this.renderWarningMessage()
            }
          </View>
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

