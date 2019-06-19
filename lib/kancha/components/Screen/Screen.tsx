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
import { SafeAreaView, ScrollView, ViewStyle, ImageBackground, ImageSourcePropType, StatusBar } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { Container, Theme, Device, Text } from '@kancha'

/** Spacer size */
const SPACER_SIZE = 500

/***
 * 1 - SafeAreaView with scrolling
 * 2 - SafeAreaView without scrolling
 * 3 - No SafeAreaView with scrolling
 * 4 - No SafeAreaView without scrolling
 * */
const ScreenConfigs: Kancha.ScreenConfigsStatic = {
  SafeScroll: 'safeScroll',
  SafeNoScroll: 'safeNoScroll',
  Scroll: 'scroll',
  NoScroll: 'noScroll',
  NoSafeNoScroll: 'noSafeNoScroll',
}

const ScreenBrandOptions: Kancha.BrandTypeStatic = {
  Primary: 'primary',
  Secondary: 'secondary',
  Tertiary: 'tertiary',
  Accent: 'accent',
  Warning: 'warning',
  Confirm: 'confirm',
  Custom: 'custom',
}

interface ScreenProps {
  /**
   * Configure the screen: Eg. Screen.Config.SafeScroll
   */
  config?: 'safeScroll' | 'safeNoScroll' | 'scroll' | 'noScroll' | 'noSafeNoScroll' | undefined
  /**
   * Type of screen. This sets the background color-- May change
   */
  type?: Kancha.BrandPropOptions
  /**
   * Type of header. This sets the header background color -- May change
   */
  headerBackgroundColor?: string
  /**
   * The content to show in the expanding header zone. A config with a scrollView must be enabled.
   */
  expandingHeaderContent?: React.ReactNode

  /**
   * Provide a background image type
   */
  backgroundImage?: ImageSourcePropType | undefined

  /**
   * Hide the statusbar
   */
  statusBarHidden?: boolean

  /**
   * A footer component that works with KAV
   */
  footerNavComponent?: React.ReactNode

  /**
   * A footer component that works with KAV
   */
  footerNavDivider?: boolean

  /**
   * Use a keyboard avoiding view for text inputs
   */
  keyboardAvoiding?: boolean
}

const Screen: React.FunctionComponent<ScreenProps> & {
  Config: Kancha.ScreenConfigsStatic
  Types: Kancha.BrandTypeStatic
} = props => {
  const scrollViewStyle: ViewStyle = {
    backgroundColor: props.type && Theme.colors[props.type].background,
    // borderWidth: 1,
    // borderColor: 'red',
  }

  const safeAreaViewStyle = {
    flex: 1,
    ...(props.type && !props.backgroundImage
      ? { backgroundColor: props.type && Theme.colors[props.type].background }
      : {}),
  }

  /**
   * Main content to be rendered
   */
  const mainContent = (
    <React.Fragment>
      <Container background={props.type} flex={1}>
        <StatusBar barStyle="light-content" hidden={props.statusBarHidden} animated />
        {props.children}
      </Container>
    </React.Fragment>
  )
  /**
   * Main content to be rendered within a ScrollView
   */
  const scrollViewContent = (
    <React.Fragment>
      <KeyboardAwareScrollView style={scrollViewStyle} contentInsetAdjustmentBehavior={'never'}>
        {props.expandingHeaderContent && (
          <React.Fragment>
            <Container backgroundColor={props.headerBackgroundColor}>{props.expandingHeaderContent}</Container>
          </React.Fragment>
        )}
        {mainContent}
      </KeyboardAwareScrollView>

      {props.footerNavComponent && (
        <SafeAreaView style={{ backgroundColor: Theme.colors.primary.background }}>
          <Container paddingTop dividerTop={props.footerNavDivider}>
            {props.footerNavComponent}
          </Container>
        </SafeAreaView>
      )}
    </React.Fragment>
  )
  /**
   * Main content to be rendered within a SafeAreaView
   */
  const safeAreaView = (
    <SafeAreaView style={safeAreaViewStyle}>
      <Container flex={1}>{props.config === ScreenConfigs.SafeNoScroll ? mainContent : scrollViewContent}</Container>

      {props.footerNavComponent && props.config === ScreenConfigs.SafeNoScroll && (
        <Container paddingTop dividerTop={props.footerNavDivider}>
          {props.footerNavComponent}
        </Container>
      )}
    </SafeAreaView>
  )

  /**
   * Main content to be rendered
   */
  const backgroundImageContent = (
    <ImageBackground
      style={{ flex: 1 }}
      source={props.backgroundImage ? props.backgroundImage : {}}
      resizeMode={'cover'}>
      {safeAreaView}
    </ImageBackground>
  )

  return props.backgroundImage
    ? backgroundImageContent
    : props.config === ScreenConfigs.NoScroll
    ? mainContent
    : props.config === ScreenConfigs.Scroll
    ? scrollViewContent
    : safeAreaView
}

Screen.defaultProps = {
  config: ScreenConfigs.SafeScroll,
  type: ScreenBrandOptions.Secondary,
  statusBarHidden: false,
  keyboardAvoiding: false,
}

/**
 * Appending statics
 */
Screen.Config = ScreenConfigs
Screen.Types = ScreenBrandOptions

export default Screen
