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
import { Text, TextInput, View, TouchableHighlight, StyleSheet } from 'react-native'
import Avatar from '../shared/Avatar'
import globalStyles, { textStyles, colors } from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  nameStyle: {
    flex: 1,
    marginLeft: 24,
    textAlign: 'left'
  },
  input: {
    height: 22,
    padding: 0
  }
})
const Editor = (props) => (
  <View style={{flex: 1, backgroundColor: colors.white}}>
    <View style={{
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: colors.white,
      padding: 24
    }}>
      <TouchableHighlight onPress={() => props.photoSelection()} underlayColor='rgba(0,0,0,0.0)'>
        <View>
          { props.avatar
          ? <Avatar size={96} source={props.avatar} text='tap to edit' initialsStyle={{fontSize: 36}} borderWidth={2} borderColor={'#9B9B9B'}>
            <View style={{position: 'absolute', flex: 1, width: 98, height: 98, borderRadius: 5, justifyContent: 'center', backgroundColor: colors.translucentGrey, alignItems: 'center'}}>
              <Text style={{fontSize: 16, flex: 0, color: '#000000'}}>
                Edit
              </Text>
            </View>
          </Avatar>
          : <View style={[globalStyles.emptyAvatar, {width: 100, height: 100}]}>
            <Text style={[textStyles.p, {color: colors.lightPurple}]}>Tap to Add</Text>
          </View>}
        </View>
      </TouchableHighlight>
      <TextInput
        underlineColorAndroid='rgba(0,0,0,0)'
        style={[textStyles.h1, styles.nameStyle]}
        placeholder='Name'
        autoCapitalize='words'
        value={props.name}
        onChangeText={(value) => props.handleChange({name: value})} />
    </View>
    <View style={globalStyles.infoList}>
      <View style={[globalStyles.infoListItem]}>
        <Text style={[globalStyles.infoType]}>Email</Text>
        <TextInput
          id='email'
          underlineColorAndroid='rgba(0,0,0,0)'
          keyboardType='email-address'
          style={[globalStyles.infoValue, styles.input]}
          autoCapitalize='none'
          placeholder={'Enter Email'}
          value={props.email}
          onChangeText={(value) => props.handleChange({email: value})}
        />
      </View>
      <View style={globalStyles.infoListItem}>
        <Text style={[globalStyles.infoType]}>Location</Text>
        <TextInput
          underlineColorAndroid='rgba(0,0,0,0)'
          style={[globalStyles.infoValue, styles.input]}
          placeholder={'Enter Location'}
          autoCapitalize='words'
          value={props.country}
          onChangeText={(value) => props.handleChange({country: value})}
        />
      </View>
      <View style={globalStyles.infoListItem}>
        <Text style={[globalStyles.infoType]}>Phone</Text>
        <TextInput
          underlineColorAndroid='rgba(0,0,0,0)'
          keyboardType='phone-pad'
          style={[globalStyles.infoValue, styles.input]}
          placeholder={'Enter Phone'}
          autoCapitalize='none'
          value={props.phone}
          onChangeText={(value) => props.handleChange({phone: value})}
        />
      </View>
    </View>
  </View>
)

export default Editor
