import { Navigation } from 'react-native-navigation'
import SCREENS from '../screens/Screens'
import { Theme, Icon } from '../kancha'

export const startOnboarding = () => {
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

  Navigation.setRoot({
    root: {
      bottomTabs: {
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
                      topBar: navBarText('Contacts', false),
                      bottomTab: {
                        icon: contactsIcon,
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
                      topBar: navBarText('Notifications', false),
                      bottomTab: {
                        icon: notificationsIcon,
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
                      topBar: navBarText('Settings', false),
                      bottomTab: {
                        icon: settingsIcon,
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
