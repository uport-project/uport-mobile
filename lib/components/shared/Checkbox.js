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
import { TouchableOpacity, View } from 'react-native'
import { Text } from '../shared'

import { defaultTheme } from 'uPortMobile/lib/styles'

const Checkbox = (props, context) => {
  const { styles, colors } = context.theme ? context.theme : defaultTheme
  return (
    <View style={styles.checkBoxWrapper}>      
      <View style={styles.row}>
        <TouchableOpacity onPress={props.onPress}>
          <View style={[styles.checkBox, props.checked && styles.checkBoxChecked]} />
        </TouchableOpacity> 
        <Text checkBoxLabel>{props.labelText}</Text>
      </View>
    </View>
  )
}

Checkbox.contextTypes = {
  theme: PropTypes.object
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onPress: PropTypes.func,
  labelText: PropTypes.string,
}

Checkbox.defaultProps = {
  checked: false
}

export default Checkbox
