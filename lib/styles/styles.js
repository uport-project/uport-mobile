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
import { StyleSheet, Platform, Dimensions, DeviceInfo } from 'react-native'
import metrics from './metrics'
import { lightColors, darkColors } from './colors'

const createStyles = ( colors ) => {
  const style = {
    // Views
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 10
    },
    contentContainer: {
      padding: metrics.spacing.horizontal.medium
    },
    brandContainer: {
      backgroundColor: colors.brand,
    },
    opaqueContainer: {
      backgroundColor: colors.background,
    },
    homeContainer: {
      flex: 1,
      backgroundColor: colors.secondaryBackground
    },
    homeTopContainer: {
      flex: 0,
      backgroundColor: colors.background,
      shadowColor: 'rgb(0,0,0)',
      shadowOffset: {width: 1, height: 2},
      shadowOpacity: 0.1,
      borderRadius: 3
    },
    lightBoxCardContainer: {
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderWidth: 1,
      borderColor: 'transparent',
      paddingBottom: DeviceInfo.isIPhoneX_deprecated ? 35 : 15
    },
    lightboxCard: {
      backgroundColor: 'white',
      position: 'absolute',
      bottom: 0,
      justifyContent: 'center',
      //maxHeight: Dimensions.get('window').height * 0.8,
      width: '100%',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16
    },
    row: {
      flex: 1,
      flexDirection: 'row',
    },
    column: {
      flex: 1,
      flexDirection: 'column',
    },
    infoBox: {
      marginTop: metrics.spacing.vertical.extraLarge,
      marginLeft: metrics.spacing.horizontal.extraLarge,
      marginRight: metrics.spacing.horizontal.extraLarge,
    },
    navBar: {
      flexDirection: 'row',
      marginTop:  Platform.OS === 'ios' ? metrics.spacing.vertical.large + ( Dimensions.get('window').height === 812 ? 20 : 0 ) : metrics.spacing.vertical.small,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navBarButton: {
      minHeight: metrics.navBar.button,
      minWidth: metrics.navBar.button,
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: metrics.spacing.horizontal.medium,
      paddingRight: metrics.spacing.horizontal.medium,
    },


    // Text styles
    h1: {
      fontSize: metrics.font.size.extraLarge,
      fontFamily: metrics.font.name.extraBold,
      lineHeight: metrics.font.lineHeight.extraLarge,
      textAlign: 'left',
      color: colors.primary,
      marginTop: metrics.spacing.vertical.large,
      marginBottom: metrics.spacing.vertical.medium
    },
    title: {
      fontSize: metrics.font.size.large,
      fontFamily: metrics.font.name.regular,
      lineHeight: metrics.font.lineHeight.large,
      textAlign: 'center',
      color: colors.primary,
      marginTop: metrics.spacing.vertical.large,
      marginBottom: metrics.spacing.vertical.extraLarge
    },
    subTitle: {
      fontSize: metrics.font.size.small,
      fontFamily: metrics.font.name.bold,
      lineHeight: metrics.font.lineHeight.small,
      textAlign: 'center',
      color: colors.secondary,
      marginTop: -metrics.spacing.vertical.extraLarge,
      marginBottom: metrics.spacing.vertical.large
    },
    p: {
      fontSize: metrics.font.size.medium,
      fontFamily: metrics.font.name.regular,
      lineHeight: metrics.font.lineHeight.medium,
      textAlign: 'center',
      color: colors.primary,
      marginBottom: metrics.spacing.vertical.medium
    },
    li: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      flex: 1,
      marginLeft: metrics.spacing.horizontal.medium,
    },
    liText: {
      flex: 1,
      marginLeft: metrics.spacing.horizontal.small,
    },
    bold: {
      fontFamily: metrics.font.name.bold,
    },
    noMargin: {
      marginBottom: 0,
    },
    legal: {
      fontSize: metrics.font.size.medium,
      fontFamily: metrics.font.name.regular,
      lineHeight: metrics.font.lineHeight.medium,
      color: colors.primary,
      marginBottom: metrics.spacing.vertical.medium
    },
    invert: {
      color: colors.primaryInverted,
    },
    brand: {
      color: colors.brand,
    },
    secondary: {
      color: colors.secondary,
    },
    default: {
      color: colors.primary,
    },
    sectionTitle: {
      color: colors.secondary,
    },

    // Notifications
    notifications: {
      flex: 0,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.brand,
      borderRadius: 12,
      height: 24,
      justifyContent: 'center',
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 10,
      paddingLeft: 10,
    },
    notificationText: {
      color: colors.primaryInverted,
      fontFamily: metrics.font.name.light,
      fontSize: metrics.font.size.small,
    },

    //Tab bar
    tabBar: {
      flexDirection: 'row',
      paddingRight: metrics.spacing.horizontal.medium,
      paddingLeft: metrics.spacing.horizontal.medium,
    },

    tabBarButton: {
      paddingTop: metrics.spacing.vertical.medium,
      paddingBottom: metrics.spacing.vertical.medium,
      marginRight: metrics.spacing.horizontal.large,
    },

    tabBarButtonActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.brand,
      opacity: 1,
    },
    tabBarButtonInActive: {
      opacity: 0.7,
    },


    //MenuItem
    menuItem: {
      borderBottomColor: colors.border,
      borderBottomWidth: metrics.borderWidth.small,
      borderTopColor: colors.border,
      borderTopWidth: metrics.borderWidth.small,
      marginRight: -metrics.spacing.horizontal.medium,
      paddingRight: metrics.spacing.horizontal.medium,
      height: metrics.buttonHeight,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'      
    },
    menuItemLabel: {
      fontSize: metrics.font.size.medium,
      fontFamily: metrics.font.name.regular,
      color: colors.primary,
    },

    // TextInput
    textInputLabel: {
      fontSize: metrics.font.size.small,
      fontFamily: metrics.font.name.bold,
      color: colors.secondary,
      marginBottom: metrics.spacing.vertical.small,
    },
    textInputPrefixLabel: {
      fontSize: metrics.font.size.medium,
      fontFamily: metrics.font.name.regular,
      color: colors.brand,
      marginRight: metrics.spacing.horizontal.medium,
    },
    textInputWrapper: {
      borderWidth: metrics.borderWidth.small,
      borderRadius: metrics.borderRadius.medium,
      borderColor: colors.border,
      paddingLeft: metrics.spacing.horizontal.medium, 
      paddingRight: metrics.spacing.horizontal.medium, 
      marginBottom: metrics.spacing.vertical.large,
      height: metrics.buttonHeight,
      flexDirection: 'row',
    },
    textInputWrapperMultiline: {
      paddingTop: metrics.spacing.vertical.medium,
      paddingBottom: metrics.spacing.vertical.medium,
      height: metrics.buttonHeight * 1.5
    },
    textInputPrefixButton: {
      justifyContent: 'center',      
      marginLeft: -metrics.spacing.horizontal.medium,
      paddingLeft: metrics.spacing.horizontal.medium,
      borderRadius: metrics.borderRadius.medium,
      
    },
    textInput: {
      flex: 1,
      color: colors.primary,
      fontSize: metrics.font.size.medium,
      fontFamily: metrics.font.name.regular,
    },
    textInputMultiline: {
      flex: 1,
    },
    tabBarLabel: {
      color: colors.primary,
    },

    // Home flat list
    listRow: {
      marginLeft: metrics.spacing.horizontal.medium,
      marginRight: metrics.spacing.horizontal.medium,
      marginTop: metrics.spacing.vertical.medium,
      paddingLeft: metrics.spacing.horizontal.medium,
      paddingRight: metrics.spacing.horizontal.medium,
      paddingTop: metrics.spacing.vertical.medium,
      paddingBottom: metrics.spacing.vertical.medium,
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: 'rgb(0,0,0)',
      shadowOffset: {width: 1, height: 2},
      shadowOpacity: 0.1,    
      borderRadius: 3,  
    },

    listItemAvatar: {
      marginRight: metrics.spacing.horizontal.medium,
    },

    //Buttons
    infoButtonLabel: {
      fontSize: metrics.font.size.medium,
      fontFamily: metrics.font.name.regular,
      lineHeight: metrics.font.lineHeight.medium,
      textAlign: 'center',
      color: colors.brand,
      marginBottom: metrics.spacing.vertical.medium
    },

    invertedButton: {
      borderColor: colors.primaryInverted,
      borderWidth: metrics.borderWidth.medium,     
      height: metrics.buttonHeight, 
      alignItems: 'center',
    },
    invertedMainButton: {
      backgroundColor: colors.primaryInverted,
      height: metrics.buttonHeight, 
      alignItems: 'center',
      marginLeft: 0,
    },

    //Checkbox
    checkBoxWrapper: {
      flexDirection: 'row',
      backgroundColor: colors.secondaryBackground,
      paddingLeft: metrics.spacing.horizontal.medium,
      paddingRight: metrics.spacing.horizontal.medium * 2,

      paddingTop: metrics.spacing.vertical.large,
      paddingBottom: metrics.spacing.vertical.large,

      marginLeft: -metrics.spacing.horizontal.medium,
      marginRight: -metrics.spacing.horizontal.medium,

      marginTop: metrics.spacing.vertical.medium,
    },

    checkBox: {
      height: metrics.checkBoxHeight,
      width: metrics.checkBoxHeight,
      borderRadius: metrics.borderRadius.small,
      borderWidth: metrics.borderWidth.medium,
      borderColor: colors.brand,
      marginRight: metrics.spacing.horizontal.medium,
      marginTop: metrics.spacing.vertical.medium,
    },

    checkBoxChecked: {
      backgroundColor: colors.brand,
    },

    checkBoxLabel: {
      textAlign: 'left',
      color: colors.primary,
      fontSize: metrics.font.size.medium,
      fontFamily: metrics.font.name.regular,
      lineHeight: metrics.font.lineHeight.medium,
      flex: 1,
    },

    // Seed phrase
    seedPhraseCard: {
      backgroundColor: colors.brand,
      borderRadius: metrics.borderRadius.small,
      paddingRight: metrics.spacing.horizontal.medium,
      paddingLeft: metrics.spacing.horizontal.medium,
      paddingTop: metrics.spacing.vertical.large,
      paddingBottom: metrics.spacing.vertical.large,
      marginBottom: metrics.spacing.vertical.medium,
    },
    seedPhraseCardColumnWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    seedPhraseTitle: {
      color: colors.primaryInverted,
      fontSize: metrics.font.size.regular,
      fontFamily: metrics.font.name.bold,
      marginBottom: metrics.spacing.vertical.large,
      flex: 1,
      textAlign: 'center',
    },
    seedPhraseWord: {
      fontFamily: metrics.font.monospace,
      fontSize: metrics.font.size.medium,
      fontWeight: '900',
      color: colors.primaryInverted,
      marginBottom: metrics.spacing.vertical.small * 2,
    },
    seedPhraseNumber: {
      fontFamily: metrics.font.monospace,
      fontSize: metrics.font.size.medium,
      fontWeight: '900',
      color: colors.primaryInverted,
      opacity: 0.6,
      marginBottom: metrics.spacing.vertical.small * 2,
      marginRight: metrics.spacing.horizontal.small,
      width: 40,
      textAlign: 'right',
    },

    seedConfirmWrapper: {
      backgroundColor: colors.secondaryBackground,
      paddingLeft: metrics.spacing.horizontal.medium,
      paddingRight: metrics.spacing.horizontal.medium,
      paddingTop: metrics.spacing.vertical.large,
      paddingBottom: metrics.spacing.vertical.large,
      marginLeft: -metrics.spacing.horizontal.medium,
      marginRight: -metrics.spacing.horizontal.medium,
      marginTop: metrics.spacing.vertical.small,
    },

    seedConfirmSelectedWordsWrapper: {
      backgroundColor: colors.background,
      paddingLeft: metrics.spacing.horizontal.medium,
      paddingRight: metrics.spacing.horizontal.medium,
      paddingBottom: metrics.spacing.vertical.large,
      marginLeft: -metrics.spacing.horizontal.medium,
      marginRight: -metrics.spacing.horizontal.medium,

      // marginTop: metrics.spacing.vertical.medium,
    },

    seedConfirmButtonRow: {
      justifyContent: 'center',
      alignItems: 'stretch',
      flexDirection: 'row',
    },
    seedConfirmButton: {
      flex: 1,
      borderWidth: metrics.borderWidth.small,
      borderColor: colors.border,
      borderRadius: metrics.borderRadius.small,
      backgroundColor: colors.background,
      marginRight: metrics.spacing.horizontal.small,
      marginLeft: metrics.spacing.horizontal.small,
      marginTop: metrics.spacing.vertical.small,
      marginBottom: metrics.spacing.vertical.small,
      paddingLeft: metrics.spacing.horizontal.small,
      paddingRight: metrics.spacing.horizontal.small,
      paddingTop: metrics.spacing.vertical.small,
      paddingBottom: metrics.spacing.vertical.small,
    },
    seedConfirmButtonEmpty: {
      backgroundColor: colors.border,
    },
    seedConfirmButtonLabel: {
      fontSize: metrics.font.size.regular,
      color: colors.primary,
      textAlign: 'center',
      marginTop: metrics.spacing.vertical.small,
      marginBottom: metrics.spacing.vertical.small,
    },
    seedRecoverySuggestedWords: {
      flexDirection: 'row',
      flex: 1,
      flexWrap: 'wrap',
      marginTop: -metrics.spacing.vertical.medium,
    },
    seedRecoveryWordButton: {
      borderWidth: metrics.borderWidth.small,
      borderColor: colors.border,
      borderRadius: metrics.borderRadius.small,
      backgroundColor: colors.background,
      marginRight: metrics.spacing.horizontal.small,
      marginBottom: metrics.spacing.vertical.small,
      paddingLeft: metrics.spacing.horizontal.small,
      paddingRight: metrics.spacing.horizontal.small,
      paddingTop: metrics.spacing.vertical.small,
      paddingBottom: metrics.spacing.vertical.small,
      // height: 44,
    },    

    statusBar: {
      color: 'white',
      fontSize: 11,
    },

    sectionWrapper: {
      borderRadius: metrics.borderRadius.small,
      marginBottom: metrics.spacing.vertical.medium,
      marginTop: metrics.spacing.vertical.small,
      backgroundColor: colors.background,
      shadowColor: 'rgb(63,63,63)',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,    
    },
    nestedInfoItem: {
      flexDirection: 'row',
      padding: metrics.spacing.horizontal.medium,
    },
    nestedInfoItemSpacer: {
      borderBottomWidth: metrics.borderWidth.small,
      borderBottomColor: colors.border,
    },
    nestedIndfoCount: {
      backgroundColor: colors.border,
      paddingTop: 5,
      paddingBottom: 5,
      paddingRight: 10,
      paddingLeft: 10,
      borderRadius: 15,
      alignSelf: 'center'
    }


  }
  return StyleSheet.create(style)
}

export const darkStyles = createStyles(darkColors)
export const lightStyles = createStyles(lightColors)