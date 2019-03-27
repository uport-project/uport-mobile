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
// Frameworks
import React from 'react'
import PropTypes from 'prop-types'
import { View, Image } from 'react-native'

// Components
import Avatar from 'uPortMobile/lib/components/shared/Avatar'

const DataFlowHeader = (props) => (
  <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
    <Avatar source={props.sender} />
    <Image source={require('uPortMobile/assets/images/ForwardArrow.png')} style={{width: 26, height: 18, marginLeft: 24, marginRight: 24}} />
    <View>
      <Avatar source={props.recipient} />
      {props.verified
        ? <Image source={require('uPortMobile/assets/images/uport-verif.png')} style={{position: 'absolute', right: -12, height: 26, top: 18}} />
        : null
      }
    </View>
  </View>
)

DataFlowHeader.propTypes = {
  recipient: PropTypes.object,
  sender: PropTypes.object
}

export default DataFlowHeader
