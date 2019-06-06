import { Navigation } from 'react-native-navigation'
import SCREENS from 'uPortMobile/lib/screens/Screens'
import { UportmarketPlaceConfig } from 'uPortMobile/lib/utilities/parseClaims'

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

export const showMarketPlaceModal = (config: UportmarketPlaceConfig) => {
  Navigation.showModal({
    // @ts-ignore
    stack: {
      children: [
        {
          component: {
            name: 'MarketPlace',
            passProps: {
              config,
            },
            options: {
              modalPresentationStyle: 'overFullScreen',
              layout: {
                backgroundColor: 'rgba(0,0,0,0.4)',
              },
              topBar: {
                visible: false,
              },
            },
          },
        },
      ],
    },
  })
}

export default requestScreenManager
