import { Navigation } from 'react-native-navigation'
import SCREENS from 'uPortMobile/lib/screens/Screens'
import { UportmarketPlaceConfig } from 'uPortMobile/lib/utilities/parseClaims'
import fetchMarketPlaceData from 'uPortMobile/lib/utilities/fetchMarketplace'

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

export const showMarketPlaceModal = async (iss: string, _config?: UportmarketPlaceConfig) => {
  const showModal = (config: UportmarketPlaceConfig) => {
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

  if (!_config) {
    const config = await fetchMarketPlaceData(iss)
    if (config) {
      setTimeout(() => showModal(config), 500)
    }
  } else {
    showModal(_config)
  }
}

export default requestScreenManager
