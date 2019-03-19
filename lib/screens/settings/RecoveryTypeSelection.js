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
// // Frameworks
// import React from 'react'
// import { Text, View, TouchableHighlight, Image, StyleSheet, Alert } from 'react-native'
//
// // Styles
// import globalStyles, {widthRatio, heightRatio, colors, font} from 'uPortMobile/lib/styles/globalStyles'
// const styles = StyleSheet.create({
//   arrow: {
//     width: widthRatio(8.1),
//     height: heightRatio(13.3),
//     marginRight: widthRatio(19.6)
//   },
//   body: {
//     flexDirection: 'column',
//     height: heightRatio(587),
//     justifyContent: 'space-between'
//   },
//   headerIcon: {
//     width: widthRatio(18),
//     height: heightRatio(14),
//     marginLeft: widthRatio(31)
//   },
//   headerRow: {
//     marginTop: 20,
//     height: heightRatio(60),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between'
//   },
//   headerTitle: {
//     fontFamily: font,
//     fontWeight: '500',
//     color: colors.uportBlue,
//     letterSpacing: 1.89,
//     lineHeight: 20,
//     fontSize: 17
//   }
// })
//
// // Constants
// const socialRecoveryRoute = {
//   type: 'push',
//   route: {
//     key: 'socialRecovery'
//   }
// }
//
// const seedRecoveryRoute = {
//   type: 'push',
//   route: {
//     key: 'seedBackup'
//   }
// }
//
// class RecoveryTypeSelection extends React.Component {
//   constructor (props) {
//     super()
//     this.state = {
//       keyboardHeight: 0
//     }
//   }
//   handleSocialRecoveryChoice (props) {
//     if (this.props.connections.length < 1) {
//       console.log('Make some friends!')
//       Alert.alert(
//         'Social Recovery',
//         'You need some connections to set as recovery delegates first! ',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               console.log('Need more friends')
//             }
//           }
//         ]
//       )
//     } else {
//       this.props._handleNavigate(socialRecoveryRoute)
//     }
//   }
//   handleSeedPress (props) {
//     this.props._handleNavigate(seedRecoveryRoute)
//   }
//
//   render () {
//     return (
//       <View style={[globalStyles.container, {backgroundColor: colors.grey}]}>
//         {/* Header */}
//         <View style={styles.headerRow}>
//           <TouchableHighlight style={globalStyles.headerButton} onPress={this.props._handleBackAction} underlayColor='rgba(255, 255, 255, 0.0)'>
//             <Image style={styles.headerIcon} source={require('uPortMobile/assets/images/Back.png')} />
//           </TouchableHighlight>
//           <Text style={styles.headerTitle}>SELECT RECOVERY TYPE</Text>
//           <View style={globalStyles.headerButtonPlaceholder} />
//         </View>
//         {/* Body */}
//         <View style={styles.body}>
//           <View>
//             {/* <TouchableHighlight onPress={() => this.handleSocialRecoveryChoice()} underlayColor='rgba(0,0,0,0)'>
//               <View style={[globalStyles.claimListItem, globalStyles.listItem, {alignItems: 'center'}]}>
//                 <Text style={globalStyles.claimListType}>SOCIAL RECOVERY</Text>
//                 <Image style={styles.arrow} source={require('uPortMobile/assets/images/arrow.png')} />
//               </View>
//             </TouchableHighlight> */}
//             <TouchableHighlight onPress={() => this.handleSeedPress()} underlayColor='rgba(0,0,0,0)'>
//               <View style={[globalStyles.claimListItem, globalStyles.listItem, {alignItems: 'center'}]}>
//                 <Text style={globalStyles.claimListType}>SEED RECOVERY</Text>
//                 <Image style={styles.arrow} source={require('uPortMobile/assets/images/arrow.png')} />
//               </View>
//             </TouchableHighlight>
//           </View>
//         </View>
//       </View>
//     )
//   }
// }
//
// export default RecoveryTypeSelection
