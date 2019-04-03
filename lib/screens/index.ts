/**
 * Screens
 */
import { Navigation } from 'react-native-navigation'
import SCREENS from './Screens'

/**
 * Screen components
 */
import Account from './Account'
import Credentials from './Credentials'
import Credential from './Credential'
import Contacts from './Contacts'
import Contact from './Contact'
import Notifications from './Notifications'
import Settings from './Settings'
import Profile from './Profile'
import ShareContactModal from './ShareContact'
import DesignSystem from './DesignSystem'
import Scanner from './Scanner'

import Welcome from './onboarding/Welcome'
import Learn from './onboarding/Learn'
import CreateIdentity from './onboarding/CreateIdentity'
import Terms from './onboarding/Terms'
import Privacy from './onboarding/Privacy'

/**
 * Wrapper component for redux
 * @TODO Change `component` to accept path to be used in a require function
 */
const registerComponentWithRedux = (redux: any) => (name: string, component: any) => {
  Navigation.registerComponentWithRedux(name, () => component, redux.Provider, redux.store)
}

export function registerScreens(redux: any) {
  /**
   * Top level screens
   */
  registerComponentWithRedux(redux)(SCREENS.Credentials, Credentials)
  registerComponentWithRedux(redux)(SCREENS.Credential, Credential)
  registerComponentWithRedux(redux)(SCREENS.Contacts, Contacts)
  registerComponentWithRedux(redux)(SCREENS.Contact, Contact)
  registerComponentWithRedux(redux)(SCREENS.ShareContact, ShareContactModal)
  registerComponentWithRedux(redux)(SCREENS.Account, Account)
  registerComponentWithRedux(redux)(SCREENS.Notifications, Notifications)
  registerComponentWithRedux(redux)(SCREENS.Settings, Settings)
  registerComponentWithRedux(redux)(SCREENS.Profile, Profile)
  registerComponentWithRedux(redux)(SCREENS.DesignSystem, DesignSystem)
  registerComponentWithRedux(redux)(SCREENS.Scanner, Scanner)

  /**
   * Onboarding screens
   */
  registerComponentWithRedux(redux)(SCREENS.Welcome, Welcome)
  registerComponentWithRedux(redux)(SCREENS.Learn, Learn)
  registerComponentWithRedux(redux)(SCREENS.CreateIdentity, CreateIdentity)
  registerComponentWithRedux(redux)(SCREENS.Terms, Terms)
  registerComponentWithRedux(redux)(SCREENS.Privacy, Privacy)

  /**
   * Settings screens
   */
  // registerComponentWithRedux(redux)(SCREENS.Welcome, Welcome)
  // registerComponentWithRedux(redux)(SCREENS.Learn, Learn)
  // registerComponentWithRedux(redux)(SCREENS.CreateIdentity, CreateIdentity)
  // registerComponentWithRedux(redux)(SCREENS.Terms, Terms)
  // registerComponentWithRedux(redux)(SCREENS.Privacy, Privacy)
}
