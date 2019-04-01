import { Navigation } from 'react-native-navigation'
import store from '../store/store'
import { Provider } from 'react-redux'
import { registerScreens } from '../screens/index'
import { screen } from 'uPortMobile/lib/actions/metricActions'

/**
 * Register screens and components for react native navigation
 */
registerScreens({ store, Provider })

const App = () => {
  Navigation.events().registerComponentDidAppearListener(({ componentName }) => {
    store.dispatch(screen(componentName))
  })
}

export default App
