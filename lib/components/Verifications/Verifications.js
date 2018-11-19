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
import PropTypes from 'prop-types'
import { View, Text, Image } from 'react-native'
import { connect } from 'react-redux'
import { toJs } from 'mori'

import VerificationList from 'uPortMobile/lib/components/Verifications/VerificationList'
import { removePendingAttestation } from 'uPortMobile/lib/actions/uportActions'

import { onlyPendingAndLatestAttestations,
  pendingOrIssuedAttestationFor, pendingAttestationFor} from 'uPortMobile/lib/selectors/attestations'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { colors, font, textStyles } from 'uPortMobile/lib/styles/globalStyles'

import { backIconGetter } from 'uPortMobile/lib/utilities/navButtonGetters'
import { currentAddress } from '../../selectors/identities'

export class Verifications extends React.Component {
  constructor (props) {
    super()
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    props.navigator.setStyle({
      navBarNoBorder: true,
      navBarTextColor: colors.grey74,
      navBarButtonColor: colors.purple,
      navBarFontSize: 18,
      navBarFontFamily: font,
      navBarBackgroundColor: colors.white
    })
  }

  componentDidMount () {
    backIconGetter(this.props.navigator)
  }
  
  onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'back') { // this is the same id field from the static navigatorButtons definition
        this.props.navigator.pop({
        })
      }
    }
  }

  selectVerification (verification) {
    if (verification.claim) {
      this.props.navigator.push({
        screen: 'uport.verificationCard',
        animated: true, // does the push have transition animation or does it happen immediately (optional)
        animationType: 'fade', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
        navigatorStyle: {
          navBarBackgroundColor: colors.white
        },
        passProps: { verification }
      })
    }
  }

  render () {
    // console.log( `pendingAttestations -> ${this.props.pendingAttestations}`)
    // console.log( `pendingAttestationsFor -> ${this.props.pendingAttestationsFor}`)
    // console.log( `pendingOrIssuedAttestationFor -> ${this.props.pendingOrIssuedAttestationFor}`)
    return (
      <View style={{padding: 10, flex: 1, backgroundColor: colors.white246, borderTopWidth: 1, borderColor: colors.white216}}>
        {!this.props.attestations.length && <View>
          <Image source={require('uPortMobile/assets/images/inboxIcon.png')} style={{alignSelf: 'center', marginTop: 80}} />
          <Text style={[textStyles.h2, {padding: 16, paddingTop: 20}]}>You don't have any verifications yet.</Text>
          <Text style={textStyles.p}>Verifications are issued by services you interact with using uPort.</Text>
        </View>}

        <VerificationList
          selectVerification={this.selectVerification}
          verifications={this.props.attestations}
          lookupIssuer={this.props.lookupIssuer}
        />
      </View>
    )
  }
}

Verifications.propTypes = {
  attestations: PropTypes.array,
  pendingAttestation: PropTypes.array,
  lookupIssuer: PropTypes.func
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    attestations: onlyPendingAndLatestAttestations(state),
    lookupIssuer: (clientId) => toJs(externalProfile(state, clientId)),
    address: currentAddress(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Verifications)
