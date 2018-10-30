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
import { View, Text, TouchableOpacity } from 'react-native'
import { windowWidth } from 'uPortMobile/lib/styles/globalStyles'

class CameraAuthDenied extends React.Component {
  render () {
    return (
      <View style={{flex: 1, width: windowWidth, backgroundColor: 'black'}}>
        <View style={{flex: 7, alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={{flex: 1}}>
            <Text />
          </View>
          <View style={{flex: 2}}>
            <Text style={{color: 'white', margin: 20, textAlign: 'center'}}>Camera Disabled</Text>
            <Text style={{color: 'white', margin: 20, textAlign: 'center'}}>To scan QR codes, go to your phone's settings to allow camera access</Text>
            <TouchableOpacity style={{padding: 10, justifyContent: 'center', alignItems: 'center'}} onPress={() => { this.props.navigator.pop({animated: true, animationType: 'slide-horizontal'}) }} >
              <Text style={{color: '#fff', fontSize: 18}}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

export default CameraAuthDenied
