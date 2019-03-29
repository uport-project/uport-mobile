import { Navigation } from 'react-native-navigation'
import SCREENS from '../screens/Screens'
import { Theme } from '../kancha'

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

export const startMain = () => {
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

  const topBar = {
    largeTitle: { visible: true },
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
                      topBar: {
                        largeTitle: {
                          visible: true,
                        },
                      },
                      bottomTab: {
                        text: 'TAB1',
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
                      bottomTab: {
                        text: 'TAB2',
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
                      bottomTab: {
                        text: 'TAB3',
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
                      bottomTab: {
                        text: 'TAB4',
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
                      bottomTab: {
                        text: 'TAB5',
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      // stack: {
      //   children: [
      //     {
      //       component: {
      //         name: SCREENS.Credentials,
      //       },
      //     },
      //   ],
      //   options: {
      //     bottomTab: {
      //       text: 'Tab 1',
      //     },
      //   },
      // },
      // bottomTabs: {
      //   children: [
      //     {
      //       component: {
      //         name: SCREENS.Credentials,
      //       },
      //     },
      //     {
      //       component: {
      //         name: SCREENS.Profile,
      //       },
      //     },
      //     {
      //       component: {
      //         name: SCREENS.Contacts,
      //       },
      //     },
      //     {
      //       component: {
      //         name: SCREENS.Notifications,
      //       },
      //     },
      //     {
      //       component: {
      //         name: SCREENS.Settings,
      //       },
      //     },
      //   ],
      // },
    },
  })
}
