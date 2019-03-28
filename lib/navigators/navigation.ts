import { Navigation } from 'react-native-navigation'
import SCREENS from '../screens/Screens'

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
  Navigation.setRoot({
    root: {
      bottomTabs: {
        children: [
          {
            component: {
              name: SCREENS.Credentials,
            },
          },
          {
            component: {
              name: SCREENS.Profile,
            },
          },
          {
            component: {
              name: SCREENS.Contacts,
            },
          },
          {
            component: {
              name: SCREENS.Notifications,
            },
          },
          {
            component: {
              name: SCREENS.Settings,
            },
          },
        ],
      },
    },
  })
}
