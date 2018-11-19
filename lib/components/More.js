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
import { connections } from 'uPortMobile/lib/selectors/identities'
import { seedConfirmedSelector } from 'uPortMobile/lib/selectors/hdWallet'
import { isFullyHD } from 'uPortMobile/lib/selectors/chains'
// Components
import NavigatableScreen from 'uPortMobile/lib/components/shared/NavigatableScreen'
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

export class More extends NavigatableScreen {
  render () {
    return (
      <Menu>
        <MenuItem title='About' destination='settings.main' navigator={this.props.navigator} />
        <MenuItem title='Advanced' destination='uport.advanced' navigator={this.props.navigator} />
        {this.props.hasHDWallet && <MenuItem
          title='Account Recovery'
          danger={!this.props.seedConfirmed}
          value={this.props.seedConfirmed ? undefined : 'Account At Risk'}
          destination='backup.seedInstructions'
          navigator={this.props.navigator}
        />}
        {this.props.hasHDWallet && <MenuItem
          title='Account Back Up'
          destination='backup.dataInstructions'
          navigator={this.props.navigator}
        />}
        <MenuItem title='Try uPort' navigator={this.props.navigator} destination='advanced.try-uport' last />
      </Menu>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    connections: connections(state) || [],
    hasHDWallet: isFullyHD(state),
    seedConfirmed: seedConfirmedSelector(state)
  }
}
export default connect(mapStateToProps)(More)
