/**
 * Screens
 */
import { Navigation } from 'react-native-navigation'
import SCREENS, { COMPONENTS } from './Screens'
import { Toast } from '@kancha'

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
  registerComponentWithRedux(redux)(SCREENS.SecurityBlock, require('./onboarding/SecurityBlock').default)

  /**
   * Modal screens
   */
  registerComponentWithRedux(redux)(SCREENS.ProfileQRCode, require('uPortMobile/lib/components/shared/QRCodeModal').default)
  registerComponentWithRedux(redux)(SCREENS.MarketPlace, require('../screens/MarketPlace').default)

  /**
   * Settings screens
   */
  registerComponentWithRedux(redux)(SCREENS.UPortId, require('../screens/settings/UportId').default)
  registerComponentWithRedux(redux)(SCREENS.TryUport, require('../screens/settings/TryUport').default)
  registerComponentWithRedux(redux)(SCREENS.Device, require('../screens/settings/Device').default)
  registerComponentWithRedux(redux)(SCREENS.Hub, require('../screens/settings/HubStatus').default)
  registerComponentWithRedux(redux)(SCREENS.Status, require('../screens/settings/StatusMessages').default)
  registerComponentWithRedux(redux)(SCREENS.Network, require('../screens/settings/Network').default)

  /**
   * Backup & Recovery screens
   */
  registerComponentWithRedux(redux)(SCREENS.BACKUP.DataBackupInstructions, require('../components/Backup/DataBackupInstructions').default)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.DataBackupSuccess, require('../components/Backup/DataBackupSuccess').default)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.CreateSeedInstructions, require('../components/Backup/SeedBackupInstructions').default)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.CreateSeedPhrase, require('../components/Backup/SeedBackupPhrase').default)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.CreateSeedPhraseConfirm, require('../components/Backup/SeedBackupConfirm').default)
  registerComponentWithRedux(redux)(SCREENS.BACKUP.CreateSeedSuccess, require('../components/Backup/SeedBackupSuccess').default)

  registerComponentWithRedux(redux)(SCREENS.RECOVERY.RestoreSeedInstructions, require('../components/Recovery/SeedRecoveryInstructions').default)
  registerComponentWithRedux(redux)(SCREENS.RECOVERY.RestoreSeedPhrase, require('../components/Recovery/SeedRecoveryPhrase').default)
  registerComponentWithRedux(redux)(SCREENS.RECOVERY.RestoreSeedSuccess, require('../components/Recovery/SeedRecoverySuccess').default)


  registerComponentWithRedux(redux)(SCREENS.Request, require('../components/Request/index').default)
  registerComponentWithRedux(redux)(SCREENS.NewRequest, require('../components/newRequest/index').default)
  registerComponentWithRedux(redux)(SCREENS.NestedInfo, require('../components/shared/NestedInfo').default)

  /**
   * Migration screens
   */
  registerComponentWithRedux(redux)(SCREENS.MIGRATION.Complete, require('../components/Migrations/MigrationComplete').default)
  registerComponentWithRedux(redux)(SCREENS.MIGRATION.Legacy, require('../components/Migrations/LegacyMigration').default)

  /**
   * Dummy screens
   */
  registerComponentWithRedux(redux)(SCREENS.Dummy, require('../screens/Blank').default)
  registerComponentWithRedux(redux)(SCREENS.StaticRequest, require('../screens/requests/Request').default)

  /**
   * Register single compoent for use in overlay
   */
  Navigation.registerComponent(COMPONENTS.Toast, () => Toast)
}
