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
import { View, Clipboard } from 'react-native'
// Actions
import { resetIdentity, savePublicUport } from 'uPortMobile/lib/actions/uportActions'

// Selectors
import { currentAddress, ipfsProfile } from 'uPortMobile/lib/selectors/identities'
import { networkSettings } from 'uPortMobile/lib/selectors/chains'

// Components
import NavigatableScreen from 'uPortMobile/lib/components/shared/NavigatableScreen'
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'
import { OnboardingButton, DangerButton } from 'uPortMobile/lib/components/shared/Button'

import { windowHeight } from 'uPortMobile/lib/styles/globalStyles'
import { networksByName } from 'uPortMobile/lib/utilities/networks'
import { abbr } from 'uPortMobile/lib/utilities/string'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

class uPortID extends React.Component {

  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  render() {
    return (
      <Menu>
        <MenuItem title='DID' value={abbr(this.props.did)} onPress={() => Clipboard.setString(this.props.address)} />
        <MenuItem title='Address' value={abbr(this.props.hexaddress)} href={`${this.props.explorerUrl}/address/${this.props.hexaddress}`} />
        { this.props.legacy
        ? <MenuItem title='MNID' value={abbr(this.props.address)} onPress={() => Clipboard.setString(this.props.address)} />
        : null }
        { this.props.ipfsProfile
        ? <MenuItem title='IPFS Profile' value={abbr(this.props.ipfsProfile)} href={`https://ipfs.infura.io/ipfs/${this.props.ipfsProfile}`} last />
        : null }

        <View style={{flex: 0, height: windowHeight, justifyContent: 'flex-end'}}>
          { this.props.ipfsProfile
          ? <OnboardingButton onPress={() => this.props.savePublicUport(this.props.address)}>
            Refresh Profile
          </OnboardingButton>
          : null }
          <DangerButton onPress={this.props.resetIdentity}>
            Reset Identity
          </DangerButton>
        </View>
      </Menu>
    )
  }
}

const mapStateToProps = (state) => {
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
    ipfsProfile: ipfsProfile(state, address)
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    resetIdentity: () => {
      dispatch(resetIdentity())
    },
    savePublicUport: (address) => {
      dispatch(savePublicUport(address))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(uPortID)
