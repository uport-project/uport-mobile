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
import dateChecker from 'uPortMobile/lib/utilities/dateChecker'

// Styles
import { colors, fontLight } from 'uPortMobile/lib/styles/globalStyles'
import { JWT_MS_CUTOFF } from 'uPortMobile/lib/selectors/attestations'

const styles = StyleSheet.create({
  expirationDate: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.grey74,
    fontFamily: fontLight,
  },
})
// Helpers
const ExpirationItem = props => {
  const formattedDate = dateChecker(props.d)
  return (
    <View>
      {!!props.d ? (
        <Text style={styles.expirationDate}>Exp: {formattedDate}</Text>
      ) : (
        <Text style={styles.expirationDate}>Exp: No Expiration</Text>
      )}
    </View>
  )
}

export default ExpirationItem
