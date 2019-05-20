import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { ActivityIndicator } from 'react-native'

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
import disclosureRequestModel, { DisclosureRequestModelType, VerifiableClaimType, ClaimSpecType } from './DisclosureRequestModel'
import { Container, Theme, Text } from '@kancha'
import { VerifiableClaimsSpec, UserInfo } from 'uPortMobile/lib/types/Credentials'
export interface DisclosureRequestContainerProps {
  componentId: string
}

interface StateFromProps {
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
  requested: UserInfo
  verified: VerifiableClaimType[]
  missing: ClaimSpecType[]
  missingRequired: boolean
  uportVerified: boolean
  interactionStats: any
  snsRegistered: boolean
  ethBalance: number
  usdBalance: number
}

interface DispatchFromProps {
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
  const requestedProfileClaimsTyped: (state: any, requested: any) => UserInfo = requestedOwnClaims
  const requestedVerifiableClaimsTyped: (state: any, request: any) => VerifiableClaimType[] = requestedVerifiableClaims
  const missingClaimsTypes: (state: any, verified: boolean) => ClaimSpecType[] = missingClaims
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
  const requested = requestedProfileClaimsTyped(state, request)
  const verified = request ? requestedVerifiableClaimsTyped(state, request) : []
  const missing = request ? missingClaimsTypes(state, request) : []
  const missingRequired = !!missing.find(spec => !!(spec && spec.essential))

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
  authorizeRequest: (activity: string) => {
    dispatch(authorizeRequest(activity))
  },
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
    return requestModelProps && requestModelProps.requestId ? (
      <WrappedComponent {...requestModelProps} />
    ) : (
      <Container alignItems={'center'} justifyContent={'center'} flex={1}>
        <ActivityIndicator size="large" color={Theme.colors.primary.accessories} />
        <Container padding>
          <Text type={Text.Types.Body}>Loading request</Text>
        </Container>
      </Container>
    )
  }

  return connect<StateFromProps, DispatchFromProps, void>(
    mapStateToProps,
    mapDispatchToProps,
  )(WithDisclosureRequestCardModel)
}

export default withDisclosureRequestCardModel
