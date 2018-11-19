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
// import PropTypes from 'prop-types'
// import { connect } from 'react-redux'
// import {
//   View,
//   TouchableHighlight,
//   Image,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet
// } from 'react-native'
// // Frameworks
// 
// // Selectors
// import { seed, seedWords, wordNo, currentWord } from 'uPortMobile/lib/selectors/recovery'
//
// // Actions
// import { showRecoverySeed, hideRecoverySeed, selectRecoveryWord } from 'uPortMobile/lib/actions/recoveryActions'
//
// import globalStyles, {widthRatio, heightRatio, colors, font} from 'uPortMobile/lib/styles/globalStyles'
// const styles = StyleSheet.create({
//   header: {
//     marginTop: 20,
//     height: heightRatio(60),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between'
//   },
//   headerIcon: {
//     alignItems: 'center',
//     height: heightRatio(50),
//     justifyContent: 'center',
//     marginLeft: widthRatio(15),
//     width: heightRatio(50)
//   },
//   headerTitle: {
//     color: colors.uportBlue,
//     fontFamily: font,
//     fontSize: 17,
//     fontWeight: '500',
//     letterSpacing: 1.89,
//     lineHeight: 20
//   },
//   sectionHeader: {
//     height: heightRatio(74),
//     justifyContent: 'center'
//   },
//   sectionHeaderText: {
//     color: colors.darkGrey,
//     fontFamily: font,
//     fontSize: 13,
//     fontWeight: '500',
//     letterSpacing: 0.5,
//     lineHeight: 15,
//     textAlign: 'center'
//   },
//   bodySection: {
//     paddingTop: 5.5,
//     paddingBottom: 6.5
//   },
//   textInputContainer: {
//     height: heightRatio(50),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     shadowOpacity: 0.0,
//     borderWidth: 1,
//     borderColor: colors.softGrey
//   },
//   wordSection: {
//     marginTop: 52,
//     marginBottom: 52,
//     marginLeft: 26,
//     marginRight: 26,
//     padding: 13,
//     backgroundColor: colors.softGrey,
//     justifyContent: 'center'
//   },
//   word: {
//     fontSize: 20,
//     color: '#101220',
//     letterSpacing: 0.5,
//     textAlign: 'center',
//     lineHeight: 26
//   },
//   paragraph: {
//     padding: 13
//   }
// })
// // Components
//
// const Action = (props) => (
//   <TouchableOpacity onPress={props.onPress} disabled={props.disabled}>
//     <View style={styles.sectionHeader} >
//       <Text style={[styles.sectionHeaderText, {marginBottom: heightRatio(-10), color: props.disabled ? colors.darkGrey : colors.uportBlue}]}>
//         {props.title}
//       </Text>
//     </View>
//   </TouchableOpacity>
// )
//
// const BackupInfo = (props) => (
//   <View style={[globalStyles.container, {backgroundColor: colors.grey}]}>
//     <View style={styles.header}>
//       <TouchableHighlight style={styles.headerIcon} onPress={props.back} underlayColor='rgba(255, 255, 255, 0.0)'>
//         <Image style={{width: widthRatio(18), height: heightRatio(14)}} source={require('uPortMobile/assets/images/Back.png')} />
//       </TouchableHighlight>
//       <Text style={styles.headerTitle}>SEED</Text>
//       <View style={{width: heightRatio(50), marginRight: widthRatio(15)}} />
//     </View>
//     <View style={styles.bodySection}>
//       <Text style={styles.paragraph}>
//         If you lose access to your phone your uPort can be restored with a 12 word backup phrase. Anyone with that phrase can restore your uPort.
//       </Text>
//       <Text style={styles.paragraph}>
//         You will see a list of words, one by one. Write them down, then securely store them.
//       </Text>
//     </View>
//     <Action title='BACKUP YOUR UPORT' onPress={props.start} />
//   </View>
// )
// const VerifyInfo = (props) => {
//   return (
//     <View style={[globalStyles.container, {backgroundColor: colors.grey}]}>
//       <View style={styles.header}>
//         <TouchableHighlight style={styles.headerIcon} onPress={props.back} underlayColor='rgba(255, 255, 255, 0.0)'>
//           <Image style={{width: widthRatio(18), height: heightRatio(14)}} source={require('uPortMobile/assets/images/Back.png')} />
//         </TouchableHighlight>
//         <Text style={styles.headerTitle}>VERIFY</Text>
//         <View style={{width: heightRatio(50), marginRight: widthRatio(15)}} />
//       </View>
//       <View style={styles.bodySection}>
//         <Text style={styles.paragraph}>
//           On the next screen you will re-enter you backup seed in the order you received them, to validate that you have the correct words.
//         </Text>
//       </View>
//       <Action title='VERIFY YOUR SEED' onPress={() => props.toggleValues('verifySeed', 'verifyInfo')} />
//     </View>
//   )
// }
// const FinishInfo = (props) => {
//   return (
//     <View style={[globalStyles.container, {backgroundColor: colors.grey}]}>
//       <View style={styles.header}>
//         <TouchableHighlight style={styles.headerIcon} onPress={props.back} underlayColor='rgba(255, 255, 255, 0.0)'>
//           <Image style={{width: widthRatio(18), height: heightRatio(14)}} source={require('uPortMobile/assets/images/Back.png')} />
//         </TouchableHighlight>
//         <Text style={styles.headerTitle}>BACKUP SUCCESSFUL</Text>
//         <View style={{width: heightRatio(50), marginRight: widthRatio(15)}} />
//       </View>
//       <View style={styles.bodySection}>
//         <Text style={styles.paragraph}>
//           You successfully completed the backup.
//           Keep the seed safe and use it to restore your uPort on any device.
//         </Text>
//       </View>
//       <Action title='FINISH' onPress={props.back} />
//     </View>
//   )
// }
// const VerifyWord = (props) => {
//   return (
//     <View style={[globalStyles.container, {backgroundColor: colors.grey}]}>
//       <View style={styles.header}>
//         <TouchableHighlight style={styles.headerIcon} onPress={props.back} underlayColor='rgba(255, 255, 255, 0.0)'>
//           <Image style={{width: widthRatio(18), height: heightRatio(14)}} source={require('uPortMobile/assets/images/Back.png')} />
//         </TouchableHighlight>
//         <Text style={[styles.headerTitle, {width: widthRatio(275), textAlign: 'center'}]}>Please verify your 12 word seed backup phrase.</Text>
//         <View style={{width: heightRatio(50), marginRight: widthRatio(15)}} />
//       </View>
//       <View style={styles.bodySection}>
//         <View style={[globalStyles.listItem, styles.textInputContainer, {width: widthRatio(335), alignSelf: 'center', marginTop: heightRatio(60)}]}>
//           <TextInput style={[globalStyles.claimListType, {
//             width: widthRatio(335),
//             height: heightRatio(120),
//             color: props.value !== 'ENTER SEED PHRASE' ? colors.uportBlack : colors.darkGrey,
//             borderWidth: 0,
//             textAlign: 'center',
//             marginLeft: 0,
//             justifyContent: 'center',
//             alignItems: 'center'
//           }]}
//             multiline
//             onChangeText={(value) => props.handleChange(value)}
//             onFocus={() => props.setText('')}
//             value={props.value}
//           />
//         </View>
//       </View>
//       <Action title='VERIFY SEED' onPress={() => props.toggleValues('finishInfo', 'verifySeed')} disabled={props.value !== props.seedWords.join(' ')} />
//     </View>
//   )
// }
//
// const ShowWord = (props) => (
//
//   <View style={[globalStyles.container, {backgroundColor: colors.grey}]}>
//     <View style={styles.header}>
//       <TouchableHighlight style={styles.headerIcon} onPress={() => props.wordNo === 0 ? props.back() : props.selectRecoveryWord(props.wordNo - 1)} underlayColor='rgba(255, 255, 255, 0.0)'>
//         <Image style={{width: widthRatio(18), height: heightRatio(14)}} source={require('uPortMobile/assets/images/Back.png')} />
//       </TouchableHighlight>
//       <Text style={styles.headerTitle}>WORD {props.wordNo + 1} of {props.wordCount}</Text>
//       <View style={{width: heightRatio(50), marginRight: widthRatio(15)}} />
//     </View>
//     <View style={styles.bodySection}>
//       <View style={styles.wordSection}>
//         <Text style={styles.word}>
//           {props.currentWord}
//         </Text>
//       </View>
//     </View>
//     {props.wordNo === props.wordCount - 1
//     ? <Action title='FINISH' onPress={() => props.toggleValues('verifyInfo')} />
//     : <Action title='NEXT WORD' onPress={() => props.selectRecoveryWord(props.wordNo + 1)} />}
//   </View>
// )
//
// class SeedBackup extends React.Component {
//   constructor () {
//     super()
//     this.state = {
//       value: 'ENTER SEED PHRASE',
//       verifyInfo: false,
//       verifySeed: false,
//       finishInfo: false,
//       verifyNo: 0
//     }
//     this.handleChange = this.handleChange.bind(this)
//     this.toggleValues = this.toggleValues.bind(this)
//     this.setText = this.setText.bind(this)
//     this.incrementVerify = this.incrementVerify.bind(this)
//   }
//   handleChange (value) {
//     this.setState({value: value.toLowerCase()})
//   }
//   toggleValues (value1, value2 = false) {
//     value2
//     ? this.setState({[value1]: !this.state[value1], [value2]: !this.state[value2]})
//     : this.setState({[value1]: !this.state[value1]})
//   }
//   setText (value) {
//     this.setState({value: value})
//   }
//   incrementVerify () {
//     this.setState({verifyNo: this.state.verifyNo + 1})
//   }
//   // console.log('ZZZZZZZZZZZZ')
//   // console.log(props.seedWords.length)
//   render () {
//     if (!this.props.seed) {
//       return (
//         <BackupInfo start={this.props.start} back={() => this.props.navigator.pop()} />
//       )
//     }
//     if (this.state.finishInfo) {
//       return (
//         <FinishInfo back={() => this.props.navigator.pop()} />
//       )
//     }
//     if (this.state.verifyInfo) {
//       return (
//         <VerifyInfo toggleValues={this.toggleValues} back={() => this.props.navigator.pop()} />
//       )
//     }
//     if (this.state.verifySeed) {
//       return (
//         <VerifyWord
//           back={this.props.back}
//           wordCount={this.props.seedWords.length}
//           verifyNo={this.state.verifyNo}
//           handleChange={this.handleChange}
//           value={this.state.value}
//           seedWords={this.props.seedWords}
//           setText={this.setText}
//           incrementVerify={this.incrementVerify}
//           toggleValues={this.toggleValues}
//         />
//       )
//     } else {
//       return (
//         <ShowWord
//           selectRecoveryWord={this.props.selectRecoveryWord}
//           back={this.props.back}
//           currentWord={this.props.currentWord}
//           wordNo={this.props.wordNo}
//           wordCount={this.props.seedWords.length}
//           start={this.props.start}
//           toggleValues={this.toggleValues}
//         />
//       )
//     }
//   }
// }
//
// SeedBackup.propTypes = {
//   start: PropTypes.func.isRequired,
//   complete: PropTypes.func.isRequired,
//   selectRecoveryWord: PropTypes.func.isRequired,
//   seed: PropTypes.string,
//   seedWords: PropTypes.array,
//   currentWord: PropTypes.string,
//   wordNo: PropTypes.number
// }
//
// const mapStateToProps = (state) => {
//   return {
//     seed: seed(state),
//     seedWords: seedWords(state),
//     wordNo: wordNo(state),
//     currentWord: currentWord(state)
//   }
// }
//
// const mapDispatchToProps = (dispatch) => {
//   return {
//     start: () => {
//       dispatch(showRecoverySeed())
//     },
//     complete: () => {
//       dispatch(hideRecoverySeed())
//     },
//     selectRecoveryWord: (i) => {
//       dispatch(selectRecoveryWord(i))
//     },
//     back: () => {
//       dispatch(hideRecoverySeed())
//     }
//   }
// }
//
// export default connect(
//   mapStateToProps, mapDispatchToProps
// )(SeedBackup)
