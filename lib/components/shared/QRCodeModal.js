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
import {Dimensions, StyleSheet, View, Text, TouchableOpacity} from 'react-native'
import Modal from 'uPortMobile/lib/components/shared/Modal'
import QRCode from 'react-native-qrcode'
import globalStyles, { onboardingStyles, textStyles } from 'uPortMobile/lib/styles/globalStyles'
export const windowWidth = Dimensions.get('window').width

class QRCodeModal extends React.Component {

  render () {
    return (
      <Modal>
          <Text style={onboardingStyles.title}>{this.props.title}</Text>
          <QRCode
            value={this.props.url}
            size={windowWidth - 50}
            bgColor='black'
            fgColor='white'
            />

          <View style={globalStyles.modalButtonRow}>
            <TouchableOpacity 
              style={[globalStyles.modalButton]} 
              onPress={() => this.props.onClose()}
              >
              <Text style={[textStyles.p, textStyles.buttonLabel]}>Close</Text>
            </TouchableOpacity>
          </View>
      </Modal>
    )
  }
}

export default QRCodeModal
