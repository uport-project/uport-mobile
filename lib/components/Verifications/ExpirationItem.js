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
import { Text, View, StyleSheet } from 'react-native'
import moment from 'moment'

// Styles
import { colors, font, fontLight } from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  expirationDate: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.grey74,
    fontFamily: fontLight
  }
})
// Helpers
const ExpirationItem = (props) => {
  let expirationDate = props.d && props.d >= 1000000000000 ? moment.unix(Math.floor(props.d / 1000)) : moment.unix(props.d)
  return (
    <View>
      {expirationDate.isValid()
        ? <Text style={styles.expirationDate}>Exp: {props.testing ? props.d : (expirationDate.toDate()).toLocaleDateString()}</Text>
        : <Text style={styles.expirationDate}>Exp: No Expiration</Text>
      }
    </View>
  )
}

export default ExpirationItem
