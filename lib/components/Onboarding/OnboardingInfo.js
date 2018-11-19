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
import React from 'react'
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import globalStyles, {heightRatio, windowHeight, widthRatio, windowWidth} from 'uPortMobile/lib/styles/globalStyles'
const styles = StyleSheet.create({
  benefitText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: 'white',
    letterSpacing: 0
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: heightRatio(44),
    width: widthRatio(315),
    elevation: 5,
    borderRadius: Platform.select({ios: 8, android: 0})
  },
  buttonText: {
    letterSpacing: 0,
    lineHeight: 18,
    fontSize: 16
  },
  onboardingIndicator: {
    width: 6,
    height: 6,
    borderRadius: 6
  }
})
export class OnboardingInfo extends React.Component {
  constructor () {
    super()
    this.state = {
      panel: 0
    }
  }
  render () {
    return (
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{height: heightRatio(480), width: windowWidth, backgroundColor: 'rgba(0,0,0,0)'}}
          scrollEventThrottle={8}
          onScroll={(e) => this.setState({panel: Math.round((e.nativeEvent.contentOffset.x / windowWidth))})}
          bounces={false}>
          <View style={{alignItems: 'center', width: windowWidth, justifyContent: 'flex-end'}}>
            <View style={{alignItems: 'center', marginBottom: heightRatio(24)}}>
              <Image style={{marginBottom: heightRatio(28)}}
                source={require('uPortMobile/assets/images/Logo.png')} />
              <View style={[{backgroundColor: 'rgba(255, 255, 255, 0.0)'}]}>
                <Text style={[globalStyles.font, styles.benefitText]}>Own your identity for the first</Text>
                <Text style={[globalStyles.font, styles.benefitText]}>time in history, and control your</Text>
                <Text style={[globalStyles.font, styles.benefitText]}>atomized claims.</Text>
              </View>
            </View>
          </View>
          <View style={{alignItems: 'center', width: windowWidth, justifyContent: 'flex-end'}}>
            <Image style={{marginBottom: heightRatio(45.2)}}
              source={require('uPortMobile/assets/images/2.png')} />
            <View style={{marginBottom: windowHeight * (35 / 667), backgroundColor: 'rgba(255, 255, 255, 0.0)'}}>
              <Text style={[globalStyles.font, styles.benefitText]}>Universal</Text>
              <Text style={[globalStyles.font, styles.benefitText]}>Single Sign-on.</Text>
            </View>
          </View>
          <View style={{alignItems: 'center', width: windowWidth, justifyContent: 'flex-end'}}>
            <Image style={{marginBottom: heightRatio(50)}}
              source={require('uPortMobile/assets/images/3.png')} />
            <View style={{marginBottom: heightRatio(35), backgroundColor: 'rgba(255, 255, 255, 0.0)'}}>
              <Text style={[globalStyles.font, styles.benefitText]}>Public & Private Chain</Text>
              <Text style={[globalStyles.font, styles.benefitText]}>Interoperability.</Text>
            </View>
          </View>

          <View style={{alignItems: 'center', width: windowWidth, justifyContent: 'flex-end'}}>
            <Image style={{
              marginBottom: heightRatio(50),
              marginLeft: widthRatio(20)
            }}
              source={require('uPortMobile/assets/images/4.png')} />
            <View style={{marginBottom: heightRatio(35), backgroundColor: 'rgba(255, 255, 255, 0.0)'}}>
              <Text style={[globalStyles.font, styles.benefitText]}>Sign Transactions</Text>
              <Text style={[globalStyles.font, styles.benefitText]}>Quickly and Securely.</Text>
            </View>
          </View>
          <View style={{alignItems: 'center', width: windowWidth, justifyContent: 'flex-end'}}>
            <Image style={{
              marginBottom: heightRatio(50)
            }}
              source={require('uPortMobile/assets/images/5.png')} />
            <View style={{marginBottom: heightRatio(35), backgroundColor: 'rgba(255, 255, 255, 0.0)'}}>
              <Text style={[globalStyles.font, styles.benefitText]}>Own and Manage</Text>
              <Text style={[globalStyles.font, styles.benefitText]}>Your Identity.</Text>
            </View>
          </View>
        </ScrollView>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: windowHeight * (29 / 667)}}>
          <View style={[
            styles.onboardingIndicator,
            {backgroundColor: this.state.panel === 0 ? 'white' : 'rgba(255, 255, 255, 0.2)'}]} />
          <View style={[
            styles.onboardingIndicator,
            {marginLeft: widthRatio(7), backgroundColor: this.state.panel === 1 ? 'white' : 'rgba(255, 255, 255, 0.2)'}]} />
          <View style={[
            styles.onboardingIndicator,
            {marginLeft: widthRatio(7), backgroundColor: this.state.panel === 2 ? 'white' : 'rgba(255, 255, 255, 0.2)'}]} />
          <View style={[
            styles.onboardingIndicator,
            {marginLeft: widthRatio(7), backgroundColor: this.state.panel === 3 ? 'white' : 'rgba(255, 255, 255, 0.2)'}]} />
          <View style={[
            styles.onboardingIndicator,
            {marginLeft: widthRatio(7), backgroundColor: this.state.panel === 4 ? 'white' : 'rgba(255, 255, 255, 0.2)'}]} />
        </View>
        <TouchableHighlight
          onPress={() => this.props.navigator.push({
            screen: 'onboarding.terms',
            title: 'Terms and Conditions'
          })}
          underlayColor='rgba(0,0,0,0.0)'
          // onShowUnderlay={() => this.setState({touched: true})}
          // onHideUnderlay={() => this.setState({touched: false})}
          >
          <View style={[styles.button, {marginBottom: heightRatio(10)}]}>
            <Text style={[styles.buttonText]}>
              Continue
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
}

export default OnboardingInfo
