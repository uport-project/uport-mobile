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
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'

// Styles
import { Button, Centered } from '../shared/Button'

// Styles
import {colors, textStyles, onboardingStyles} from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  button: {
    borderColor: colors.white,
    borderWidth: 1
  },
  buttonText: {
    color: colors.white
  }
})

const MigrationComplete = (props) => (
  <View
    style={[onboardingStyles.container, {backgroundColor: colors.purple, padding: 50, justifyContent: 'space-around'}]}
  >
    <View style={{alignItems: 'center'}}>
      <Image
        source={require('uPortMobile/images/uport-white.png')} />
    </View>
    <Text style={[textStyles.p, {color: colors.white}]}>
      Your Migration was Successfull
    </Text>
    <Centered>
      <Button
        style={styles.button}
        textStyle={styles.buttonText}
        onPress={() => props.navigator.popToRoot({animated: true})}
      >
        Continue
      </Button>
    </Centered>
  </View>
)

export default MigrationComplete
