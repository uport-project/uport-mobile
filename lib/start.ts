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
import { Platform, NativeModules } from 'react-native'
import { RNUportSigner } from 'react-native-uport-signer'

import { handleURL } from './actions/requestActions'
import { registerDeviceForNotifications } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { track, screen } from 'uPortMobile/lib/actions/metricActions'

registerScreens(store, Provider)

// This method doesn't do much. I just want to ensure that this library is not optimized away
export async function start() {
  // console.log('starting uport')
}

// Actual initialization is done by startupSaga during initialization of `store`.
// When DB is ready it calls one of these.
export const screenVisibilityListener = new RNNScreenVisibilityListener({
  didAppear: async (event: any) => {
    store.dispatch(screen(event.screen, event))
  },
})

// Add GUI startup tasks here for already onboarded user
export async function startMain(this: any) {
  Platform.OS === 'android' ? store.dispatch(registerDeviceForNotifications()) : null
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'uport.home', // unique ID registered with Navigation.registerScreen
      // override the navigator style for the screen, see "Styling the navigator" below (optional)
      // navigatorButtons: {} // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
      navigatorStyle: {
        navBarTextFontFamily: 'Nunito Sans',
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

  if (RNUportSigner && RNUportSigner.hasSecureKeyguard) {
    const hasSecureKeyguard = await RNUportSigner.hasSecureKeyguard()
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
        navBarTextFontFamily: 'Nunito Sans',
      }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
    },
    animationType: 'slide-down', // optional, add transition animation to root change: 'none', 'slide-down', 'fade'
  })
}
