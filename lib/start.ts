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

import { Navigation, ScreenVisibilityListener as RNNScreenVisibilityListener } from 'react-native-navigation'
import requestQueue from './utilities/requestQueue'
import { Provider } from 'react-redux'
import store from './store/store'
import { registerScreens } from './screens'
import { Platform, NativeModules, Dimensions } from 'react-native'
import FeatherIcons from 'react-native-vector-icons/Feather'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { handleURL } from './actions/requestActions'
import { registerDeviceForNotifications } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { track, screen } from 'uPortMobile/lib/actions/metricActions'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

const isIOS = Platform.OS === 'ios' ? true : false;

export function start() {
  registerScreens(store, Provider)
}

// Actual initialization is done by startupSaga during initialization of `store`.
// When DB is ready it calls one of these.
export function startMain() {
  startAppModernUI()
  // startLegacyApp()
}

export const screenVisibilityListener = new RNNScreenVisibilityListener({
  didAppear: async (event: any) => {
    store.dispatch(screen(event.screen, event))
  },
})

// Add GUI startup tasks here for already onboarded user
export async function startAppModernUI(this: any) {
  isIOS ? null : store.dispatch(registerDeviceForNotifications())

  const accountsIcon = await FeatherIcons.getImageSource('shield', 26)
  const contactsIcon = await FeatherIcons.getImageSource('users', 26)
  const settingsIcon = await FeatherIcons.getImageSource('settings', 26)
  const notificationsIcon = await FeatherIcons.getImageSource('bell', 26)
  const AndroidOptions = {
    appStyle: {
      tabBarBackgroundColor: colors.brand,
      tabBarButtonColor: '#ffffff',
      tabBarHideShadow: true,
      tabBarSelectedButtonColor: '#63d7cc',
      tabBarTranslucent: false,
      tabFontSize: 10,
      selectedTabFontSize: 12,
    },
    drawer: {},
  }
  const IOSOptions = {
    tabsStyle: {
      tabBarBackgroundColor: colors.white,
      tabBarSelectedButtonColor: colors.brand,
    },
    drawer: {
      right: {
        screen: 'uport.scanner',
      },
      style: {
        rightDrawerWidth: 100,
        drawerShadow: false,
      },
    },
  }
  const commonPlatformOptions = {
    tabsStyle: {
      tabBarBackgroundColor: colors.brand,
      tabBarSelectedButtonColor: colors.white216,
    },
    tabs: [
      {
        screen: 'screen.Accounts', // this is a registered name for a screen
        title: 'Accounts',
        icon: accountsIcon,
      },
      {
        screen: 'screen.Contacts',
        title: 'Contacts',
        icon: contactsIcon,
      },
      {
        screen: 'screen.Notifications',
        title: 'Notifications',
        icon: notificationsIcon,
      },
      {
        screen: 'screen.Settings',
        title: 'Settings',
        icon: settingsIcon,
      },
    ],
    animationType: 'none',
  }

  /**
   * The typings are out of date so we need to cast them as any for now
   *
   */
  const StartTabBasedApp: any = Navigation.startTabBasedApp

  StartTabBasedApp({
    tabs: commonPlatformOptions.tabs,
    tabsStyle: IOSOptions.tabsStyle,
    drawer: isIOS ? IOSOptions.drawer : AndroidOptions.drawer,
    appStyle: isIOS ? {} : AndroidOptions.appStyle,
    animationType: 'none',
  })

  screenVisibilityListener.register()
  requestQueue((url: string) => store.dispatch(handleURL(url)))
}

// Add GUI startup tasks here for already onboarded user
export async function startLegacyApp(this: any) {
  Platform.OS === 'android' ? store.dispatch(registerDeviceForNotifications()) : null
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'uport.home', // unique ID registered with Navigation.registerScreen
      // override the navigator style for the screen, see "Styling the navigator" below (optional)
      // navigatorButtons: {} // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
      navigatorStyle: {
        navBarTextFontFamily: 'Montserrat',
        navBarHidden: true,
      }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
    },
    // passProps: {}, // simple serializable object that will pass as props to all top screens (optional)
    animationType: 'none', // optional, add transition animation to root change: 'none', 'slide-down', 'fade'
  })
  this.listener = screenVisibilityListener.register()
  requestQueue((url: string) => store.dispatch(handleURL(url)))
}

// Add GUI startup tasks here for onboarding new user
export async function startOnboarding() {
  let startupScreen = 'onboarding.start'

  if (NativeModules.NativeSignerModule && NativeModules.NativeSignerModule.hasSecureKeyguard) {
    const hasSecureKeyguard = await NativeModules.NativeSignerModule.hasSecureKeyguard()
    if (!hasSecureKeyguard) {
      startupScreen = 'onboarding.securityBlock'
    }
  }

  Navigation.startSingleScreenApp({
    screen: {
      screen: startupScreen, // unique ID registered with Navigation.registerScreen
      title: 'Uport', // title of the screen as appears in the nav bar (optional)
      navigatorStyle: {
        navBarHidden: true,
        navBarTextFontFamily: 'Montserrat',
      }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
    },
    animationType: 'fade', // optional, add transition animation to root change: 'none', 'slide-down', 'fade'
  })
}
