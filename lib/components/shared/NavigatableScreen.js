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
import {colors, font} from 'uPortMobile/lib/styles/globalStyles'
import { backIconGetter } from 'uPortMobile/lib/utilities/navButtonGetters'

export default class NavigatableScreen extends React.Component {

  constructor (props) {
    super()
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    props.navigator.setStyle({
      navBarNoBorder: true,
      navBarTextColor: colors.grey74,
      navBarButtonColor: colors.purple,
      navBarFontSize: 18,
      navBarFontFamily: font,
      navBarBackgroundColor: colors.white246
    })
  }

  componentDidMount () {
    backIconGetter(this.props.navigator)
  }
  onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'back') { // this is the same id field from the static navigatorButtons definition
        this.props.navigator.pop({
        })
      }
    }
  }
  render () {
    return this.props.children
  }
}
