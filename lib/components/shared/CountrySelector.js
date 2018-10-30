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
import { StyleSheet, View, Text, FlatList, TouchableHighlight } from 'react-native'
import globalStyles, { colors, font } from 'uPortMobile/lib/styles/globalStyles'
import Icon from 'react-native-vector-icons/Ionicons'

// Utilities
import {alphabetizedCountries} from 'uPortMobile/lib/utilities/countries'

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'flex-start',
    // alignItems: 'stretch',
    backgroundColor: colors.white
  },
  country: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.white246
  },
  name: {
    fontFamily: font,
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'left',
    borderBottomColor: colors.grey74,
    flex: 1
  }
})

export const Country = (props) => (
  <TouchableHighlight
    style={{alignSelf: 'stretch'}}
    onPress={() => props.onSelect(props.code)}
  >
    <View style={globalStyles.menuItem}>
      <Text style={globalStyles.menuItemText}>{props.name}</Text>
      { props.selected
      ? <Icon name='md-checkmark' style={{fontSize: 24, color: colors.grey74}} />
      : null }
    </View>
  </TouchableHighlight>
)

const CountrySelector = (props) => {
  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={alphabetizedCountries}
      keyExtractor={c => c.code}
      renderItem={({item}) => (
        <Country
          code={item.code}
          name={item.name}
          selected={props.selectedCountry === item.code}
          onSelect={props.onSelect}
        />
      )}
    />
  )
}

CountrySelector.propTypes = {
  selectedCountry: PropTypes.string,
  onSelect: PropTypes.func
}

export default CountrySelector
