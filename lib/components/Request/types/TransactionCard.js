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
  Button,
  Component,
  Linking,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  DeviceInfo
} from 'react-native'
import { connect } from 'react-redux'
import BN from 'bn.js'

import { defaultNetwork, networks } from 'uPortMobile/lib/utilities/networks'
import verifiedByUport from 'uPortMobile/lib/utilities/verifiedByUport'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

// Selectors
import { clientProfile, currentRequest, destinationProfile } from 'uPortMobile/lib/selectors/requests'
import { publicUport, currentAddress, connections } from 'uPortMobile/lib/selectors/identities'
import { statusMessage } from 'uPortMobile/lib/selectors/processStatus'
import { currentNetwork, networkSettingsForAddress, gasPrice, web3ForAddress } from 'uPortMobile/lib/selectors/chains'

import { toJs } from 'mori'

// Actions
import { authorizeRequest, cancelRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'

import CardStateBox from '../partials/CardStateBox'
import InteractionStats from '../partials/InteractionStats'
import DataFlowHeader from '../partials/DataFlowHeader'
import RequestItem, { RequestItemList } from '../partials/RequestItem'

import { AcceptCancelGroup, CancelButton, PrimaryButton } from 'uPortMobile/lib/components/shared/Button'

// Utilities
import { formatWeiAsEth } from 'uPortMobile/lib/helpers/conversions'
import base58 from 'bs58'
const S = require('string')
const humanize = (s) => S(s).humanize().s
// Styles
import globalStyles, { colors, textStyles } from 'uPortMobile/lib/styles/globalStyles'
import { darkStyles, lightStyles } from 'uPortMobile/lib/styles/index'

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
  }
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
    <RequestItem
      key={`request-abi-arg-${i}`}
      type={type}
      value={formatParam(type, arg)}
    />
  )
}

export class TransactionCard extends React.Component {

  constructor (props) {
    super()
    this.state = {
      advanced: false
    }
    this.toggleAdvanced = this.toggleAdvanced.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return !!nextProps.request
  }

  toggleAdvanced () {
    this.setState({advanced: !this.state.advanced})
  }

  // there is a split second where there isn't a `to` value,
  // which causes problems. This ugly construct solves that
  render () {
    return (
    <View style={{height: Dimensions.get('window').height, width: Dimensions.get('window').width, borderWidth: 1, borderColor: 'transparent', paddingBottom: DeviceInfo.isIPhoneX_deprecated ? 35 : 15}}>
      <View style={{backgroundColor: 'white', position: 'absolute', bottom: 0, justifyContent: 'center', width: '100%', borderRadius: 16}}>
        {/* <DataFlowHeader
          sender={props.currentIdentity}
          recipient={props.contact}
          verified={props.uportVerified}
        /> */}
        <View style={styles.titleBar}>
          <Text style={[textStyles.h2, {alignSelf: 'center'}]}>
            Approve Transaction
          </Text>
          <TouchableOpacity
            onPress={() => this.props.cancelRequest(this.props.request)}
            style={{
              position: 'absolute',
              height: 44,
              width: 44,
              top: 16,
              right: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <EvilIcon size={28} name='close' color='rgba(155,155,155,1)'/>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={textStyles.h1}>
            {this.props.cardTitle}
          </Text>
          {/* <Text style={textStyles.small}>
            {this.props.request.to}
          </Text> */}
        </View>

        {/*Interaction stats & advanced button*/}
        {(!this.props.request.authorizedAt && this.props.validDestination !== false)
          ? !this.props.request.value || this.props.request.value === 0 || (this.props.balance && this.props.balance.gte(this.props.request.value))
            ? (<View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 10, paddingBottom: 20, paddingRight: 30}}>
              <InteractionStats
                stats={typeof this.props.contact !== 'undefined' ? this.props.contact.stats : {}}
                actionText={'interacted'}
                counterParty={this.props.contact}
              />
              <TouchableOpacity
                onPress={() => this.toggleAdvanced()}>
                <EvilIcon size={24} name={this.state.advanced ? 'minus' : 'plus'} color='rgba(155,155,155,1)' />
              </TouchableOpacity>
            </View>)
            : <Text style={{textAlign: 'center', paddingBottom: 10}}>You have insufficient funds for this action.</Text>
          : null
        }

        {/* Credentials List */}
        {this.state.advanced || this.props.request.authorizedAt ? <View style={{marginRight: 30, marginLeft: 30, marginBottom: 40, borderLeftWidth: 1, borderLeftColor: colors.white226, borderRightWidth: 1, borderRightColor: colors.white226}}>
          <RequestItemList>
            {this.props.request.abi
            ? <RequestItem
              type='Function'
              value={this.props.request.abi.name.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase() })}
              />
            : null}
            {this.props.request.abi && this.props.request.abi.args
            ? this.props.request.abi.args.map((arg, i) => FunctionParam(this.props.request.abi, arg, i))
            : null}
            <RequestItem type='Contract' value={this.props.request.to ? `${this.props.request.to.slice(0, 8)}...${this.props.request.to.slice(34)}` : ''} />
            { this.props.request.value && this.props.request.value > 0
                ? <RequestItem type='Value' value={`${formatWeiAsEth(this.props.request.value)} ETH`} />
                : null
              }
            { this.props.request.network
            ? <RequestItem
              type='Network'
              value={networks[this.props.request.network] ? networks[this.props.request.network].name : this.props.request.network}
            />
            : null}
          </RequestItemList>
        </View> : null }

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

