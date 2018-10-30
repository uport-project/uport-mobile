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
import { FlatList } from 'react-native'
import { connect } from 'react-redux'

// Selectors
import { messageHistory } from 'uPortMobile/lib/selectors/processStatus'

// Components
import NavigatableScreen from 'uPortMobile/lib/components/shared/NavigatableScreen'
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

export const StatusMessages = (props) => (
  <NavigatableScreen navigator={props.navigator}>
    <FlatList
      data={props.history}
      renderItem={({item}) => (
        <MenuItem
          title={item.section}
          danger={!!item.error}
          value={item.error || item.message}
          />
      )}
      keyExtractor={item => `msg-${item.section}-${item.type}-${item._time}`}
    />
  </NavigatableScreen>
)

const mapStateToProps = (state) => {
  return {
    history: messageHistory(state)
  }
}

export default connect(mapStateToProps)(StatusMessages)
