import { Linking } from 'react-native'
import { Navigation } from 'react-native-navigation'
import { Theme, Icon, Device } from '../kancha'
import SCREENS from '../screens/Screens'
import { RNUportSigner } from 'react-native-uport-signer'
import store from '../store/store'
import { registerDeviceForNotifications } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { handleURL } from '../actions/requestActions'

/**
 * This is called by the startUpSaga when the app is ready to launch
 */
export function startApp(root: string) {
  switch (root) {
    case 'ONBOARDING':
      return startOnboarding()
    case 'MAIN_APP':
      return startMain()
  }
}

/**
 * Global listener for Android Scan button
 */
const listenForAndroidFabButtonEvent = () => {
  Navigation.events().registerNavigationButtonPressedListener(({ buttonId }) => {
    if (buttonId === 'androidScan') {
      Navigation.showModal({
        component: {
          name: SCREENS.Scanner,
          options: {
            animations: {
              showModal: {
                enabled: false,
              },
            },
            topBar: {
              visible: false,
            },
          },
        },
      })
    }
  })
}

/**
 * Global listener for IOS Scan button
 */
const listenerForIOSScanButton = () => {
  Navigation.events().registerNavigationButtonPressedListener(({ buttonId }) => {
    if (buttonId === 'scanButton') {
      Navigation.mergeOptions('Scanner', {
        sideMenu: {
          right: {
            visible: true,
          },
        },
      })
    }
  })
}

const startOnboarding = async () => {
  Navigation.setDefaultOptions({
    animations: {
      setRoot: {
        alpha: {
          from: 0,
          to: 1,
          duration: 500,
        },
      },
    },
    topBar: {
      drawBehind: true,
      background: {
        color: 'transparent',
      },
      buttonColor: 'white',
      backButton: {
        title: 'Back',
        color: 'white',
        visible: true,
      },
    },
  })

  /**
   * Check if we have a securtiy pin set
   */
  let STARTUP_SCREEN = SCREENS.Welcome
  if (RNUportSigner && RNUportSigner.hasSecureKeyguard) {
    const hasSecureKeyguard = await RNUportSigner.hasSecureKeyguard()
    STARTUP_SCREEN = hasSecureKeyguard ? SCREENS.Welcome : SCREENS.SecurityBlock
  }

  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: STARTUP_SCREEN,
              options: {
                topBar: {
                  visible: false,
                },
              },
            },
          },
        ],
      },
    },
  })
}

const navBarText = (title: string, noBorder?: boolean) => {
  return {
    noBorder: noBorder && noBorder,
    title: {
      text: title,
      color: Theme.colors.inverted.text,
    },
    largeTitle: {
      visible: true,
      color: Theme.colors.inverted.text,
    },
  }
}

