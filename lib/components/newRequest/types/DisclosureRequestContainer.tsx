import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'

// Selectors
import { clientProfile, currentRequest, externalProfile } from 'uPortMobile/lib/selectors/requests'
import { publicUport, currentAddress, interactionStats, subAccounts } from 'uPortMobile/lib/selectors/identities'
import { requestedOwnClaims, requestedVerifiableClaims, missingClaims } from 'uPortMobile/lib/selectors/attestations'
import { working, errorMessage } from 'uPortMobile/lib/selectors/processStatus'
import { endpointArn } from 'uPortMobile/lib/selectors/snsRegistrationStatus'
import { networkSettingsForAddress } from 'uPortMobile/lib/selectors/chains'

import Mori from 'mori'
import verifiedByUport from 'uPortMobile/lib/utilities/verifiedByUport'
import { networks } from 'uPortMobile/lib/utilities/networks'
import { formatWeiAsEth } from 'uPortMobile/lib/helpers/conversions'

// Actions
import { authorizeRequest, cancelRequest, clearRequest, authorizeAccount } from 'uPortMobile/lib/actions/requestActions'

// Data model
import disclosureRequestModel, { DisclosureRequestModelType } from './DisclosureRequestModel'

import { Container } from '@kancha'

export interface DisclosureRequestContainerProps {
  componentId: string
  currentIdentity: string
  client: any
  account: any
  accountProfile: any
  network: string
  networkName: string
  actType: string
  accountAuthorized: boolean
  requestId: string
  error: any
  pushPermissions: boolean
  authorized: boolean
  pushWorking: boolean
  createSubAccount: boolean
  pushError: boolean
  requested: any
  verified: boolean
  missing: boolean
  missingRequired: boolean
  uportVerified: boolean
  interactionStats: any
  snsRegistered: boolean
  ethBalance: number
  usdBalance: number

  clearRequest: () => void
  authorizeAccount: (activity: string, type: string) => void
  authorizeRequest: (activity: string) => void
  cancelRequest: (activity: string) => void
  accountProfileLookup: (clientId: string) => void
}

const mapStateToProps = (state: any) => {
  const NETWORKS: { [index: string]: any } = networks
  const VERIFIED_BY_UPORT: { [index: string]: any } = verifiedByUport

  /**
   * Cast selectors to accept additional argument
   */
  const requestedProfileClaimsTyped: (state: any, requested: any) => any = requestedOwnClaims
  const requestedVerifiableClaimsTyped: (state: any, request: any) => any = requestedVerifiableClaims
  const missingClaimsTypes: (state: any, verified: boolean) => any = missingClaims
  const networkSettingsForAddressTyped: (state: any, account: any) => any = networkSettingsForAddress
  const workingTyped: (state: any, action: string) => any = working
  const pushErrorTyped: (state: any, action: string) => any = errorMessage

  const request = currentRequest(state) || {}
  const account = request.account
  const accountProfile = request.client_id ? Mori.toJs(externalProfile(state, request.client_id)) : null // Mori
  const network = NETWORKS[request.network] || { network_id: request.network, name: request.network }
  const networkName = network.name
  const client = clientProfile(state)
  const currentIdentity = Mori.toJs(publicUport(state)) // Mori
  const requested = requestedProfileClaimsTyped(state, request && request.requested)
  const verified =
    request && request.verified ? requestedVerifiableClaimsTyped(state, request && request.requested) : []
  const missing = request && request.verified ? missingClaimsTypes(state, request.verified) : []
  const missingRequired = !!missing.find((spec: any) => spec.essential)
  const uportVerified = request && request.client_id ? VERIFIED_BY_UPORT[request.client_id] : false
  const pushWorking = workingTyped(state, 'push')
  const pushError = pushErrorTyped(state, 'push')
  const createSubAccount = workingTyped(state, 'createSubAccount')
  const networkSettings = networkSettingsForAddressTyped(state, account) || {}
  const ethBalance =
    networkSettings.balance && networkSettings.balance.ethBalance
      ? formatWeiAsEth(networkSettings.balance.ethBalance)
      : 0
  const usdBalance =
    networkSettings.balance && networkSettings.balance.usdBalance ? networkSettings.balance.usdBalance : 0

  let stats
  let shareStats
  if (request) {
    stats = Mori.toJs(Mori.get(interactionStats(state), request.client_id)) || 0
    shareStats = { shared: stats.share || 0 }
  }
  return {
    currentIdentity,
    client,
    account,
    accountProfile,
    network: request.network,
    networkName,
    actType: request.actType,
    accountAuthorized: request.accountAuthorized || false,
    requestId: request.id,
    error: (request || {}).error,
    pushPermissions: !!request.pushPermissions,
    authorized: !!request.authorizedAt,
    pushWorking,
    createSubAccount,
    pushError,
    requested,
    verified,
    missing,
    missingRequired,
    uportVerified,
    interactionStats: shareStats,
    snsRegistered: !!endpointArn(state),
    ethBalance,
    usdBalance,
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  clearRequest: () => {
    dispatch(clearRequest())
  },
  authorizeAccount: (activity: string, type: string) => dispatch(authorizeAccount(activity, type)),
  authorizeRequest: (activity: string) => dispatch(authorizeRequest(activity)),
  cancelRequest: (activity: string) => dispatch(cancelRequest(activity)),
  accountProfileLookup: (clientId: string) => Mori.toJs(dispatch(externalProfile(clientId))),
})

/**
 * High order component that builds a simple data model based on redux
 */
const withDisclosureRequestCardModel = <P extends object>(
  WrappedComponent: React.ComponentType<DisclosureRequestModelType>,
) => {
  const WithDisclosureRequestCardModel: React.FC<DisclosureRequestContainerProps> = props => {
    const requestModelProps = disclosureRequestModel(props)
    return requestModelProps ? <WrappedComponent {...requestModelProps} /> : <Container />
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(WithDisclosureRequestCardModel)
}

export default withDisclosureRequestCardModel
