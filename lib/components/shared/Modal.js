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
import {StyleSheet, View} from 'react-native'
import { colors, windowWidth } from 'uPortMobile/lib/styles/globalStyles'

class Modal extends React.Component {

  render () {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {this.props.children}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    marginLeft: 30,
    marginRight: 30,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 30,
    borderWidth: 0.2,
    flexDirection: 'column'
  },

})

export default Modal
