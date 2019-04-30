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

import {
  ListView
} from 'react-native'

import KeyboardAwareBase from './KeyboardAwareBase'

export default class KeyboardAwareListView extends KeyboardAwareBase {
  render () {
    const initialOpacity = this.props.startScrolledToBottom ? 0 : 1
    return (
      <ListView {...this.props} {...this.style}
        opacity={initialOpacity}
        contentInset={{bottom: this.state.keyboardHeight}}
        ref={(r) => {
          this._keyboardAwareView = r
        }}
        onLayout={(layoutEvent) => {
          this._onKeyboardAwareViewLayout(layoutEvent.nativeEvent.layout)
        }}
        onScroll={(event) => {
          this._onKeyboardAwareViewScroll(event.nativeEvent.contentOffset)
          if (this.props.onScroll) {
            this.props.onScroll(event)
          }
        }}
        onContentSizeChange={() => {
          this._updateKeyboardAwareViewContentSize()
        }}
        scrollEventThrottle={200}
      />
    )
  }
}

KeyboardAwareListView.propTypes = {
  onScroll: PropTypes.func
}

KeyboardAwareListView.defaultProps = {
  ...KeyboardAwareBase.defaultProps
}
