/***
 *  Copyright (C) 2018 ConsenSys AG
 *
 *  This file is part of uPort Mobile App
 *  uPort Mobile App is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  uPort Mobile App is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  ERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ***/

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View } from 'react-native'
import { createIdentity } from 'uPortMobile/lib/actions/uportActions'
import TermsAndConditions from '../../screens/settings/TermsAndConditions'
import { OnboardingButton } from '../shared/Button'
import { Text } from '../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { currentAddress } from '../../selectors/identities'

function onContinue(props) {
  let nextScreen = 'onboarding.optout'

  if (!props.address) {
    props.createIdentity()
  }

  props.navigator.push({
    screen: nextScreen,
    navigatorStyle: {
      navBarHidden: true,
    },
  })
}
export const OnboardingTerms = (props, context) => {
  const { styles } = context.theme ? context.theme : defaultTheme
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text title> Terms and Conditions</Text>
      </View>
      <TermsAndConditions defaultPadding={false} />
      <OnboardingButton onPress={() => onContinue(props)}>
        Accept
      </OnboardingButton>
      {/* <Dummy /> */}
    </View>
  )
}

OnboardingTerms.contextTypes = {
  theme: PropTypes.object,
}

const mapStateToProps = state => {
  return {
    address: currentAddress(state),
  }
}

export const mapDispatchToProps = dispatch => {
  return {
    createIdentity: () => dispatch(createIdentity()),
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(connectTheme(OnboardingTerms))
