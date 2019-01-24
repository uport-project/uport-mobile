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
import { FlatList, View, Text, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

// Selectors
import { messageHistory } from 'uPortMobile/lib/selectors/processStatus'

// Components
import NavigatableScreen from 'uPortMobile/lib/components/shared/NavigatableScreen'
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

export const StatusList = (props) => (
  <FlatList
    style={{backgroundColor: '#EAEAEA'}}
    data={props.history}
    renderItem={({item, index}) => (
      <View style={{backgroundColor: '#FFFFFF', borderBottomColor: '#EAEAEA', borderBottomWidth: StyleSheet.hairlineWidth, borderLeftWidth: item.error ? 5 : 0, borderLeftColor: '#E69C95'}}>
        <View style={{paddingLeft: 15, paddingTop: 15}}><Text style={{fontWeight: 'bold', fontSize: 12, color: item.error && '#E69C95'}}>{item.section.toUpperCase()}</Text></View>
        <View style={{padding: 15}}><Text style={{lineHeight: 20, color: item.error && '#E69C95'}}>{item.error || item.message}</Text></View>
      </View>
    )}
    keyExtractor={item => `msg-${item.section}-${item.type}-${item._time}`}
  />
)
export const StatusMessages = (props) => (
  <NavigatableScreen navigator={props.navigator}>
    <StatusList history={props.history} />
  </NavigatableScreen>
)

const mapStateToProps = (state) => {
  return {
    history: messageHistory(state)
  }
}

export const ConnectedStatusList = connect(mapStateToProps)(StatusList)

export default connect(mapStateToProps)(StatusMessages)
