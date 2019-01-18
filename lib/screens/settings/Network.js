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
import { networkSettings, gasPrice } from 'uPortMobile/lib/selectors/chains'
import { working } from 'uPortMobile/lib/selectors/processStatus'

// Components
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

// Utilities
// import { wei2eth } from 'uPortMobile/lib/helpers/conversions'
import { networksByName } from 'uPortMobile/lib/utilities/networks'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

class Network extends React.Component {

  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  render() {
    return (
      <Menu>
        <MenuItem title='Network' value={this.props.network} />
        <MenuItem title='Gas Price' value={this.props.gasPrice || 0} working={this.props.working} />
      </Menu>
    )
  }

}

const mapStateToProps = (state) => {
  const settings = networkSettings(state) || {}
  const networkDetails = networksByName[settings.network]
  return {
    network: networkDetails.name,
    gasPrice: (gasPrice(state) || 0).toString(),
    working: working(state, 'gasPrice')
  }
}

export default connect(mapStateToProps)(Network)
