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
import PropTypes from 'prop-types'
import Svg, {Circle, G, Path} from 'react-native-svg'
import { View } from 'react-native'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

const SuccessIcon = (props) => (
  <View style={props.style}>
    <Svg
      width={props.width}
      height={props.height}
      viewBox='-3 -3 103 103'
      >
      <G
        fillRule='evenodd'
        fill='none'
        stroke='#FFF'
        >
        <Path strokeWidth='6' d='M29 48.2398436L41.8334426 61 71 32' />
        <Circle cx='47' cy='47' r='47' strokeWidth='6' />
      </G>
    </Svg>
  </View>
)

SuccessIcon.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
}

export default SuccessIcon
