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
import { connect } from 'react-redux'
import { Text, View, Vibration, Platform, TouchableHighlight, Dimensions, TouchableOpacity, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native'
import { RNCamera } from 'react-native-camera'
import Permissions from 'react-native-permissions'
import CameraAuthDenied from './CameraAuthDenied'
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Feather'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

// Actions
import { handleURL } from 'uPortMobile/lib/actions/requestActions'
import { clearMessage } from 'uPortMobile/lib/actions/processStatusActions'
import { authorizeCamera } from 'uPortMobile/lib/actions/authorizationActions'

const { width, height } = Dimensions.get('window')

const DisabledScanner = (props) => {
  return (
    <View style={{ backgroundColor: 'black', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 15}} >
      <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 20, paddingBottom: 5 }}>Check Permissions</Text>
      <Text style={{color: '#FFFFFF', textAlign: 'center', lineHeight: 22 }}>To scan a QR code you need to give camera access permssions to uPort in settings.</Text>
    </View>
  )
}

export class Scanner extends React.Component {

  constructor (props) {
    super(props)
    
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.onBarCodeRead = this.onBarCodeRead.bind(this)
    this.toggleScannerMode = this.toggleScannerMode.bind(this)
  
    this.state = {
      hasCameraPermission: null,
      scannerEnabled: false
    }
  }

  onNavigatorEvent(event) {

    switch(event.id) {
      case 'willAppear':
       break;
      case 'didAppear':
        break;
      case 'willDisappear':
        break;
      case 'didDisappear':
        break;
      case 'willCommitPreview':
        break;
    }
  }

  setCamerPermissions(status) {
    this.setState({ ...this.state, hasCameraPermission: status === 'authorized' });
  }

  async componentDidMount() {

    let status = await Permissions.check('camera')
    if (status === 'undetermined') {
      status = await Permissions.request('camera')
    }
    this.setCamerPermissions(status)
  }

  closeScanner() {
    if (Platform.OS === 'ios') {
      this.toggleDrawer()
    } else {
      this.dismissModal()
    }
  }

  toggleDrawer() {
    this.props.navigator.toggleDrawer({
      side: 'right'
    })
  }

  dismissModal() {
    this.props.navigator.dismissModal()
  }

  onBarCodeRead(event) {
    if (!this.state.scannerEnabled) return
    this.checkAnimation.play()
    Vibration.vibrate()
    this.toggleScannerMode(false);

    setTimeout(() => {
      this.checkAnimation.reset()
      this.props.scanURL(event)
      
      this.closeScanner()
    }, 1500)
  }

  toggleScannerMode(enable) {
    this.setState({
      ...this.state,
      scannerEnabled: enable
    })
  }

  startTimer() {
    this.timeout = setTimeout(() => {
      this.toggleScannerMode(false)
      this.stopScannerTimer()
    }, 5000)
  }

  startScanner() {
    this.toggleScannerMode(true)

    clearTimeout(this.timeout)
    this.startTimer()
  }

  stopScannerTimer() {
    clearTimeout(this.timeout)
    this.toggleScannerMode(false)
  }

  render() {

    const { hasCameraPermission } = this.state;
    const borderStyleButton = {
      borderColor: this.state.scannerEnabled ? '#333333' : 'red'
    }
    const borderStyleScanner = {
      borderColor: this.state.scannerEnabled ? 'rgba(255,0,0, 0.1)' : 'rgba(255,255,255, 0.1)',
    }

    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <DisabledScanner />;
    } else {
      return (
        <SafeAreaView style={styles.container}>
            <RNCamera
              captureAudio={false}
              style={styles.camera}
              onBarCodeRead={this.onBarCodeRead.bind(this)}
            >
              <View style={styles.header}>
                {
                  this.state.scannerEnabled &&
                    <View style={styles.headerMessageContainer}><ActivityIndicator size="small" color="#00ff00" /><Text style={styles.headerMessageText}>Scanning for QR codes</Text></View>
                }
                { 
                  !this.state.scannerEnabled &&
                    <Text style={styles.headerMessageText}>Point your camera at a QR code and tap the scan button</Text>
                }
              </View>
              <View style={[styles.scannerWindow, borderStyleScanner]}>
                  <LottieView
                    speed={1}
                    loop={false}             
                    ref={animation => {
                      this.checkAnimation = animation;
                    }}
                    style={{width: 100, height: 100}}
                    source={require('uPortMobile/lib/animations/check.json')}
                  />
              </View>
              <View style={styles.footer}>
                <View style={styles.closeContainer}>
                    <TouchableOpacity onPress={() => this.closeScanner()}>
                      <Icon name="x" size={40} color={colors.white}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.scanButtonContainer}>
                  <TouchableHighlight
                    disabled={this.state.scannerEnabled}
                    onPress={() => this.startScanner()}
                    style={[styles.scanButton, borderStyleButton]}
                    >
                    <View></View>
                  </TouchableHighlight>
                </View>
                <View style={{flex: 3}}></View>
              </View>
            </RNCamera>            
          </SafeAreaView>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: 'black'
  },
  camera: {
    flex: 1, 
    justifyContent: 'space-between'
  },
  header: {
    height: 80, 
    backgroundColor: 
    'black', 
    paddingTop: 30
  },
  headerMessageContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  headerMessageText: {
    marginLeft: 15, 
    color: '#FFFFFF', 
    alignSelf: 'center', 
    textAlign: 'center'
  },
  scannerWindow: {
    flex: 1, 
    borderWidth: 10, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  footer: {
    flexDirection: 'row', 
    backgroundColor: 'black', 
    paddingTop: 50, 
    paddingBottom: 20
  },
  closeContainer: {
    flex: 3, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  scanButtonContainer: {
    flex: 3, 
    alignItems: 'center'
  },
  scanButton: {
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 50, 
    width: 100, 
    height: 100, 
    borderWidth: 3, 
    backgroundColor: 'white'
  }
})

const mapStateToProps = (state, ownProps) => ownProps

const mapDispatchToProps = (dispatch) => {
  return {
    scanURL: (event) => {
      if (event.data) {
        dispatch(handleURL(event.data, { postback: true }))
      }
    },
    clearError: () => {
      dispatch(clearMessage('handleUrl'))
    },
    authorizeCamera: (response) => {
      dispatch(authorizeCamera(response))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Scanner)
