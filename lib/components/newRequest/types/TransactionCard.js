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
// Framework
import React from 'react'
import PropTypes from 'prop-types'
import {
  Alert,
  Button,
  Clipboard,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Share
} from 'react-native'
import { connect } from 'react-redux'
import BN from 'bn.js'

import { defaultNetwork, networks } from 'uPortMobile/lib/utilities/networks'
import verifiedByUport from 'uPortMobile/lib/utilities/verifiedByUport'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import Ionicon from 'react-native-vector-icons/Ionicons'
import AccountTileSmall from 'uPortMobile/lib/components/shared/AccountTileSmall'
import metrics from 'uPortMobile/lib/styles/metrics'

// Styles
import globalStyles, { colors, textStyles } from 'uPortMobile/lib/styles/globalStyles'

// Selectors
import { clientProfile, currentRequest, destinationProfile } from 'uPortMobile/lib/selectors/requests'
import { publicUport, currentAddress, connections } from 'uPortMobile/lib/selectors/identities'
import { statusMessage } from 'uPortMobile/lib/selectors/processStatus'
import { currentNetwork, networkSettingsForAddress, gasPrice, web3ForAddress } from 'uPortMobile/lib/selectors/chains'

import { toJs } from 'mori'

// Actions
import { authorizeRequest, cancelRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'
import { refreshBalance } from 'uPortMobile/lib/actions/uportActions'

import CardStateBox from '../partials/CardStateBox'
import InteractionStats from '../partials/InteractionStats'
import { PrimaryButton } from 'uPortMobile/lib/components/shared/Button'

// Utilities
import { formatWeiAsEth, wei2eth } from 'uPortMobile/lib/helpers/conversions'
import { FAUCETS } from 'uPortMobile/lib/utilities/networks'
import base58 from 'bs58'
const S = require('string')
const humanize = (s) => S(s).humanize().s
const capitalize = (s) => S(s).capitalize().s
const mnid = require('mnid')

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 40,
    marginTop: 22
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 22,
    marginBottom: 8
  },
  url: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
})

// ===========================================================================
// old sig
const setAttributesSig = '6737c877'
// new sig
const setSig = 'd79d8e6c'

export const formatBytes = (bytes) => {
  if (bytes.match(/^[ -~]+$/)) {
    return bytes
  }
  const buf = new Buffer(bytes)
  const hex = buf.toString('hex')
  // console.log(hex)
  if (hex.match(/^1220[0-9a-f]{64}$/)) {
    return base58.encode(buf)
  }
  if (hex.length < 20) return hex
  return `0x${hex.slice(0, 10)}...${hex.slice(hex.length - 8)}`
}

const formatParam = (type, arg) => {
  switch (type) {
    case 'bytes':
      return formatBytes(arg)
    case 'bytes32':
      return formatBytes(arg)
    case 'address':
      return `${arg.slice(0, 8)}...${arg.slice(arg.length - 6)}`
    default:
      return arg
  }
}

const FunctionParam = (abi, arg, i) => {
  const type = abi.types[i]
  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 24, paddingTop: 17, paddingBottom: 17, borderTopWidth: 1, borderTopColor: colors.white226}} key={`request-abi-arg-${i}`}>
      <Text>{type}</Text>
      <Text>{formatParam(type, arg)}</Text>
    </View>
  )
}

export class TransactionCard extends React.Component {

  constructor (props) {
    super()
    this.state = {
      advanced: false,
      funding: false
    }
    this.toggleAdvanced = this.toggleAdvanced.bind(this)
    this.pickScreen = this.pickScreen.bind(this)
    this.toggleFunding = this.toggleFunding.bind(this)
    this.renderFunding = this.renderFunding.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return !!nextProps.request
  }

  toggleAdvanced () {
    this.setState({advanced: !this.state.advanced})
  }

  toggleFunding () {
    this.setState({funding: !this.state.funding})
  }

  copyHandler () {
    Clipboard.setString(this.props.hexAddress)
    Alert.alert('Address copied', this.props.network === 'mainnet' ? this.props.hexAddress : `WARNING!!! This is a ${capitalize(this.props.network)} address. Do not send real ETH here or you will loose it!!!`)
  }

  shareHandler () {
    const message = this.props.network === 'mainnet'
          ? `My Ethereum address is ${this.props.hexAddress}`
          : `My address on the ${capitalize(this.props.network)} network is ${this.props.hexAddress}. WARNING!!! Do not send real ETH here or you will loose it!!!`
    Share.share({
      message,
      url: `ethereum:${this.props.hexAddress}`,
      title: `Share ${capitalize(this.props.network)} address`
    })
  }

