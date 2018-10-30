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
// import React from 'react'
// import { connect } from 'react-redux'
// import {
//   ActivityIndicator,
//   Animated,
//   Platform,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableHighlight,
//   View
// } from 'react-native'
// import { toJs } from 'mori'
// // Selectors
// import { externalProfile } from 'uPortMobile/lib/selectors/requests'
// import { activitiesByAddress } from 'uPortMobile/lib/selectors/activities'
// import { requestedClaims } from 'uPortMobile/lib/selectors/attestations'
// import { isRecoveryDelegate } from 'uPortMobile/lib/selectors/recovery'
//
// // Actions
// import { selectRequest, cancelRequest, authorizeRequest } from 'uPortMobile/lib/actions/requestActions'
// import { openActivity, refreshExternalUport } from 'uPortMobile/lib/actions/uportActions'
//
// // Constants - These must be defined before the styles
// const HEADER_MAX_HEIGHT = heightRatio(255)
// const HEADER_MIN_HEIGHT = heightRatio(80)
// const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT
// // Styles
// import {heightRatio, widthRatio, font, colors, windowHeight} from 'uPortMobile/lib/styles/globalStyles'
// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'column-reverse',
//     backgroundColor: colors.grey
//   },
//   fill: {
//     flex: 1
//   },
//   header: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0
//   },
//   informationCard: {
//     width: widthRatio(355),
//     backgroundColor: '#ffffff',
//     alignItems: 'center',
//     borderRadius: Platform.OS === 'android' ? 0 : 4,
//     shadowColor: 'rgb(0,0,0)',
//     shadowOpacity: 0.1,
//     shadowOffset: {width: 0, height: 1}
//   },
//   informationCardRow: {
//     width: widthRatio(325),
//     height: heightRatio(69),
//     borderColor: colors.softGrey,
//     borderBottomWidth: 1,
//     justifyContent: 'center'
//   },
//   informationCardType: {
//     fontSize: 13,
//     fontFamily: font,
//     fontWeight: '500',
//     letterSpacing: 1,
//     lineHeight: 15,
//     color: colors.uportBlack
//   },
//   informationCardValue: {
//     marginTop: heightRatio(3),
//     fontFamily: font,
//     fontSize: 14,
//     color: 'rgba(16,18,32,0.5)',
//     letterSpacing: 0.5
//   },
//   name: {
//     fontFamily: font,
//     fontWeight: '500',
//     color: colors.uportBlack,
//     fontSize: 20,
//     lineHeight: 24,
//     marginTop: heightRatio(8)
//   },
//   scrollViewContainer: {
//     backgroundColor: colors.grey,
//     flexDirection: 'column',
//     alignItems: 'center',
//     marginBottom: heightRatio(20),
//     marginTop: windowHeight < 667 ? HEADER_MAX_HEIGHT + 60 : HEADER_MAX_HEIGHT
//   },
//   subHeading: {
//     height: heightRatio(66),
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   subHeadingText: {
//     fontFamily: font,
//     fontWeight: '500',
//     color: colors.darkGrey,
//     fontSize: 13,
//     letterSpacing: 0.5,
//     lineHeight: 15
//   },
//   typeContainer: {
//     height: heightRatio(29),
//     borderRadius: widthRatio(30),
//     marginTop: heightRatio(20),
//     paddingLeft: widthRatio(15),
//     paddingRight: widthRatio(15),
//     backgroundColor: colors.uportRed,
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   typeText: {
//     fontFamily: font,
//     fontWeight: '500',
//     fontSize: 13,
//     letterSpacing: 1,
//     lineHeight: 15,
//     color: colors.white
//   }
// })
//
// class ContactDetails extends React.Component {
//   constructor () {
//     super()
//     this.state = { scrollY: new Animated.Value(0) }
//   }
//   render () {
//     const activities = this.props.activitiesByAddress(this.props.selectedContact.address)
//     let type = '' + this.props.selectedContact['@type']
//
//     const headerHeight = this.state.scrollY.interpolate({
//       inputRange: [0, HEADER_SCROLL_DISTANCE],
//       outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
//       extrapolate: 'clamp'
//     })
//
//     return (
//       <View style={[styles.fill, styles.container]}>
//         <ScrollView style={styles.fill}>
//           <View style={styles.scrollViewContainer}>
//             <Text style={styles.name}>
//               {this.props.selectedContact.name ? this.props.selectedContact.name : 'Unnamed'}
//             </Text>
//             <View style={styles.subHeading}>
//               <Text style={styles.subHeadingText}>
//                 INFO
//               </Text>
//             </View>
//             <View style={styles.informationCard}>
//               { this.props.selectedContact.name
//                 ? <View style={styles.informationCardRow}>
//                   <Text style={styles.informationCardType}>NAME</Text>
//                   <Text style={styles.informationCardValue}>
//                     {this.props.selectedContact.name}
//                   </Text>
//                 </View>
//                 : null }
//               <View style={styles.informationCardRow}>
//                 <Text style={styles.informationCardType}>ADDRESS</Text>
//                 <Text style={styles.informationCardValue}>
//                   {this.props.selectedContact.address}
//                 </Text>
//               </View>
//             </View>
//             <TouchableHighlight onPress={this.props.handleDelete} style={styles.subHeading}>
//               <Text style={[styles.subHeadingText, {color: colors.uportRed}]}>
//                 DELETE CONTACT
//               </Text>
//             </TouchableHighlight>
//           </View>
//         </ScrollView>
//       </View>
//     )
//   }
// }
//
// const mapStateToProps = (state) => {
//   return {
//     activitiesByAddress: (address) => activitiesByAddress(state, address),
//     isRecoveryDelegate: (address) => isRecoveryDelegate(state, address),
//     lookupProfile: (clientId) => toJs(externalProfile(state, clientId)),
//     requested: (activity) => requestedClaims(state, activity && activity.requested),
//     selectedContact: state.contacts.selectedContact
//   }
// }
//
// const mapDispatchToProps = (dispatch) => {
//   return {
//     authorizeRequest: (activity) => dispatch(authorizeRequest(activity.id)),
//     cancelRequest: (activity) => dispatch(cancelRequest(activity.id)),
//     refreshExternalUport: (address) => dispatch(refreshExternalUport(address)),
//     selectRequest: (activityId) => {
//       dispatch(selectRequest(activityId))
//       dispatch(openActivity(activityId))
//     }
//   }
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(ContactDetails)
