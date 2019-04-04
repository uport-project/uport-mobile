/**
 * Screens
 */
import { Navigation } from 'react-native-navigation'
import SCREENS from './Screens'

/**
 * Screen components
 */

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
 * @TODO Refactor all screens registers to use require
 */
const registerComponentWithRedux = (redux: any) => (name: string, component: any) => {
  Navigation.registerComponentWithRedux(name, () => component, redux.Provider, redux.store)
}

export function registerScreens(redux: any) {
  /**
   * Top level screens
   */
  registerComponentWithRedux(redux)(SCREENS.Credentials, require('./Credentials').default)
  registerComponentWithRedux(redux)(SCREENS.Credential, require('./Credential').default)
  registerComponentWithRedux(redux)(SCREENS.Contacts, require('./Contacts').default)
  registerComponentWithRedux(redux)(SCREENS.Contact, require('./Contact').default)
  registerComponentWithRedux(redux)(SCREENS.ShareContact, require('./ShareContact').default)
  registerComponentWithRedux(redux)(SCREENS.Account, require('./Account').default)
  registerComponentWithRedux(redux)(SCREENS.Notifications, require('./Notifications').default)
  registerComponentWithRedux(redux)(SCREENS.Settings, require('./Settings').default)
  registerComponentWithRedux(redux)(SCREENS.Profile, require('./Profile').default)
  registerComponentWithRedux(redux)(SCREENS.DesignSystem, require('./DesignSystem').default)
  registerComponentWithRedux(redux)(SCREENS.Scanner, require('./Scanner').default)

  /**
   * Onboarding screens
   */
  registerComponentWithRedux(redux)(SCREENS.Welcome, require('./onboarding/Welcome').default)
  registerComponentWithRedux(redux)(SCREENS.Learn, require('./onboarding/Learn').default)
  registerComponentWithRedux(redux)(SCREENS.CreateIdentity, require('./onboarding/CreateIdentity').default)
  registerComponentWithRedux(redux)(SCREENS.Terms, require('./onboarding/Terms').default)
  registerComponentWithRedux(redux)(SCREENS.Privacy, require('./onboarding/Privacy').default)

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

  registerComponentWithRedux(redux)(SCREENS.Request, require('../components/Request/index').default)
  registerComponentWithRedux(redux)(SCREENS.NewRequest, require('../components/newRequest/index').default)

  registerComponentWithRedux(redux)(SCREENS.NestedInfo, require('../components/shared/NestedInfo').default)
}