        <View style={{backgroundColor: colors.white246, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingTop: 25, paddingBottom: 25}}>
          <Text style={[darkStyles.bold, {fontSize: 14}]}> Transaction Cost</Text>
          <Text style={[darkStyles.bold, {fontSize: 18}]}> {this.props.request.gasCost ? this.props.request.gasCost : null} ETH</Text>
          <Text style={{color: colors.grey74, fontSize: 16}}> ${this.props.request.ethSpotPrice && this.props.request.gasCost ? (this.props.request.ethSpotPrice * this.props.request.gasCost).toFixed(2) : null } USD</Text>
        </View>
        
        {
        this.props.request.canceledAt
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
            ? (!this.props.request.value || this.props.request.value === 0 || (this.props.balance && this.props.balance.gte(this.props.request.value))
          //  ? (props.balance >= props.request.value
            ? <View style={{backgroundColor: colors.white246}}>
              <PrimaryButton
                onPress={() => this.props.authorizeRequest(this.props.request)}
                style={{marginLeft: 30, marginRight: 30, marginTop: 0, marginBottom: 30}}>
                <Text> Approve Transaction </Text>
              </PrimaryButton>
            </View>
            : <View>
              <CardStateBox
                state={'error'}
                text={'Insufficient Funds.'}
              />
              <CancelButton onPress={() => this.props.cancelRequest(this.props.request)} style={{minHeight: 50, alignItems: 'center', justifyContent: 'center', flex: 0}}>
                <Text style={{color: colors.grey74}}>Reject</Text>
              </CancelButton>
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
    </View>)
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
  uportVerified: PropTypes.bool,
  validDestination: PropTypes.bool,
  cardTitle: PropTypes.string,
  authorizeRequest: PropTypes.func,
  cancelRequest: PropTypes.func
}

const mapStateToProps = (state) => {
  const request = currentRequest(state)
  const address = request && request.target || currentAddress(state)
  const client = clientProfile(state)
  const contact = destinationProfile(state, address) || client || {}
  const network = currentNetwork(state)
  const currentIdentity = toJs(publicUport(state))
  const uportVerified = request && request.client_id ? Object.keys(verifiedByUport).indexOf(request.client_id) > -1 : false
  const transactionMessage = statusMessage(state, 'tx')
  const networkSettings = networkSettingsForAddress(state, address) || {}
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
    currentIdentity,
    network,
    request,
    transactionMessage,
    uportVerified,
    validDestination: contact._validated,
    balance: networkSettings.balance || new BN(0),
    connections: connections(state) || [],
    cardTitle
  }
}

const mapDispatchToProps = (dispatch) => ({
  authorizeRequest: (activity) => dispatch(authorizeRequest(activity.id)),
  cancelRequest: (activity) => dispatch(cancelRequest(activity.id)),
  clearRequest: () => dispatch(clearRequest())
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(TransactionCard)
