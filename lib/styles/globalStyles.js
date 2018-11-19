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
import {
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native'

export const platform = Platform.select
export const windowWidth = Dimensions.get('window').width
export const windowHeight = Dimensions.get('window').height
export const widthRatio = (width) => (
  windowWidth * (width / 375)
)
export const heightRatio = (height) => (
  windowHeight * (height / 667)
)

const brandColor = `rgba(92,80,202,1)`

export const colors = {
  // darkBlue: `rgba(39,91,195,1)`,
  // blue: `rgba(26,91,222,1)`,
  white246: `rgba(246,247,248,1)`,
  // white252: `rgba(252,252,253,1)`,
  // white233: 'rgba(233,233,233,1)',
  white226: 'rgba(226,226,226,1)',
  white216: 'rgba(216,216,216,1)',
  // darkPurple: `rgba(69,68,123,1)`,
  // royalPurple: `rgba(88,71,159,1)`,
  red: 'rgba(231, 76, 60, 1)',
  purple: brandColor,
  lightPurple: `rgba(91,84,199,1)`,
  translucentPurple: 'rgba(92, 80, 202, 0.3)',
  translucentGrey: 'rgba(252,252,253,0.7)',
  green: 'rgba(54,184,123,1)',
  orange: 'rgba(242,112,28,1)',
  // lightGray: '#F6F7F8',
  grey216: 'rgba(216,216,216,1)',
  grey185: 'rgba(185, 185, 185, 1)',
  grey170: 'rgba(170,170,170,1)',
  grey155: 'rgba(155,155,155,1)',
  grey130: 'rgba(130,130,130,1)',
  grey91: 'rgba(91,91,91,1)',
  grey74: 'rgba(74,74,74,1)',
  slate: 'rgba(30,30,30,1)',
  white: '#FFFFFF',
  brand: brandColor,
  brandBg: 'rgba(244,243,252,1)',
  warning: 'rgba(242,112,28,1)',
  warningBg: 'rgba(255,246,238,1)'
}
// export const font = 'NunitoSans-Regular'
// export const fontBold = 'NunitoSans-Bold'
// export const fontLight = 'NunitoSans-Light'

export const onboardingStyles = StyleSheet.create({
  scrollViewContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 15,
    paddingTop: windowHeight > 600 ? 50 : 15,
  },
  processCardContainer: {
    flex: 1,
    // backgroundColor: colors.white,
    // marginTop: Platform.OS === 'ios' ? 20 : 0
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: windowHeight > 600 ? 50 : 30,
    padding: 30,
    paddingBottom: Platform.OS === 'android' && windowHeight < 600 ? 5 : 15
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    color: colors.grey74,
    marginBottom: 16
  },
  subTitle: {
    fontSize: 12,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.grey74,
    marginBottom: 16,
    marginTop: -16
  },
  p: {
    color: colors.grey74,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 10
  },  
})

const globalStyles = StyleSheet.create({
  infoList: {
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: colors.white
  },
  infoListItem: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: colors.white226,
    padding: 19
  },
  infoType: {
    color: colors.grey170,
    fontSize: 14,
    lineHeight: 17,
    margin: 2
  },
  infoValue:
  {
    color: colors.grey74,
    fontSize: 16,
    lineHeight: 20,
    height: 22,
    margin: 2
  },
  menu: {
    backgroundColor: colors.white246,
    flex: 0
  },
  menuGroup: {
    borderBottomColor: colors.white216,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white216,
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  menuItemText: {
    color: colors.grey74,
    fontSize: 17,
    lineHeight: 22,
  },
  danger: {
    color: colors.red // 'rgba(245,72,125,1)'
  },
  menuItemTextRight: {
    color: colors.grey74,
    fontSize: 14,
    lineHeight: 22
  },
  emptyAvatar: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: colors.lightPurple
  },
  modalButtonRow: {
    marginTop: 30,
    marginBottom: -30,
    marginRight: -30,
    marginLeft: -30,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: colors.white216,
  },
  modalButton: {
    flex: 1,
    height: 57,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalButtonFirst: {
    borderRightColor: colors.white216,
    borderRightWidth: 0.5
  },  
})

export const textStyles = StyleSheet.create({
  p: {
   
    color: colors.grey74,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center'
  },
  small: { 
    color: colors.grey155,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center'
  },
  h1: { // placeholder
    color: colors.grey74,
    fontSize: 24,
    lineHeight: 33,
    textAlign: 'center'
  },
  h2: {
    color: colors.grey74,
    fontSize: 20,
    lineHeight: 27,
    textAlign: 'center'
  },
  buttonLabel: {
    color: colors.brand,
  },
  
})

export default globalStyles
