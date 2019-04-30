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
import {StyleSheet, View, Text, Dimensions, TouchableHighlight} from 'react-native'
import { colors, font, textStyles } from 'uPortMobile/lib/styles/globalStyles'
import Modal from 'uPortMobile/lib/components/shared/Modal'
class DeleteLightbox extends React.Component {

  render () {
    return (
      <Modal>
        <Text style={textStyles.h2}>{this.props.title}</Text>
        <Text style={textStyles.p}>{this.props.content}</Text>

        <View style={{flexDirection: 'row', margin: 10, marginTop: 24}}>
          <View style={styles.closeButton}>
            <TouchableHighlight
              title={'Close'}
              onPress={() => this.props.onClose()}
              color='rgba(0,0,0,0)' >
              <Text style={{fontFamily: font, color: colors.grey74}}> Cancel</Text>
            </TouchableHighlight>
          </View>
          <View style={styles.deleteButton}>
            <TouchableHighlight
              title={'Delete'}
              onPress={() => this.props.onDelete()}
              color='rgba(0,0,0,0)'>
              <Text style={{fontFamily: font, color: 'red'}}> Delete</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  closeButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey74,
    borderRadius: 5,
    padding: 10,
    marginRight: 5
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 5,
    padding: 10,
    marginLeft: 5
  }
})

export default DeleteLightbox
