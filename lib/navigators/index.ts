import { Navigation } from 'react-native-navigation'
import store from '../store/store'
import { Provider } from 'react-redux'
import { registerScreens } from '../screens/index'
import { startMain, startOnboarding } from './navigation'

/**
 * Register screens and components for react native navigation
 */
registerScreens({ store, Provider })

const App = () => {
  Navigation.events().registerAppLaunchedListener(() => {
    startOnboarding()
    // startMain()
  })
}

export default App
