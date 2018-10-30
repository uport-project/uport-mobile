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
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Text, View, TouchableHighlight, StyleSheet } from 'react-native'
// import moment from 'moment'
// Components
// import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import ExpirationItem from 'uPortMobile/lib/components/Verifications/ExpirationItem'
// Styles
import {fontBold, fontLight, colors} from 'uPortMobile/lib/styles/globalStyles'

import S from 'string'

const styles = StyleSheet.create({
  claimListItem: {
    borderColor: '#808080',
    borderRadius: 10,
    borderWidth: 0.2,
    backgroundColor: colors.white,
    marginTop: 10,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    elevation: 1
  },
  claimListItemRow: {
    flexDirection: 'column',
    flex: 1,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 14,
    paddingBottom: 14
  },
  claimType: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 16,
    color: colors.grey155,
    letterSpacing: 0.5,
    fontFamily: fontLight
  },
  claimIssuer: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontBold,
    color: colors.grey91
  },
  claimValue: {
    fontSize: 10,
    color: 'rgba(10, 10, 10, 0.5)',
    letterSpacing: 0.5,
    fontFamily: fontBold,
  },
  verificationListItemTop: {
    flex: 1,
    flexDirection: 'row'
  },
  verificationListItemBottom: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#808080',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  }
})
// Helpers

export function extractClaimType (verification) {
  if (verification.claimType) {
    return verification.claimType
  }
  return Object.keys(verification.claim).map(claim => S(claim).humanize().titleCase().s).join(', ')
}

export function extractClaims (verification) {
  if (verification.claimType) {
    return 'pending'
  }
  const claim = verification.claim[Object.keys(verification.claim)[0]]
  if (typeof claim === 'object') {
    return Object.keys(claim).slice(0, 3).map(t => claim[t]).join(', ')
  } else {
    return claim
  }
}
const VerificationListItem = (props) => {
  var d = props.verification.exp ? new Date(props.verification.exp) : undefined
  return (
    <TouchableHighlight
      onPress={() => props.selectVerification && props.selectVerification(props.verification)}
      style={styles.claimListItem}
      underlayColor={colors.white}>
      <View>
        <View style={[styles.claimListItemRow, styles.verificationListItemTop]}>
          { props.verification.claimType
          ? <View style={{alignItems: 'flex-start', flex: 1, flexDirection: 'column'}}>
            <Text style={[styles.claimIssuer]}>{S(props.verification.claimType).humanize().titleCase().s}</Text>
            <Text style={[styles.claimType]}>{props.verification.issuer ? props.verification.issuer.name : `${props.verification.iss.slice(0, 10)}...`}</Text>
          </View>
          : <View style={{alignItems: 'flex-start', flex: 1, flexDirection: 'column'}}>
            <Text style={[styles.claimIssuer]}>{props.verification.issuer ? props.verification.issuer.name : `${props.verification.iss.slice(0, 10)}...`}</Text>
            <Text style={[styles.claimType]}>{extractClaimType(props.verification)}</Text>
          </View>}
        {d
           ? <ExpirationItem d={d} />
           : null }
        </View>
        <View style={[styles.claimListItemRow, styles.verificationListItemBottom]}>
          <Text style={[styles.claimValue]}>
            {extractClaims(props.verification)}
          </Text>
        </View>
      </View>
    </TouchableHighlight>)
}

VerificationListItem.propTypes = {
  verification: PropTypes.object.isRequired,
  selectVerification: PropTypes.func
}

export default VerificationListItem
