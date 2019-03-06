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
import { Text, View, Vibration, Platform, StyleSheet } from 'react-native'

// Actions
import { handleURL } from 'uPortMobile/lib/actions/requestActions'
import { clearMessage } from 'uPortMobile/lib/actions/processStatusActions'
import { authorizeCamera } from 'uPortMobile/lib/actions/authorizationActions'

const SCANNER_TIMEOUT = 15000

const DisabledScanner = props => {
  return (
    <View style={{ backgroundColor: 'black', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 15 }}>
      <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 20, paddingBottom: 5 }}>Check Permissions</Text>
      <Text style={{ color: '#FFFFFF', textAlign: 'center', lineHeight: 22 }}>
        To scan a QR code you need to give camera access permssions to uPort in settings.
      </Text>
    </View>
  )
}

export class Scanner extends React.Component {
  constructor(props) {
    super(props)

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))

    this.onBarCodeRead = this.onBarCodeRead.bind(this)
    this.toggleScannerMode = this.toggleScannerMode.bind(this)

    this.state = {
      hasCameraPermission: null,
      scannerEnabled: false,
    }
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'willAppear':
        break
      case 'didAppear':
        break
      case 'willDisappear':
        break
      case 'didDisappear':
        break
      case 'willCommitPreview':
        break
    }
  }

  setCamerPermissions(status) {
    this.setState({ ...this.state, hasCameraPermission: status === 'authorized' })
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
      this.popScreen()
    }

    this.stopScannerTimer()
  }

  toggleDrawer() {
    this.props.navigator.toggleDrawer({
      side: 'right',
    })
  }

  popScreen() {
    this.props.navigator.dismissModal()
  }

  onBarCodeRead(event) {
    if (!this.state.scannerEnabled) return

    Vibration.vibrate()
    this.toggleScannerMode(false)
    this.props.scanURL(event)
    this.closeScanner()
  }

  toggleScannerMode(enable) {
    this.setState({
      ...this.state,
      scannerEnabled: enable,
    })
  }

  startTimer() {
    this.timeout = setTimeout(() => {
      this.toggleScannerMode(false)
      this.stopScannerTimer()
    }, SCANNER_TIMEOUT)
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

  render() {}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    height: 80,
    backgroundColor: 'black',
    paddingTop: 30,
  },
  headerMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMessageText: {
    marginLeft: 15,
    color: '#FFFFFF',
    alignSelf: 'center',
    textAlign: 'center',
  },
  scannerWindow: {
    flex: 1,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonContainer: {
    flex: 3,
    alignItems: 'center',
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    width: 100,
    height: 100,
    borderWidth: 3,
    backgroundColor: 'white',
  },
})

const mapStateToProps = (state, ownProps) => ownProps

const mapDispatchToProps = dispatch => {
  return {
    scanURL: event => {
      if (event.data) {
        dispatch(handleURL(event.data, { postback: true }))
      }
    },
    clearError: () => {
      dispatch(clearMessage('handleUrl'))
    },
    authorizeCamera: response => {
      dispatch(authorizeCamera(response))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Scanner)
