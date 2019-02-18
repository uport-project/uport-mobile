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

// Components
import NavigatableScreen from 'uPortMobile/lib/components/shared/NavigatableScreen'
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'

import { shareStateDump } from 'uPortMobile/lib/actions/uportActions'

const Advanced = (props) => (
  <NavigatableScreen navigator={props.navigator}>
    <Menu>
      {props.debugFlag && <MenuItem title='Debug' navigator={props.navigator} destination='debug.main' />}
      {props.designSystemFlag && <MenuItem title='Design System'  navigator={props.navigator} destination='design.main' />}
      <MenuItem title='uPort ID' navigator={props.navigator} destination='advanced.uport' />
      <MenuItem title='KeyChain Addresses' navigator={props.navigator} destination='advanced.keychain' />
      <MenuItem title='Device' navigator={props.navigator} destination='advanced.device' />
      { props.hasHDWallet && <MenuItem title='Identity Hub Status' navigator={props.navigator} destination='advanced.hub' /> }
      <MenuItem title='System Messages' navigator={props.navigator} destination='advanced.status' />
      <MenuItem title='Network' navigator={props.navigator} destination='advanced.network'/>
      <MenuItem title='Dump State' onPress={props.shareStateDump} last />
    </Menu>
  </NavigatableScreen>
)

const mapStateToProps = (state) => {
  return {
    debugFlag: state.flags && state.flags.debug === true,
    hasHDWallet: !!hdRootAddress(state),
    designSystemFlag: state.flags && state.flags.designSystem === true,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    shareStateDump: () => { dispatch(shareStateDump()) }
  }
}

export const Base = Advanced

export default connect(mapStateToProps, mapDispatchToProps)(Advanced)
