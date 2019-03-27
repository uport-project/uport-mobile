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
import { Text, View, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { colors, font } from 'uPortMobile/lib/styles/globalStyles'
import { Button } from 'uPortMobile/lib/components/shared/Button'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

const InformationNotification = (props) => {
  const handleCta = () => {
    Linking.openURL(props.activity.ctaUrl)
  }
  const handleCancel = () => {
    props.cancel(props.activity)
  }

  const client = props.issuer(props.activity.client_id)

  return (
    <View style={styles.notificationContainer}>
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Avatar source={client} size={44} borderWidth={4} borderColor={colors.white} />
          <Text style={styles.clientName}>
            {client.name}
          </Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <EvilIcon size={24} name='close' color='rgba(155,155,155,1)'/>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardTitle}>
            {props.activity.title}
          </Text>
        <Text style={styles.cardBody}>
            {props.activity.body}
        </Text>
        <Button onPress={handleCta} style={{borderColor: colors.brand, borderWidth: 1}}>
          {props.activity.ctaTitle}
          <EvilIcon name='external-link' size={26} color={colors.brand} />
        </Button>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    height: 44,
    width: 44,
    top: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 0,
    alignSelf: 'stretch'
  },
  notificationContainer: {
    alignSelf: 'stretch',
    flex: 0,
    backgroundColor: colors.white,
    elevation: 2,
    borderRadius: Platform.OS === 'android' ? 0 : 8,
    shadowColor: 'rgba(0,0,0,0.07)',
    shadowOffset: {width: 0, height: -1},
    shadowRadius: 12,
    marginBottom: 26,
    margin: 4
  },
  clientName: {
    fontFamily: font,
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'left',
    color: colors.grey74,
    marginLeft: 10,
  },
  cardTitle: {
    fontFamily: font,
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'left',
    color: colors.grey74,
    padding: 19,
    paddingTop: 0
  },
  cardBody: {
    fontFamily: font,
    fontSize: 14,
    textAlign: 'left',
    color: colors.grey74,
    paddingLeft: 19,
    paddingRight: 19,
  },
  cardHeader: {
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderBottomColor: colors.white226,
    marginTop: 5,
    marginBottom: 20,
    marginLeft: 10,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    margin: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    borderColor: colors.brand,
    borderWidth: 1,
  },
})

export default InformationNotification
