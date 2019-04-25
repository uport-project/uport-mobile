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

import { Container, Text, Banner, Icon, Button, Screen, Section, ListItem, IndicatorBar } from '@kancha'
import DisclosureRequestModel from './DisclosureRequestModel'

interface DisclosureCardProps {
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

/**
 * Dumb request component. Please DO NOT litter with conditional logic.
 * All business logic should live in the RequestModel
 */
export const DisclosureCard: React.FC<DisclosureCardProps> = props => {
  const requestModel = DisclosureRequestModel(props)
  return (
    <Screen
      footerNavComponent={
        requestModel && (
          <Container>
            <Text textAlign={'center'} type={Text.Types.SectionHeader}>
              {requestModel.statsMessage}
            </Text>
            <Container flexDirection={'row'} padding>
              <Container flex={1} paddingRight>
                <Button
                  depth={1}
                  buttonText={requestModel.cancelButton.text}
                  block={Button.Block.Clear}
                  type={Button.Types.Warning}
                  onPress={() => requestModel.cancelButton.action(props.requestId)}
                />
              </Container>
              <Container flex={2}>
                <Button
                  buttonText={requestModel.actionButton.text}
                  block={Button.Block.Filled}
                  type={Button.Types.Primary}
                  onPress={() =>
                    requestModel.actionButton.action(props.requestId, requestModel.actionButton.actionType)
                  }
                />
              </Container>
            </Container>
          </Container>
        )
      }
      config={Screen.Config.Scroll}
      type={Screen.Types.Secondary}
      statusBarHidden
    >
      {requestModel && (
        <Container>
          <Container viewStyle={{ position: 'absolute', zIndex: 10, top: 20, right: 20 }}>
            <Button
              iconButton
              noPadding
              icon={<Icon name={Icon.Names.close} font={'evil'} color={'#FFFFFF'} size={30} />}
              onPress={() => requestModel.cancelButton.action(props.requestId)}
            />
          </Container>
          <Banner
            httpsResolveStatus={'OKAY'}
            backgroundImage={props.client && props.client.bannerImage}
            avatar={props.client && props.client.avatar}
            requestor={props.client && props.client.name}
          />

          <IndicatorBar text={requestModel.title} />
          {requestModel.description && (
            <Container padding>
              <Text type={Text.Types.Body}>{requestModel.description}</Text>
            </Container>
          )}
          {requestModel.requestItems.length > 0 && (
            <Section noTopBorder noTopMargin>
              {requestModel.requestItems.map((item: any) => {
                return (
                  <ListItem key={item.key} title={item.type}>
                    {item.value}
                  </ListItem>
                )
              })}
            </Section>
          )}
        </Container>
      )}
    </Screen>
  )

  // return (
  //   <View style={{ flex: 0, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end' }}>
  //     <View style={{ flex: 0, justifyContent: 'center', alignItems: 'center' }}>
  //       {props.client && props.client.avatar ? (
  //         <Image resizeMode='cover' source={props.client.avatar} style={{ borderRadius: 3, height: 70, width: 70 }} />
  //       ) : null}
  //     </View>
  //     {showUrl && (
  //       <View style={styles.url}>
  //         <TouchableOpacity onPress={() => Linking.openURL(props.client.url)}>
  //           <Text style={{ color: 'white' }}>{props.client.url}</Text>
  //         </TouchableOpacity>
  //       </View>
  //     )}
  //     <InteractionStats stats={props.interactionStats} actionText='interacted' counterParty={props.client} />

  //     <View
  //       style={{
  //         flexDirection: 'column',
  //         alignItems: 'stretch',
  //         justifyContent: 'flex-end',
  //         flex: 0,
  //         backgroundColor: '#F6F5FE',
  //         paddingBottom: 20,
  //       }}
  //     >
  //       <View style={[styles.disclosureBar, { marginBottom: 0, paddingBottom: 10 }]}>
  //         <Text style={[styles.cardTitle, { textAlign: 'left' }]}>Login</Text>
  //         <TouchableOpacity
  //           onPress={() => props.cancelRequest(props.requestId)}
  //           style={{
  //             position: 'absolute',
  //             height: 44,
  //             width: 44,
  //             top: 16,
  //             right: 16,
  //             alignItems: 'center',
  //             justifyContent: 'center',
  //           }}
  //         >
  //           <EvilIcon size={30} name='close' color='rgba(155,155,155,1)' />
  //         </TouchableOpacity>
  //       </View>
  //       <View style={{ flex: 0, flexDirection: 'column' }}>
  //         {!!props.actType && (props.actType === 'none' || props.accountAuthorized === true) ? (
  //           <View style={styles.credentialsListContainer}>
  //             <Text style={[styles.smallText, { paddingLeft: 0, paddingTop: 12, textAlign: 'left' }]}>Profile</Text>
  //             <RequestItemList>
  //               {Object.keys(props.requested || {}).map((claim, i) => (
  //                 <RequestItem
  //                   key={i + claim}
  //                   type={claim.toUpperCase()}
  //                   value={typeof props.requested[claim] !== 'object' ? props.requested[claim] : null}
  //                 />
  //               ))}

  //               {props.pushPermissions ? (
  //                 <RequestItem
  //                   key='pushPermissions'
  //                   type='Push Notifications'
  //                   value={
  //                     props.snsRegistered
  //                       ? 'Allow'
  //                       : props.pushWorking
  //                       ? 'Registering'
  //                       : props.pushError || 'Not available'
  //                   }
  //                 />
  //               ) : null}

  //               {props.network ? (
  //                 <RequestItem key={'requestednetwork'} type='Network' value={props.networkName} />
  //               ) : null}

  //               {props.network || props.account ? (
  //                 <RequestItem
  //                   key={'accountaddress'}
  //                   type='Address'
  //                   value={
  //                     props.account ||
  //                     `New account will be created for ${
  //                       props.actType === 'segregated'
  //                         ? props.client.name || props.client.address.slice(0, 10)
  //                         : props.networkName
  //                     }`
  //                   }
  //                 />
  //               ) : null}
  //             </RequestItemList>
  //             {props.verified.length > 0 || props.missing.length > 0 ? (
  //               <View>
  //                 <Text style={[styles.smallText, { paddingLeft: 0, paddingTop: 12, textAlign: 'left' }]}>
  //                   Verifiable Credentials
  //                 </Text>
  //                 <RequestItemList>
  //                   {props.verified.map((vc, i) => (
  //                     <RequestItem
  //                       key={vc.iss + '-' + i}
  //                       type={vc.claimType}
  //                       value={vc.claim[vc.claimType]}
  //                       vc={vc}
  //                       navigator={props.navigator}
  //                     />
  //                   ))}
  //                   {props.missing.map((spec, i) => (
  //                     <RequestItem key={spec.type + '-' + i} type={spec.type} spec={spec} />
  //                   ))}
  //                 </RequestItemList>
  //               </View>
  //             ) : null}
  //           </View>
  //         ) : null}

  //         {props.createSubAccount ? <Status process='createSubAccount' /> : null}

  //         {props.error ? <Text style={styles.errorMessage}>{parseErrorMessage(props.error)}</Text> : null}

  //         {props.actType !== 'none' && props.account && props.accountAuthorized === false ? (
  //           <View style={{ marginTop: 20 }}>
  //             <Text style={styles.smallText}>Selected Account</Text>
  //             <AccountTileSmall
  //               accountProfile={props.client}
  //               balance={props.ethBalance}
  //               usdBalance={props.usdBalance}
  //             />
  //           </View>
  //         ) : null}

  //         {props.actType !== 'none' && props.account && props.accountAuthorized === false ? (
  //           <View style={styles.smallTouchableOpacity}>
  //             <TouchableOpacity onPress={() => props.authorizeAccount(props.requestId, 'new')}>
  //               <Text style={{ color: defaultTheme.colors.brand, fontSize: 12, lineHeight: 15 }}>
  //                 {' '}
  //                 Create new account{' '}
  //               </Text>
  //             </TouchableOpacity>
  //           </View>
  //         ) : null}

  //         {props.actType === 'none' || props.accountAuthorized === true ? (
  //           <PrimaryButton
  //             onPress={() => props.authorizeRequest(props.requestId)}
  //             disabled={props.missingRequired}
  //             style={{ marginLeft: 16, marginRight: 16, marginTop: 0, marginBottom: 30 }}
  //           >
  //             <Text style={{ fontSize: 18 }}> Share to Login </Text>
  //           </PrimaryButton>
  //         ) : null}

  //         {props.actType !== 'none' && !props.account && props.accountAuthorized === false ? (
  //           <PrimaryButton
  //             disabled={props.pushWorking || !!props.error}
  //             onPress={() => props.authorizeAccount(props.requestId, 'new')}
  //             style={{ marginLeft: 16, marginRight: 16, marginTop: 0, marginBottom: 30 }}
  //           >
  //             <Text style={{ fontSize: 18 }}> Create New Account </Text>
  //           </PrimaryButton>
  //         ) : null}

  //         {props.actType !== 'none' && props.account && props.interactionStats && props.accountAuthorized === false ? (
  //           <PrimaryButton
  //             onPress={() => props.authorizeAccount(props.requestId, 'existing')}
  //             style={{ marginLeft: 16, marginRight: 16, marginTop: 0, marginBottom: 30 }}
  //           >
  //             <Text style={{ fontSize: 18 }}> Login with Existing </Text>
  //           </PrimaryButton>
  //         ) : null}
  //       </View>
  //     </View>
  //   </View>
  // )
}

// DisclosureCard.propTypes = {
//   pushPermissions: PropTypes.bool,
//   network: PropTypes.string,
//   actType: PropTypes.string,
//   authorized: PropTypes.bool,
//   accountAuthorized: PropTypes.bool,
//   verified: PropTypes.array,
//   missing: PropTypes.array,
//   missingRequired: PropTypes.bool,
//   requested: PropTypes.object,
//   currentIdentity: PropTypes.object,
//   client: PropTypes.object,
//   authorizeRequest: PropTypes.func,
//   authorizeAccount: PropTypes.func,
//   cancelRequest: PropTypes.func,
//   clearRequest: PropTypes.func,
// }

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
  const pushWorking = working(state)
  const pushError = errorMessage(state)
  const createSubAccount = working(state)
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DisclosureCard)
