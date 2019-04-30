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
// Framework
import React from 'react'
import PropTypes from 'prop-types'
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'
// Components
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { AcceptCancelGroup } from 'uPortMobile/lib/components/shared/Button'
// Selectors
import { currentRequest, destinationProfile } from 'uPortMobile/lib/selectors/requests'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'

// Actions
import { authorizeRequest, cancelRequest, clearRequest } from 'uPortMobile/lib/actions/requestActions'

// Styles
import globalStyles, { colors, heightRatio, widthRatio, font } from 'uPortMobile/lib/styles/globalStyles'
const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: colors.white,
    borderRadius: 5,
    height: heightRatio(100),
    justifyContent: 'center',
    marginTop: heightRatio(-50),
    shadowColor: 'rgb(16,18,32)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    width: heightRatio(100)
  },
  card: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: colors.grey,
    flex: 1
  },
  cardHeader: {
    backgroundColor: colors.uportBlue,
    flex: 0,
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  name: {
    color: colors.uportBlack,
    fontFamily: font,
    fontSize: 20,
    lineHeight: 24,
    marginBottom: heightRatio(10),
    marginTop: heightRatio(8),
    textAlign: 'center'
  },
  typeContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.uportRed,
    borderRadius: widthRatio(30),
    height: heightRatio(29),
    justifyContent: 'center',
    marginTop: heightRatio(15),
    paddingLeft: 8,
    paddingRight: 8
  },
  typeText: {
    color: colors.white,
    fontFamily: font,
    fontSize: 13,
    letterSpacing: 1,
    lineHeight: 15,
    textAlign: 'center'
  }
})
export const ConnectionCard = (props) => {
  let isMyself = (props.contact.address === props.currentAddress)
  // Because you can't call to UpperCase on the string from the contact, because it modifies in place
  let type = '' + props.contact['@type']
  return (
    <View style={{alignItems: 'stretch', flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', width: widthRatio(375), backgroundColor: colors.uportBlue, height: heightRatio(60)}}>
        <TouchableOpacity onPress={props.clearRequest} style={{width: heightRatio(40), height: heightRatio(40), marginBottom: 15}}>
          <Icon name='ios-close' style={{fontSize: 40, marginTop: 20, marginLeft: 20, color: colors.white}} />
        </TouchableOpacity>
      </View>
      <View
        style={styles.avatarContainer}>
        {props.contact ? <Avatar size={heightRatio(92)} source={props.contact} /> : null}
      </View>
      <View style={styles.typeContainer}>
        <Text style={styles.typeText}>
          {type === 'undefined' ? 'CONTRACT' : type.toUpperCase()}
        </Text>
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.name}>
          {
            props.contact && (props.contact.name)
            ? props.contact.name
            : null
          }
        </Text>
      </View>
      {
        props.request.canceledAt
        ? (<View style={globalStyles.canceledBox}>
          <Text style={{
            textAlign: 'center',
            letterSpacing: 1,
            color: '#ffffff',
            fontSize: 13
          }}>
          TRANSACTION CANCELED
          </Text>
        </View>
        )
        : (props.request.authorizedAt || props.request.existing || isMyself
          ? (
            isMyself
            ? <Text>Cannot add yourself</Text>
            : <Text>
              {
                props.request.existing
                ? 'Already a contact'
                : 'Added to your contact list.'
              }
            </Text>
          )
          : (
            <AcceptCancelGroup
              acceptText='Add Contact'
              cancelText='Reject'
              onAccept={() => props.authorizeRequest(props.request)}
              onCancel={() => props.cancelRequest(props.request)}
             />
          ))
      }
    </View>
  )
}

ConnectionCard.propTypes = {
  request: PropTypes.object,
  currentAddress: PropTypes.string,
  contact: PropTypes.object,
  authorizeRequest: PropTypes.func,
  cancelRequest: PropTypes.func
}

const mapStateToProps = (state) => {
  const request = currentRequest(state) || {}
  const contact = request.profile || {}
  return {
    contact,
    currentAddress: request.target,
    request
  }
}

export const mapDispatchToProps = (dispatch) => ({
  clearRequest: () => {
    dispatch(clearRequest())
  },
  authorizeRequest: (activity) => dispatch(authorizeRequest(activity.id)),
  cancelRequest: (activity) => dispatch(cancelRequest(activity.id))
})

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionCard)
