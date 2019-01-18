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

import * as React from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import { Container, Theme } from '@kancha'

interface ScreenProps {
  safeAreaView?: boolean
  type?: 'primary' | 'secondary' | undefined
}

const Screen: React.FunctionComponent<ScreenProps> = props => {
  return props.safeAreaView ? (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{
          backgroundColor: props.type && Theme.colors[props.type].background,
        }}
      >
        <Container flex={1} background={props.type} paddingBottom>
          {props.children}
        </Container>
      </ScrollView>
    </SafeAreaView>
  ) : (
    <Container flex={1}>{props.children}</Container>
  )
}

Screen.defaultProps = {
  safeAreaView: true,
  type: 'secondary',
}

export default Screen
