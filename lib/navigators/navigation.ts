import { Navigation } from 'react-native-navigation'
import SCREENS from '../screens/Screens'

export const startOnboarding = () => {
  Navigation.setRoot({
    root: {
      component: { name: SCREENS.Welcome },
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