export async function startMain() {
  /**
   * After icon design cleanup sort these out.
   */
  const credentialsIcon = await Icon.getImageSource('feather', 'check-circle', 26)
  const profileIcon = await Icon.getImageSource('feather', 'user', 26)
  const contactsIcon = await Icon.getImageSource('feather', 'users', 26)
  const notificationsIcon = await Icon.getImageSource('feather', 'bell', 26)
  const settingsIcon = await Icon.getImageSource('feather', 'settings', 26)
  const scanIcon = await Icon.getImageSource('ionicons', Icon.Names.scan, 30)
  const rightButtonsCredentialScreen = Device.isIOS
    ? {
        id: 'scanButton',
        icon: scanIcon,
        color: 'white',
      }
    : {}

  /**
   * Some options have not been updated in the nav library so we need to override it :(
   */

  Navigation.setDefaultOptions({
    animations: {
      setRoot: {
        alpha: {
          from: 0,
          to: 1,
          duration: 500,
        },
      },
    },
    layout: {
      backgroundColor: Theme.colors.secondary.background,
    },
    sideMenu: {
      right: {
        enabled: true,
        // @ts-ignore
        width: Device.w,
      },
    },
    bottomTabs: {
      animate: false,
      titleDisplayMode: 'alwaysHide',
    },
    topBar: {
      background: {
        color: Theme.colors.primary.brand,
        translucent: false,
      },
      elevation: 0,
      buttonColor: 'white',
      backButton: {
        title: 'Back',
        color: 'white',
        // visible: true,
      },
      largeTitle: {
        color: 'white',
      },
    },
  })

  // Navigation.setRoot({
  //   root: {
  //     stack: {
  //       children: [
  //         {
  //           component: {
  //             name: SCREENS.Dummy,
  //             options: {
  //               topBar: {
  //                 visible: false,
  //               },
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   },
  // })

  /**
   * Begin root
   */
  Navigation.setRoot({
    root: {
      // @ts-ignore
      sideMenu: {
        right: {
          component: {
            id: SCREENS.Scanner,
            name: SCREENS.Scanner,
          },
        },
        center: {
          bottomTabs: {
            id: 'MainTabsId',
            children: [
              {
                stack: {
                  children: [
                    {
                      component: {
                        name: SCREENS.Credentials,
                        options: {
                          topBar: {
                            rightButtons: [rightButtonsCredentialScreen],
                            title: {
                              text: 'Credentials',
                              color: Theme.colors.inverted.text,
                            },
                            largeTitle: {
                              visible: true,
                              color: Theme.colors.inverted.text,
                            },
                          },
                          bottomTab: {
                            icon: credentialsIcon,
                            iconColor: Theme.colors.primary.accessories,
                            selectedIconColor: Theme.colors.primary.brand,
                            iconInsets: { top: 0, left: 0, bottom: -8, right: 0 },
                          },
                          fab: {
                            id: 'androidScan',
                            visible: true,
                            backgroundColor: Theme.colors.primary.brand,
                            clickColor: '#FFF',
                            rippleColor: '#ddd',
                            icon: scanIcon,
                            iconColor: '#FFF',
                          },
                        },
                      },
                    },
                  ],
                },
              },
              {
                stack: {
                  children: [
                    {
                      component: {
                        name: SCREENS.Profile,
                        options: {
                          topBar: navBarText('', true),
                          bottomTab: {
                            icon: profileIcon,
                            iconColor: Theme.colors.primary.accessories,
                            selectedIconColor: Theme.colors.primary.brand,
                            iconInsets: { top: 0, left: 0, bottom: -8, right: 0 },
                          },
                          fab: {
                            id: 'androidScan',
                            visible: true,
                            backgroundColor: Theme.colors.primary.brand,
                            clickColor: '#FFF',
                            rippleColor: '#ddd',
                            icon: scanIcon,
                            iconColor: '#FFF',
                          },
                        },
                      },
                    },
                  ],
                },
              },
              {
                stack: {
                  children: [
                    {
                      component: {
                        name: SCREENS.Contacts,
                        options: {
                          topBar: navBarText('Contacts', true),
                          bottomTab: {
                            icon: contactsIcon,
                            iconColor: Theme.colors.primary.accessories,
                            selectedIconColor: Theme.colors.primary.brand,
                            iconInsets: { top: 0, left: 0, bottom: -8, right: 0 },
                          },
                          fab: {
                            id: 'androidScan',
                            visible: true,
                            backgroundColor: Theme.colors.primary.brand,
                            clickColor: '#FFF',
                            rippleColor: '#ddd',
                            icon: scanIcon,
                            iconColor: '#FFF',
                          },
                        },
                      },
                    },
                  ],
                },
              },
              {
                stack: {
                  children: [
                    {
                      component: {
                        name: SCREENS.Notifications,
                        options: {
                          topBar: navBarText('Notifications', true),
                          bottomTab: {
                            icon: notificationsIcon,
                            iconColor: Theme.colors.primary.accessories,
                            selectedIconColor: Theme.colors.primary.brand,
                            iconInsets: { top: 0, left: 0, bottom: -8, right: 0 },
                          },
                          fab: {
                            id: 'androidScan',
                            visible: true,
                            backgroundColor: Theme.colors.primary.brand,
                            clickColor: '#FFF',
                            rippleColor: '#ddd',
                            icon: scanIcon,
                            iconColor: '#FFF',
                          },
                        },
                      },
                    },
                  ],
                },
              },
              {
                stack: {
                  children: [
                    {
                      component: {
                        name: SCREENS.Settings,
                        options: {
                          topBar: navBarText('Settings', true),
                          bottomTab: {
                            icon: settingsIcon,
                            iconColor: Theme.colors.primary.accessories,
                            selectedIconColor: Theme.colors.primary.brand,
                            iconInsets: { top: 0, left: 0, bottom: -8, right: 0 },
                          },
                          fab: {
                            id: 'androidScan',
                            visible: true,
                            backgroundColor: Theme.colors.primary.brand,
                            clickColor: '#FFF',
                            rippleColor: '#ddd',
                            icon: scanIcon,
                            iconColor: '#FFF',
                          },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  })
  /** ^^ End root ^^ */

  /**
   * Set up global listener for android fab button
   */
  if (Device.isAndroid) {
    listenForAndroidFabButtonEvent()
  } else if (Device.isIOS) {
    listenerForIOSScanButton()
  }

  /**
   * Register for notifications
   */
  store.dispatch(registerDeviceForNotifications())

  
  Linking.getInitialURL().then(url => {
    store.dispatch(handleURL(url))
  })

  Linking.addEventListener('url', (event) => {
    if (event && event.url) store.dispatch(handleURL(event.url))
  })
  
}
