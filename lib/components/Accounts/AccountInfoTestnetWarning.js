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
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native'
import YieldIcon from 'uPortMobile/lib/components/shared/YieldIcon'
import globalStyles, { onboardingStyles, textStyles, colors } from 'uPortMobile/lib/styles/globalStyles'
import Modal from 'uPortMobile/lib/components/shared/Modal'

class AccountInfoTestnetWarning extends React.Component {

  render () {
    return (
      <Modal>
        <View style={{padding: 20, paddingBottom: 10, alignItems: 'center'}}>
          <YieldIcon width={34} height={31} fillColor={colors.orange} style={styles.icon} />
          <Text style={onboardingStyles.title}>Warning</Text>
        </View>
        <Text style={[textStyles.p]}>This account is on a test network. Do not send real Ether or tokens to this address. You will lose them. </Text>
        <View style={globalStyles.modalButtonRow}>
          <TouchableOpacity
            style={[globalStyles.modalButton, globalStyles.modalbuttonFirst]}
            onPress={() => { this.props.onClose() }}>
            <Text style={[textStyles.p, textStyles.buttonLabel]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.modalButton}
            onPress={() => { this.props.onCopy() }}>
            <Text style={[textStyles.p, textStyles.buttonLabel]}>Copy</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({

  icon: {
    marginBottom: 10
  }
})

export default AccountInfoTestnetWarning
