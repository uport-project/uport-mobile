/**
 * Screens
 */
import { Navigation } from 'react-native-navigation'
import SCREENS from './Screens'

/**
 * Screen components
 */
import Account from 'uPortMobile/lib/screens/Account'
import Credentials from 'uPortMobile/lib/screens/Credentials'
import Credential from 'uPortMobile/lib/screens/Credential'
import Contacts from 'uPortMobile/lib/screens/Contacts'
import Contact from 'uPortMobile/lib/screens/Contact'
import Notifications from 'uPortMobile/lib/screens/Notifications'
import Settings from 'uPortMobile/lib/screens/Settings'
import Profile from 'uPortMobile/lib/screens/Profile'
import ShareContactModal from 'uPortMobile/lib/screens/ShareContact'
import DesignSystem from 'uPortMobile/lib/screens/DesignSystem'
import Scanner from 'uPortMobile/lib/screens/Scanner'

import Welcome from 'uPortMobile/lib/screens/onboarding/Welcome'
import Learn from 'uPortMobile/lib/screens/onboarding/Learn'
import CreateIdentity from 'uPortMobile/lib/screens/onboarding/CreateIdentity'
import Terms from 'uPortMobile/lib/screens/onboarding/Terms'
import Privacy from 'uPortMobile/lib/screens/onboarding/Privacy'

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
}
