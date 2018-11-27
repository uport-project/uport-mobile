// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//


import { Navigation } from 'react-native-navigation'

// register all screens of the app (including internal ones)
export function registerScreens (store, Provider, navigator = Navigation) {
  navigator.registerComponent('onboarding.securityBlock', () => require('./components/Onboarding/OnboardingSecurityBlock').default, store, Provider)// OnboardingSecurityBlock,
  navigator.registerComponent('onboarding.start', () => require('./components/Onboarding/OnboardingStart').default, store, Provider) // OnboardingStart,
  navigator.registerComponent('onboarding.info', () => require('./components/Onboarding/OnboardingInfo').default, store, Provider) // OnboardingInfo,
  navigator.registerComponent('onboarding.terms', () => require('./components/Onboarding/OnboardingTerms').default, store, Provider) // OnboardingTerms,
  navigator.registerComponent('onboarding.avatar', () => require('./components/Onboarding/OnboardingAvatar').default, store, Provider) // OnboardingAvatar,
  navigator.registerComponent('onboarding.testnetWarning', () => require('./components/Onboarding/OnboardingTestnetWarning').default, store, Provider) // OnboardingTestnetWarning,
  navigator.registerComponent('onboarding.notifications', () => require('./components/Onboarding/OnboardingNotifications').default, store, Provider) // OnboardingNotifications,
  navigator.registerComponent('onboarding.complete', () => require('./components/Onboarding/OnboardingComplete').default, store, Provider) // OnboardingComplete,
  navigator.registerComponent('onboarding.selectCountry', () => require('./components/Onboarding/CountrySelectorModal').default, store, Provider) // CountrySelectorModal,
  navigator.registerComponent('onboarding.optout', () => require('./components/Onboarding/OnboardingOptOut').default, store, Provider) // AnalyticsOptOut,
  navigator.registerComponent('migrations.PreHD', () => require('./components/Migrations/PreHdMigration').default, store, Provider) // PreHdMigration
  navigator.registerComponent('contacts.list', () => require('./components/Contacts/ContactsList').default, store, Provider) // ContactsList,
  navigator.registerComponent('uport.home', () => require('./components/Home/Home').default, store, Provider) // Home,
  navigator.registerComponent('uport.notificationsButton', () => require('./components/shared/Notifications').default, store, Provider) // Home,
  navigator.registerComponent('uport.scanner', () => require('./components/Scanner/index').default, store, Provider) // Scanner,
  navigator.registerComponent('uport.more', () => require('./components/More').default, store, Provider) // More,
  navigator.registerComponent('uport.advanced', () => require('./components/Advanced/Advanced').default, store, Provider) // Advanced,

  navigator.registerComponent('advanced.uport', () => require('./components/Advanced/UportId').default, store, Provider) // UportId,
  navigator.registerComponent('advanced.device', () => require('./components/Advanced/Device').default, store, Provider) // Device,
  navigator.registerComponent('advanced.network', () => require('./components/Advanced/Network').default, store, Provider) // Network,
  navigator.registerComponent('advanced.status', () => require('./components/Advanced/StatusMessages').default, store, Provider) // StatusMessages,
  navigator.registerComponent('advanced.hub', () => require('./components/Advanced/HubStatus').default, store, Provider) // HubStatus,
  navigator.registerComponent('advanced.network', () => require('./components/Advanced/Network').default, store, Provider) // Network,
  navigator.registerComponent('advanced.try-uport', () => require('./components/Advanced/TryUport').default, store, Provider) // TryUport,
  navigator.registerComponent('advanced.keychain', () => require('./components/Advanced/SeedAddresses').default, store, Provider) // SeedAddresses,

  navigator.registerComponent('uport.myInfo', () => require('./components/MyInfo/MyInformation').default, store, Provider) // MyInfo,
  navigator.registerComponent('uport.contactInfo', () => require('./components/MyInfo/Viewer').default, store, Provider)
  navigator.registerComponent('scanner.cameraAuthLightbox', () => require('./components/Scanner/CameraAuthLightbox').default, store, Provider) // CameraAuthLightbox,
  navigator.registerComponent('uport.verifications', () => require('./components/Verifications/Verifications').default, store, Provider) // Verifications,
  navigator.registerComponent('uport.verificationCard', () => require('./components/Verifications/VerificationCard').default, store, Provider) // VerificationCard,
  navigator.registerComponent('verifications.deleteLightbox', () => require('./components/Verifications/DeleteLightbox').default, store, Provider) // DeleteLightbox,
  navigator.registerComponent('uport.accounts', () => require('./components/Accounts/index').default, store, Provider) // Accounts,
  navigator.registerComponent('uport.accountFunding', () => require('./components/Accounts/AccountFunding').default, store, Provider)
  navigator.registerComponent('uport.accountInfo', () => require('./components/Accounts/AccountInfo').default, store, Provider) // AccountInfo,
  navigator.registerComponent('uport.accountInfoTestnetWarning', () => require('./components/Accounts/AccountInfoTestnetWarning').default, store, Provider) // AccountInfoTestnetWarning,
  navigator.registerComponent('uport.notifications', () => require('./components/Notifications/index').default, store, Provider) // Notifications,
  navigator.registerComponent('settings.main', () => require('./components/Settings/index').default, store, Provider) // SettingsRoot,
  navigator.registerComponent('settings.privacy', () => require('./components/Settings/PrivacyPolicy').default, store, Provider) // PrivacyPolicy,
  navigator.registerComponent('settings.terms', () => require('./components/Settings/TermsAndConditions').default, store, Provider) // TermsAndConditions,

  // 'recovery.seed': SeedBackup,
  navigator.registerComponent('request.root', () => require('./components/Request/index').default, store, Provider) // Request,
  
  navigator.registerComponent('design.main', () => require('./components/DesignSystem/DesignSystemMain').default, store, Provider) // DesignSystemMain,

  navigator.registerComponent('backup.seedInstructions', () => require('./components/Backup/SeedBackupInstructions').default, store, Provider) // SeedBackupInstructions,
  navigator.registerComponent('backup.seedPhrase', () => require('./components/Backup/SeedBackupPhrase').default, store, Provider) // SeedBackupPhrase,
  navigator.registerComponent('backup.seedConfirm', () => require('./components/Backup/SeedBackupConfirm').default, store, Provider) // SeedBackupConfirm,
  navigator.registerComponent('backup.seedSuccess', () => require('./components/Backup/SeedBackupSuccess').default, store, Provider) // SeedBackupSuccess,

  navigator.registerComponent('recovery.seedInstructions', () => require('./components/Recovery/SeedRecoveryInstructions').default, store, Provider) // SeedRecoveryInstructions,
  navigator.registerComponent('recovery.seedPhrase', () => require('./components/Recovery/SeedRecoveryPhrase').default, store, Provider) // SeedRecoveryPhrase,
  navigator.registerComponent('recovery.seedSuccess', () => require('./components/Recovery/SeedRecoverySuccess').default, store, Provider) // SeedRecoverySuccess,
  
  navigator.registerComponent('backup.dataInstructions', () => require('./components/Backup/DataBackupInstructions').default, store, Provider) // SeedRecoverySuccess,
  navigator.registerComponent('backup.dataSuccess', () => require('./components/Backup/DataBackupSuccess').default, store, Provider) // SeedRecoverySuccess,

  navigator.registerComponent('debug.main', () => require('./components/Debug/DebugMain').default, store, Provider) // DebugMain

  navigator.registerComponent('uport.QRCodeModal', () => require('./components/shared/QRCodeModal').default, store, Provider)
  navigator.registerComponent('uport.nestedInfo', () => require('./components/shared/NestedInfo').default, store, Provider)

  navigator.registerComponent('newRequest.root', () => require('./components/newRequest/index').default, store, Provider)

}
