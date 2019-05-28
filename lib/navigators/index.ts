import { Navigation } from 'react-native-navigation'
import { Provider } from 'react-redux'
import { registerScreens } from '../screens/index'
import store from '../store/store'
import { screen } from 'uPortMobile/lib/actions/metricActions'

/**
 * Register screens and components for react native navigation
 */
registerScreens({ store, Provider })

/**
 * Register global event listener for screen
 */
const App = () => {
  Navigation.events().registerAppLaunchedListener(() => {
    /**
     * The start function will get called from the startup saga after this fires
     */
  })
  Navigation.events().registerComponentDidAppearListener(({ componentName }) => {
    /**
     * Global event listener for screens
     */
    store.dispatch(screen(componentName))
  })

}

export default App
