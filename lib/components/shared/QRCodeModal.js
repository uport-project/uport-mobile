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
import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import Modal from 'uPortMobile/lib/components/shared/Modal'
import QRCode from 'react-native-qrcode-svg'
import globalStyles, { onboardingStyles, textStyles } from 'uPortMobile/lib/styles/globalStyles'
export const windowWidth = Dimensions.get('window').width
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { Navigation } from 'react-native-navigation'

class QRCodeModal extends React.Component {
  render() {
    return (
      <Modal>
        <Text style={onboardingStyles.title}>{this.props.title}</Text>
        <QRCode value={this.props.url} size={windowWidth - 50} backgroundColor={'#333333'} color='white' />

        <View style={globalStyles.modalButtonRow}>
          <TouchableOpacity
            style={[globalStyles.modalButton]}
            onPress={() => Navigation.dismissModal(this.props.componentId)}>
            <Text style={[textStyles.p, textStyles.buttonLabel]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }
}

export default QRCodeModal