  renderFunding () {
    if (!(this.props.signerType !== "KeyPair" || (this.props.request.gasCost && (this.props.balance && this.props.balance > this.props.request.gasCost)) || (this.props.balance && this.props.request.value && this.props.balance > formatWeiAsEth(this.props.request.value)))) {
      return (
        <View style={{borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: '#E0DFE6', borderBottomColor: '#E0DFE6', marginTop: 10, marginBottom: 10, padding: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
          <View style={{flex: 1}}>
            <Text style={[textStyles.small, {color: 'black', textAlign: 'left'}]}>You will need to add funds to fully interact with this app. Add funds now?</Text>
            {this.props.network !== 'mainnet' ? 
              <TouchableOpacity onPress={() => Linking.openURL(`https://${FAUCETS[this.props.network].url}`)}>
                <Text style={[textStyles.small, {color: colors.brand, textDecorationLine: 'underline', textAlign: 'left'}]}>
                  Request free { capitalize(this.props.network) } Ether <EvilIcon name='external-link' size={metrics.font.size.medium} color={colors.brand} />
                </Text>
              </TouchableOpacity>
          
            : null}
          </View>
          <TouchableOpacity style={{flex: 0, marginLeft: 8}} onPress={() => this.copyHandler()}>
            <Ionicon name={'ios-copy-outline'} size={32} />
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 0, marginLeft: 16}} onPress={() => this.shareHandler()}>
            <Ionicon name={'ios-share-outline'} size={32} />
          </TouchableOpacity>
        </View>)
    }
  }

