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

export const Device = (props) => (
  <NavigatableScreen navigator={props.navigator}>
    <Menu>
      <MenuItem title='Device Address' value={abbr(props.deviceAddress)} href={`${props.explorerUrl}/address/${props.deviceAddress}`} />
      <MenuItem title='Device Gas' value={wei2eth(props.fuel || 0) + ' ETH'} working={props.workingFuel} />
      <MenuItem title='Device Nonce' value={props.nonce || 0} working={props.workingNonce} last />
    </Menu>
  </NavigatableScreen>
)

const mapStateToProps = (state) => {
  const settings = networkSettings(state) || {}
  const networkDetails = networksByName[settings.network]
  const explorerUrl = networkDetails && networkDetails.explorerUrl
  return {
    deviceAddress: settings.deviceAddress,
    fuel: settings.fuel,
    nonce: settings.nonce,
    explorerUrl,
    workingFuel: working(state, 'fuel'),
    workingNonce: working(state, 'nonce')
  }
}

export default connect(mapStateToProps)(Device)
