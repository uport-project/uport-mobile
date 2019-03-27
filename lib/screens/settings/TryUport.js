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
import { abbr } from 'uPortMobile/lib/utilities/string'
// Components
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

import { colors } from 'uPortMobile/lib/styles/globalStyles'

const DEMO_URL = 'https://demo.uport.me'
const DEVELOPER_URL = 'https://developer.uport.me'

class TryUport extends React.Component {

  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }
  
  render() {
    return (
      <Menu>
        <MenuItem title='Interactive Demo' value={abbr(DEMO_URL)} href={DEMO_URL} />
        <MenuItem title='Dev Tutorial' value={abbr(DEVELOPER_URL)} href={DEVELOPER_URL} last />
      </Menu>
    )
  }
}

export default TryUport