  pickScreen () {
    if (this.state.advanced) {
      return (
        <View style={{backgroundColor: '#FAFAFE'}}>
          <View style={{backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', borderColor: colors.white226, borderWidth: 1, paddingTop: 50, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, shadowColor: 'rgb(200, 200, 200)', shadowOffset: { width: 0, height: 1.5 }, shadowOpacity: 0.4, shadowRadius: 12}}>
            <TouchableOpacity onPress={() => this.toggleAdvanced()}>
              <Ionicon name='md-arrow-back' size={20} style={{paddingLeft: 32, paddingBottom: 20}}/>
            </TouchableOpacity>
            <Text style={{flex: 1, textAlign: 'center', fontSize: 16, paddingRight: 52, paddingBottom: 20}}> Details </Text>
          </View>
          <Text style={{marginLeft: 24, marginBottom: 6, marginTop: 14}}> Contract Details </Text>
          <View style={{backgroundColor: '#FFFFFF', justifyContent: 'space-evenly', borderLeftWidth: 1, borderLeftColor: colors.white226, borderRightWidth: 1, borderRightColor: colors.white226}}>
            <View>
              {this.props.request.abi ? 
                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 24, paddingTop: 17, paddingBottom: 17, borderTopWidth: 1, borderTopColor: colors.white226}}>
                  <Text>Function</Text>
                  <Text>{this.props.request.abi.name.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase() })}</Text>
                </View> : null}
            
              {this.props.request.abi && this.props.request.abi.args
                ? this.props.request.abi.args.map((arg, i) => FunctionParam(this.props.request.abi, arg, i)) : null}

              { this.props.request.value && this.props.request.value > 0
                  ? <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 24, paddingTop: 17, paddingBottom: 17, borderTopWidth: 1, borderTopColor: colors.white226}}>
                    <Text>Value</Text>
                    <Text>{`${formatWeiAsEth(this.props.request.value)} ETH`} </Text>
                  </View>
                  : null
                }
              { this.props.request.network
              ? <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 24, paddingTop: 17, paddingBottom: 17, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.white226}}>
                <Text>Network</Text>
                <Text>{networks[this.props.request.network] ? networks[this.props.request.network].name : this.props.request.network}</Text>
              </View>
              : null}
            </View>
          </View>
          <Text style={{paddingTop: 13, paddingLeft: 24, paddingBottom: 17}}>Contract Address</Text>
          <View style={{backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 24, paddingTop: 17, paddingBottom: 17, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.white226}}>
            <Text>{this.props.request.to} </Text>
          </View>
        </View>
      )
    } else {
      return (
        <View>
          <View style={{backgroundColor: '#F6F5FE', borderTopLeftRadius: 12, borderTopRightRadius: 12}}>
            <View style={{alignItems: 'flex-start'}}>
              <TouchableOpacity style={{paddingLeft: 24, paddingTop: 14, paddingBottom: 10, paddingRight: 20}} onPress={() => this.props.clearRequest()}>
                <Text style={{color: colors.brand, fontSize: 16}}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={{fontFamily: 'NunitoSans-Bold', color: colors.grey74, fontSize: 20, lineHeight: 26, marginLeft: 23}}>
              {this.props.cardTitle}
            </Text>
            <Text style={{marginLeft: 24, marginTop: 10, marginBottom: 5, fontSize: 12}}>Selected Account</Text>
            <AccountTileSmall accountProfile={this.props.client} balance={this.props.balance} usdBalance={this.props.usdBalance} />

            {this.renderFunding()}

            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 24, marginRight: 24, marginTop: 5, marginBottom: 5}}>
              <Text style={{fontSize: 10}}> DETAILS </Text>
              <TouchableOpacity
                style={{padding: 3}}
                onPress={() => this.toggleAdvanced()}>
                <Ionicon name='ios-information-circle-outline' size={15} color={colors.brand} />
              </TouchableOpacity>
            </View>
            {this.props.request.abi
                ? <View style={{flexDirection: 'row', justifyContent: 'space-between', marginLeft: 8, marginRight: 8, backgroundColor: '#FFFFFF', paddingTop: 15, paddingBottom: 15, paddingLeft: 15, paddingRight: 15, shadowColor: 'rgb(200, 200, 200)', shadowOffset: { width: 0, height: 1.5 }, shadowOpacity: 0.5, shadowRadius: 16}}>
                  <Text style={{fontSize: metrics.font.size.regular}}>{this.props.request.abi.name.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase() })}</Text>
                  <Text style={{fontSize: metrics.font.size.regular}}>{this.props.request.abi.args}</Text>
                </View> : null}
            {this.props.signerType === "KeyPair" && <View>
              <Text style={{marginLeft: 24, marginTop: 15, marginBottom: 5, fontSize: 10}}> NETWORK FEE </Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 8, marginRight: 8, backgroundColor: '#FFFFFF', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, paddingRight: 15, shadowColor: 'rgb(200, 200, 200)', shadowOffset: { width: 0, height: 1.5 }, shadowOpacity: 0.5, shadowRadius: 16}}>
                <Text style={{fontSize: metrics.font.size.regular}}>Average</Text>
                <View>
                  <Text style={{fontSize: metrics.font.size.regular, textAlign: 'right'}}> ${this.props.request.ethSpotPrice && this.props.request.gasCost ? (this.props.request.ethSpotPrice * this.props.request.gasCost).toFixed(2) : null } USD </Text>
                  <Text style={{fontSize: metrics.font.size.small, textAlign: 'right'}}> {this.props.request.gasCost ? this.props.request.gasCost : null} ETH </Text>
                </View>
              </View>
            </View>}

            { /* See Transacction Link */}
            {
            this.props.request.txhash
              ? (
                <Button onPress={
                  () => {
                    Linking.openURL(
                      (networks[this.props.request.network] !== undefined ? networks[this.props.request.network].explorerUrl + '/tx/' + this.props.request.txhash
                      : defaultNetwork.explorerUrl + '/tx/' + this.props.request.txhash)
                    )
                  }
                } title='See Transaction' />
              )
              : null
            }
        
            { this.props.request.canceledAt
            ? (<View style={[globalStyles.canceledBox, {borderRadius: 8}]}>
              <Text style={{
                textAlign: 'center',
                fontFamily: 'Rubik-Medium',
                letterSpacing: 1,
                color: '#ffffff',
                fontSize: 13
              }}>
              TRANSACTION CANCELED
              </Text>
            </View>
            )
            : ((!this.props.request.authorizedAt && this.props.validDestination !== false)
                ? (this.props.signerType !== "KeyPair" || (this.props.request.gasCost && (this.props.balance && this.props.balance > this.props.request.gasCost)) || (this.props.balance && this.props.request.value && this.props.balance > formatWeiAsEth(this.props.request.value))
              //  ? (props.balance >= props.request.value
                ? <View style={{backgroundColor: colors.white246}}>
                  <PrimaryButton
                    onPress={() => this.props.authorizeRequest(this.props.request)}
                    style={{marginLeft: 30, marginRight: 30, marginTop: 10, marginBottom: 30}}>
                    Approve Transaction
                  </PrimaryButton>
                </View>
                : <View style={{backgroundColor: 'rgba(178, 177, 194, 1)', marginLeft: 8, marginRight: 8, marginTop: 15, marginBottom: 15, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                    <Text style={{color: colors.white246}}>INSUFFICIENT FUNDS</Text>
                </View>

                )
              : !this.props.request.blockNumber
                  ? (
                    <CardStateBox
                      state={
                        this.props.request.error || this.props.validDestination === false
                        ? 'error'
                        : 'pending'
                      }
                      text={
                        this.props.request.error ||
                        (this.props.validDestination === false
                        ? `Unverifiable ${this.props.network} address`
                        : null) ||
                        (this.props.request.txhash
                          ? 'Waiting for confirmation...'
                          : this.props.transactionMessage
                        )
                      }
                      style={{flex: 0, marginBottom: 30}} />
                  )
                  : (
                    <CardStateBox
                      style={{borderRadius: 8, flex: 0, marginBottom: 30}}
                      state={parseInt(this.props.request.status) === 1 ? 'success' : 'error'}
                      text={parseInt(this.props.request.status) === 1 ? 'Transaction completed.' : 'Transaction failed.'}
                    />
                  ))
            }
          </View>
        </View>
      )
    }
  }

  // there is a split second where there isn't a `to` value,
  // which causes problems. This ugly construct solves that
  render () {
    const showUrl = this.props.client && this.props.client.url !== undefined
    
    return (
      <View style={{flex: 0, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end'}}>
        <View style={{flex: 0, justifyContent: 'center', alignItems: 'center'}}>
          { this.props.client && this.props.client.avatar ? <Image resizeMode='cover'
            source={this.props.client.avatar} 
            style={{borderRadius: 3}} /> : null }
          {showUrl && <View style={styles.url}>
            <TouchableOpacity onPress={() => Linking.openURL(this.props.client.url)}>
              <Text style={{color: "white"}}>{this.props.client.url}</Text>
            </TouchableOpacity>
          </View>}
          <InteractionStats
            stats={typeof this.props.contact !== 'undefined' ? this.props.contact.stats : {}}
            color='rgba(255, 255, 255, 0.7)'
            actionText={'interacted'}
            counterParty={this.props.contact}/>
        </View>
        {this.pickScreen()}
      </View>
    )
  }
}

TransactionCard.propTypes = {
  // balance: PropTypes.object,
  contact: PropTypes.object,
  connections: PropTypes.array,
  currentIdentity: PropTypes.object,
  network: PropTypes.string,
  request: PropTypes.object,
  transactionMessage: PropTypes.string,
  signerType: PropTypes.string,
  uportVerified: PropTypes.bool,
  validDestination: PropTypes.bool,
  cardTitle: PropTypes.string,
  authorizeRequest: PropTypes.func,
  cancelRequest: PropTypes.func
}

const mapStateToProps = (state) => {
  const request = currentRequest(state)
  const address = request && request.target || currentAddress(state)
  const decodedMnid = mnid.isMNID(address) ? mnid.decode(address) : address
  const client = clientProfile(state)
  const contact = destinationProfile(state, address) || client || {}
  const network = decodedMnid ? networks[decodedMnid.network].name : currentNetwork(state)
  const currentIdentity = toJs(publicUport(state))
  const uportVerified = request && request.client_id ? Object.keys(verifiedByUport).indexOf(request.client_id) > -1 : false
  const transactionMessage = statusMessage(state, 'tx')
  const networkSettings = networkSettingsForAddress(state, address) || {}

  const ethBalance = networkSettings.balance && networkSettings.balance.ethBalance ? formatWeiAsEth(networkSettings.balance.ethBalance) : 0
  const usdBalance = networkSettings.balance && networkSettings.balance.usdBalance ? networkSettings.balance.usdBalance : 0

  let cardTitle
  if (request) {
    cardTitle = !!request && !!request.fnSig && (request.fnSig === setAttributesSig || request.fnSig === setSig)
      ? 'Update Public uPort'
      : (request.abi !== null && !!request.abi
        ? humanize(request.abi.name)
        : (!!request && request.value && request.value > 0
          ? `Send ${formatWeiAsEth(request.value)} ETH?`
          : 'Sign Transaction?'))
  }
  return {
    contact,
    client,
    address,
    decodedMnid,
    hexAddress: decodedMnid ? decodedMnid.address : undefined,
    currentIdentity,
    signerType: networkSettings.signerType,
    network,
    request,
    transactionMessage,
    uportVerified,
    validDestination: contact._validated,
    balance: ethBalance,
    usdBalance: usdBalance,
    connections: connections(state) || [],
    cardTitle
  }
}

const mapDispatchToProps = (dispatch) => ({
  authorizeRequest: (activity) => dispatch(authorizeRequest(activity.id)),
  cancelRequest: (activity) => dispatch(cancelRequest(activity.id)),
  clearRequest: () => dispatch(clearRequest()),
  refreshBalance: (address) => dispatch(refreshBalance(address))
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(TransactionCard)
