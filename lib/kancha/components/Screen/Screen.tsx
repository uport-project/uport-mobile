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
import { SafeAreaView, ScrollView, ViewStyle } from 'react-native'
import { Container, Theme, Device, Text, TextTypes } from '@kancha'

interface ScreenProps {
  safeAreaView?: boolean;
  type?: 'primary' | 'secondary' | 'tertiary' | undefined;
  expandingHeaderContent?: React.ReactNode;
  expandingHeaderType?: 'primary' | 'secondary' | 'tertiary' | undefined;
}

const SPACER_SIZE = 1000;

const Screen: React.FunctionComponent<ScreenProps> = props => {

  const scrollViewStyle: ViewStyle = {
    backgroundColor: props.type && Theme.colors[props.type].background,
  }
  const scrollViewContentStyle = {
    ...(props.expandingHeaderType ? { backgroundColor: Theme.colors[props.expandingHeaderType].background } : {}),
  }
  const scrollViewContentInset = {
    ...(props.expandingHeaderContent ? { top: -SPACER_SIZE } : {} ),
  }
  const scrollViewContentOffset = {
    ...(props.expandingHeaderContent ? { y: SPACER_SIZE, x: 0 } : { y: 0, x: 0 }),
  }

  return props.safeAreaView ? (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentInset={scrollViewContentInset}
        contentOffset={scrollViewContentOffset}
        style={scrollViewStyle} 
        contentContainerStyle={scrollViewContentStyle}>
        {
          props.expandingHeaderContent &&
            <React.Fragment>
            { Device.isIOS && <Container h={1000} /> }
              <Container
                background={props.expandingHeaderType}>
                  {
                    props.expandingHeaderContent
                  }
              </Container>
            </React.Fragment>
        }
        <Container flex={1} paddingBottom background={props.type}>
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
