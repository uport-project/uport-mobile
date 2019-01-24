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
import { FlatList, Alert } from 'react-native'
import { connect } from 'react-redux'

// selectors
import { seedAddresses, hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import { deviceAddress } from 'uPortMobile/lib/selectors/chains'

// Components
import NavigatableScreen from 'uPortMobile/lib/components/shared/NavigatableScreen'
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

export const SeedAddresses = (props) => (
  <NavigatableScreen navigator={props.navigator}>
    <FlatList
      data={props.addresses}
      renderItem={({item}) => (
        <MenuItem
          title={`${item} ${item === props.root ? 'R' : ''}${item === props.device ? 'D' : ''}`}
          onPress={() => props.debug && props.resetAddress(item)}
          />
      )}
      keyExtractor={item => item}
    />
  </NavigatableScreen>
)

const mapStateToProps = (state) => {
  return {
    debugFlag: state.flags && state.flags.debug === true,
    root: hdRootAddress(state),
    addresses: seedAddresses(state),
    device: deviceAddress(state)
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    resetAddress: (address) => {
      Alert.alert(`Delete Address?`, `${address}\nThis can not be undone!!!`,
        [
          { text: 'Delete', onPress: () => dispatch({type: 'RESET_ADDRESS', address}) },
          { text: 'Cancel', onPress: () => console.log('cancel') }
        ])
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SeedAddresses)
