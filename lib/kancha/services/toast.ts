import { Navigation } from 'react-native-navigation'

const showToast = (message: string, type: string, timeout: number) => {
  Navigation.showOverlay({
    component: {
      id: 'TOAST',
      name: 'Toast',
      passProps: {
        message,
        type,
      },
      options: {
        layout: {
          backgroundColor: 'transparent',
        },
      },
    },
  })
}

const dismissToast = () => {
  Navigation.dismissOverlay('TOAST')
}

export default {
  show: showToast,
  hide: dismissToast,
}
