import { Navigation } from 'react-native-navigation'
import { Theme, Icon } from '../kancha'
import SCREENS from '../screens/Screens'

/**
 * This is called by the startUpSaga when the app is ready to launch
 */
export function startApp(root: string) {
  Navigation.events().registerAppLaunchedListener(() => {
    switch (root) {
      case 'ONBOARDING':
        return startOnboarding()
      case 'MAIN_APP':
        return startMain()
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

const navBarText = (title: string, largeTitle: boolean, noBorder?: boolean) => {
  return {
    noBorder: noBorder && noBorder,
    title: {
      text: title,
      color: Theme.colors.inverted.text,
    },
    largeTitle: {
      visible: largeTitle,
      color: Theme.colors.inverted.text,
    },
  }
}

export async function startMain() {
  const credentialsIcon = await Icon.getImageSource('feather', 'check-circle', 26)
  const profileIcon = await Icon.getImageSource('feather', 'user', 26)
  const contactsIcon = await Icon.getImageSource('feather', 'users', 26)
  const notificationsIcon = await Icon.getImageSource('feather', 'bell', 26)
  const settingsIcon = await Icon.getImageSource('feather', 'settings', 26)

  Navigation.setDefaultOptions({
    topBar: {
      drawBehind: true,
      background: {
        color: Theme.colors.primary.brand,
        translucent: false,
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
      bottomTabs: {
        options: {
          bottomTab: {},
          bottomTabs: {
            translucent: true,
            drawBehind: true,
          },
        },
        children: [
          {
            stack: {
              children: [
                {
                  component: {
                    name: SCREENS.Credentials,
                    options: {
                      topBar: navBarText('Credentials', true),
                      bottomTab: {
                        icon: credentialsIcon,
                        iconColor: Theme.colors.primary.accessories,
                        selectedIconColor: Theme.colors.primary.brand,
                        iconInsets: { top: 0, left: 0, bottom: -8, right: 0 },
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
                      topBar: navBarText('', false, true),
                      bottomTab: {
                        icon: profileIcon,
                        iconColor: Theme.colors.primary.accessories,
                        selectedIconColor: Theme.colors.primary.brand,
                        iconInsets: { top: 0, left: 0, bottom: -8, right: 0 },
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
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  })
}
