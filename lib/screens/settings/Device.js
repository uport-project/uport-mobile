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
import { Screen, Section, ListItem } from '@kancha'
import { connect } from 'react-redux'

// Selectors
import { networkSettings } from 'uPortMobile/lib/selectors/chains'
import { working } from 'uPortMobile/lib/selectors/processStatus'

// Components
import NavigatableScreen from 'uPortMobile/lib/components/shared/NavigatableScreen'
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

// Utilities
import { wei2eth } from 'uPortMobile/lib/helpers/conversions'
import { networksByName } from 'uPortMobile/lib/utilities/networks'
import { abbr } from 'uPortMobile/lib/utilities/string'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

class Device extends React.Component {
  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  render() {
    return (
      <Screen>
        <Section>
          <ListItem
            externalLink={`${this.props.explorerUrl}/address/${
              this.props.deviceAddress
            }`}
            contentRight={this.props.deviceAddress}
          >
            Device Address
          </ListItem>
        </Section>
      </Screen>
    )
  }

  rendeOld() {
    return (
      <Menu>
        <MenuItem
          title='Device Address'
          value={abbr(this.props.deviceAddress)}
          href={`${this.props.explorerUrl}/address/${this.props.deviceAddress}`}
        />
        <MenuItem
          title='Device Gas'
          value={wei2eth(this.props.fuel || 0) + ' ETH'}
          working={this.props.workingFuel}
        />
        <MenuItem
          title='Device Nonce'
          value={this.props.nonce || 0}
          working={this.props.workingNonce}
          last
        />
      </Menu>
    )
  }
}

const mapStateToProps = state => {
  const settings = networkSettings(state) || {}

  console.log(settings)

  const networkDetails = networksByName[settings.network]
  const explorerUrl = networkDetails && networkDetails.explorerUrl
  return {
    deviceAddress: settings.deviceAddress,
    fuel: settings.fuel,
    nonce: settings.nonce,
    explorerUrl,
    workingFuel: working(state, 'fuel'),
    workingNonce: working(state, 'nonce'),
    signerType: settings.signerType,
    txRelayAddress: settings.txRelayAddress,
    controllerAddress: settings.controllerAddress,
  }
}

export default connect(mapStateToProps)(Device)
