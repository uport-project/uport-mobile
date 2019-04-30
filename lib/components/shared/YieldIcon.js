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

const YieldIcon = (props) => (
  <View style={props.style}>
    <Svg
      width={props.width}
      height={props.height}
      viewBox='0 0 90 82'
      >
      <G
        fillRule='nonzero'
        fill={props.fillColor || colors.purple}
        >
        <Path d='M81.2,81.1 L8.8,81.1 C5.6,81.1 2.8,79.5 1.2,76.7 C-0.4,74 -0.4,70.7 1.2,68 L37.4,5.2 C39,2.5 41.8,0.8 45,0.8 L45,0.8 C48.2,0.8 51,2.4 52.6,5.2 L88.8,68 C90.4,70.7 90.4,74 88.8,76.7 C87.2,79.5 84.4,81.1 81.2,81.1 Z M6.9,71.3 C6.3,72.3 6.7,73.2 6.9,73.5 C7.1,73.8 7.7,74.6 8.8,74.6 L81.3,74.6 C82.4,74.6 83,73.8 83.2,73.5 C83.4,73.2 83.8,72.3 83.2,71.3 L46.9,8.5 C46.3,7.5 45.4,7.4 45,7.4 C44.6,7.4 43.7,7.5 43.1,8.5 L6.9,71.3 Z' />
        <Path d='M45,57.3 C43.2,57.3 42,55.8 42,54 L42,26.5 C42,24.7 43.2,23.2 45,23.2 C46.8,23.2 48,24.7 48,26.5 L48,54 C48,55.8 46.8,57.3 45,57.3 Z' />
        <Circle cx='45' cy='65.8' r='3.9' />
      </G>
    </Svg>
  </View>
)

YieldIcon.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
}

export default YieldIcon
