import { Navigation } from 'react-native-navigation'
import SCREENS from 'uPortMobile/lib/screens/Screens'

const requestScreenManager = (requestType: string) => {
  switch (requestType) {
    case 'disclosure':
    case 'sign':
    case 'attestation':
      Navigation.showModal({
        stack: {
          children: [
            {
              component: {
                name: SCREENS.NewRequest,
                passProps: {
                  requestType,
                },
                options: {
                  topBar: {
                    visible: false,
                    drawBehind: true,
                  },
                },
              },
            },
          ],
        },
      })
      break
    default:
      Navigation.showModal({
        stack: {
          children: [
            {
              component: {
                name: SCREENS.Request,
              },
            },
          ],
        },
      })
  }
}

export default requestScreenManager
