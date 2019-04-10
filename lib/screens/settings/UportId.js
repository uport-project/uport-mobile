/***
 *  Copyright (C) 2018 ConsenSys AG
 *
 *  This file is part of uPort Mobile App
 *  uPort Mobile App is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  uPort Mobile App is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  ERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ***/

import React from 'react'
import { Clipboard } from 'react-native'
import { connect } from 'react-redux'
import { Screen, Section, ListItem, Container, Theme } from '@kancha'

// Actions
import {
  resetIdentity,
  savePublicUport,
} from 'uPortMobile/lib/actions/uportActions'

// Selectors
import {
  currentAddress,
  ipfsProfile,
} from 'uPortMobile/lib/selectors/identities'
import { networkSettings } from 'uPortMobile/lib/selectors/chains'

import {
  OnboardingButton,
  DangerButton,
} from 'uPortMobile/lib/components/shared/Button'

import { windowHeight } from 'uPortMobile/lib/styles/globalStyles'
import { networksByName } from 'uPortMobile/lib/utilities/networks'

class uPortID extends React.Component {
  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: Theme.colors.primary.brand,
    navBarButtonColor: Theme.colors.primary.background,
    navBarTextColor: Theme.colors.primary.background,
  }

  render() {
    return (
      <Screen>
        <Section>
          <ListItem
            hideForwardArrow
            contentRight={this.props.did}
            onPress={() => Clipboard.setString(this.props.address)}
          >
            DID
          </ListItem>
          <ListItem
            last={!this.props.legacy}
            hideForwardArrow
            contentRight={this.props.hexaddress}
            externalLink={`${this.props.explorerUrl}/address/${
              this.props.hexaddress
            }`}
          >
            Address
          </ListItem>
          {this.props.legacy && (
            <ListItem
              last={!this.props.ipfsProfile}
              hideForwardArrow
              contentRight={this.props.address}
              onPress={() => Clipboard.setString(this.props.address)}
            >
              MNID
            </ListItem>
          )}
          {this.props.ipfsProfile && (
            <ListItem
              last
              hideForwardArrow
              contentRight={this.props.ipfsProfile}
              externalLink={`https://cloudflare-ipfs.com/ipfs/${
                this.props.ipfsProfile
              }`}
            >
              IPFS Profile
            </ListItem>
          )}
        </Section>
        <Container flex={0} h={windowHeight} justifyContent={'flex-end'}>
          {this.props.ipfsProfile && (
            <OnboardingButton
              onPress={() => this.props.savePublicUport(this.props.address)}
            >
              Refresh Profile
            </OnboardingButton>
          )}
          <DangerButton onPress={this.props.resetIdentity}>
            Reset Identity
          </DangerButton>
        </Container>
      </Screen>
    )
  }
}

const mapStateToProps = state => {
  const settings = networkSettings(state) || {}
  const networkDetails = networksByName[settings.network]
  const explorerUrl = networkDetails && networkDetails.explorerUrl
  const address = currentAddress(state)
  const didParts = address && address.match(/^did:ethr:(0x[0-9a-fA-F]{40})/)
  const did = didParts ? address : `did:uport:${address}`
  const hexaddress = settings.hexaddress || (didParts && didParts[1])
  return {
    address,
    legacy: !didParts,
    did,
    explorerUrl,
    hexaddress,
    ipfsProfile: ipfsProfile(state, address),
  }
}

export const mapDispatchToProps = dispatch => {
  return {
    resetIdentity: () => {
      dispatch(resetIdentity())
    },
    savePublicUport: address => {
      dispatch(savePublicUport(address))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(uPortID)
