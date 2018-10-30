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
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, Linking, Platform} from 'react-native'

class CameraAuthLightbox extends React.Component {
  render () {
    return (
      <View style={styles.container}>
        <View style={{flex: 6, alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={{flex: 2}}>
            <Text>{this.props.title}</Text>
          </View>
          <View style={{flex: 2}}>
            <Text style={styles.content}>{this.props.content}</Text>
          </View>
        </View>

        <View style={{flex: 3, flexDirection: 'row'}}>
          <View style={{flexDirection: 'row', flex: 4, flexGrow: 4}}>
            <View style={{flex: 1}}>
              { Platform.OS === 'ios'
                ? <View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      title={'Update'}
                      style={{padding: 8}}
                      onPress={() => Linking.openURL('app-settings:')}
                      color='rgba(0,0,0,0)' >
                      <Text>Update</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.buttonContainer, {marginTop: 10}]}>
                    <TouchableOpacity
                      title={'Close'}
                      style={{padding: 8}}
                      onPress={() => this.props.onClose()}
                      color='rgba(0,0,0,0)' >
                      <Text>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                : <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    title={'Close'}
                    onPress={() => this.props.onClose()}
                    color='rgba(0,0,0,0)' >
                    <Text>Close</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    maxWidth: Dimensions.get('window').width * 0.8,
    maxHeight: Dimensions.get('window').height * 0.4,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 16,
    borderWidth: 0.2,
    flexDirection: 'column',
    flex: 1
  },
  buttonContainer: {
    borderWidth: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 5
  },
  title: {
    fontSize: 17,
  },
  content: {

  }
})

export default CameraAuthLightbox
