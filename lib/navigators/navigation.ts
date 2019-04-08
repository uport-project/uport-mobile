import { Navigation } from 'react-native-navigation'
import { Theme, Icon, Device } from '../kancha'
import SCREENS from '../screens/Screens'

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

const startOnboarding = () => {
  Navigation.setDefaultOptions({
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

  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: SCREENS.Welcome,
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

  /**
   * Some options have not been updated in the nav library so we need to override it :(
   */

  Navigation.setDefaultOptions({
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

  /**
   * Begin root
   */
  Navigation.setRoot({
    root: {
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
                          topBar: navBarText('Credentials'),
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
  }
}
