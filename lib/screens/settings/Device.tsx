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

import * as React from 'react'
import { Screen, Section, ListItem, Theme, Strings } from '@kancha'
import { connect } from 'react-redux'

// Selectors
import { networkSettings } from 'uPortMobile/lib/selectors/chains'
import { working } from 'uPortMobile/lib/selectors/processStatus'

// Utilities
import { wei2eth } from 'uPortMobile/lib/helpers/conversions'
import { networksByName } from 'uPortMobile/lib/utilities/networks'

interface DeviceProps {
  deviceAddress: string
  fuel: number
  nonce: number
  explorerUrl: string
  workingFuel: boolean
  signerType: string
  txRelayAddress: string
  controllerAddress: string
}

class Device extends React.Component<DeviceProps> {
  static navigatorStyle = {
    ...Theme.navigation,
  }

  render() {
    return (
      <Screen>
        <Section>
          <ListItem
            accessoryRight={Strings.abbreviate(this.props.deviceAddress, 12)}
            externalLink={`${this.props.explorerUrl}/address/${
              this.props.deviceAddress
              }`}
          >
            Device Address
          </ListItem>
          <ListItem accessoryRight={wei2eth(this.props.fuel || 0) + ' ETH'}>
            Device Gas
          </ListItem>
          <ListItem accessoryRight={this.props.nonce || 0} last>
            Device Nonce
          </ListItem>
        </Section>
      </Screen>
    )
  }
}

const mapStateToProps = (state: any) => {
  const settings = networkSettings(state) || {}
  const networks: { [index: string]: any } = networksByName
  const networkDetails = networks[settings.network]
  const explorerUrl = networkDetails && networkDetails.explorerUrl
  return {
    deviceAddress: settings.deviceAddress,
    fuel: settings.fuel,
    nonce: settings.nonce,
    explorerUrl,
    workingFuel: working(state),
    signerType: settings.signerType,
    txRelayAddress: settings.txRelayAddress,
    controllerAddress: settings.controllerAddress,
  }
}

export default connect(mapStateToProps)(Device)
