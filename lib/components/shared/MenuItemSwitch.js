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
import { View, Text, Switch } from 'react-native'
import { defaultTheme } from 'uPortMobile/lib/styles'

const MenuItemSwitch = (props, context) => {
  const { styles } = context.theme ? context.theme : defaultTheme
  return (
  <View style={styles.menuItem}>
    <Text style={styles.menuItemLabel}>{props.title}</Text>
    <Switch
      disabled={props.disabled}
      value={props.value}
      onValueChange={props.onValueChange}
      />
  </View>
)}

MenuItemSwitch.propTypes = {
  value: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

MenuItemSwitch.contextTypes = {
  theme: PropTypes.object
}

MenuItemSwitch.defaultProps = {
  disabled: false
}

export default MenuItemSwitch
