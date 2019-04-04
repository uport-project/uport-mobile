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

import ProfileQRCode from 'uPortMobile/lib/components/shared/QRCodeModal'

import Device from '../screens/settings/Device'
import Network from '../screens/settings/Network'
import Status from '../screens/settings/StatusMessages'
import Hub from '../screens/settings/HubStatus'
import TryUport from '../screens/settings/TryUport'
import UPortId from '../screens/settings/UportId'
import KeyChain from '../screens/settings/SeedAddresses'

import DataBackupInstructions from '../components/Backup/DataBackupInstructions'
import DataBackupSuccess from '../components/Backup/DataBackupSuccess'
import CreateSeedInstructions from '../components/Backup/SeedBackupInstructions'
import CreateSeedPhrase from '../components/Backup/SeedBackupPhrase'
import CreateSeedPhraseConfirm from '../components/Backup/SeedBackupConfirm'
import CreateSeedSuccess from '../components/Backup/SeedBackupSuccess'

import RestoreSeedInstructions from '../components/Recovery/SeedRecoveryInstructions'
import RestoreSeedPhrase from '../components/Recovery/SeedRecoveryPhrase'
import RestoreSeedSuccess from '../components/Recovery/SeedRecoverySuccess'

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
   * Modal screens
   */
  registerComponentWithRedux(redux)(SCREENS.ProfileQRCode, ProfileQRCode)

  /**
   * Settings screens
   */
  registerComponentWithRedux(redux)(SCREENS.UPortId, UPortId)
  registerComponentWithRedux(redux)(SCREENS.TryUport, TryUport)
  registerComponentWithRedux(redux)(SCREENS.Device, Device)
  registerComponentWithRedux(redux)(SCREENS.Hub, Hub)
  registerComponentWithRedux(redux)(SCREENS.Status, Status)
  registerComponentWithRedux(redux)(SCREENS.Network, Network)

  /**
   * Backup & Recovery screens
   */

  registerComponentWithRedux(redux)(SCREENS.BACKUP.DataBackupInstructions, DataBackupInstructions)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.DataBackupSuccess, DataBackupSuccess)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.CreateSeedInstructions, CreateSeedInstructions)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.CreateSeedPhrase, CreateSeedPhrase)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.CreateSeedPhraseConfirm, CreateSeedPhraseConfirm)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.CreateSeedSuccess, CreateSeedSuccess)

  registerComponentWithRedux(redux)(SCREENS.RECOVERY.RestoreSeedInstructions, RestoreSeedInstructions)
  registerComponentWithRedux(redux)(SCREENS.RECOVERY.RestoreSeedPhrase, RestoreSeedPhrase)
  registerComponentWithRedux(redux)(SCREENS.RECOVERY.RestoreSeedSuccess, RestoreSeedSuccess)
}
