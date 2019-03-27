import * as React from 'react'
import { Vibration } from 'react-native'
import { Navigator } from 'react-native-navigation'
import { Screen, Container, Scanner, Device } from '@kancha'
import Permissions from 'react-native-permissions'

// Redux Connect
import { connect } from 'react-redux'
import { handleURL } from 'uPortMobile/lib/actions/requestActions'

/**
 * Timeout value for scanner to stop trying to scan QR codes
 */
const SCANNER_TIMEOUT = 10000

interface ScannerScreenProps {
  navigator: Navigator
  handleQRCodeURL: (event: any) => void
}

interface ScannerScreenState {
  isEnabled: boolean
  hasCameraPermission: boolean | null
}

class ScannerScreen extends React.Component<ScannerScreenProps, ScannerScreenState> {
  timeout: any

  constructor(props: ScannerScreenProps) {
    super(props)

    /**
     * manage all camera state in container
     */
    this.state = {
      isEnabled: false,
      hasCameraPermission: null,
    }

    this.startScanner = this.startScanner.bind(this)
    this.toggleScannerMode = this.toggleScannerMode.bind(this)
    this.onBarCodeRead = this.onBarCodeRead.bind(this)
    this.closeScanner = this.closeScanner.bind(this)
  }

  async componentDidMount() {
    /**
     * Hide Android tabs as this is just a regular view. To be addressed after nav upgrade
     */
    if (Device.isAndroid) {
      this.props.navigator.toggleTabs({
        to: 'hidden',
        animated: false,
      })
    }

    /**
     * Permisison state is not passed through redux anymore
     */
    // let status = await Permissions.check('camera')
    // if (status === 'undetermined') {
    //   status = await Permissions.request('camera')
    // }
    // this.setCamerPermissions(status)
  }

  setCamerPermissions(status: string) {
    this.setState({
      ...this.state,
      hasCameraPermission: status === 'authorized',
    })
  }

  /**
   * Prevent scanner from always scanning
   */
  toggleScannerMode(enabled: boolean) {
    this.setState({
      ...this.state,
      isEnabled: enabled,
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

  onBarCodeRead(event: any) {
    if (!this.state.isEnabled) return

    Vibration.vibrate(400, false)
    this.toggleScannerMode(false)
    this.props.handleQRCodeURL(event)
    this.closeScanner()
  }

  toggleIOSDrawer() {
    this.props.navigator.toggleDrawer({
      side: 'right',
    })
  }

  popAndroidScannerView() {
    this.props.navigator.dismissModal()
  }

  closeScanner() {
    if (Device.isIOS) {
      this.toggleIOSDrawer()
    } else {
      this.popAndroidScannerView()
    }

    this.stopScannerTimer()
  }

  render() {
    return (
      <Screen statusBarHidden config={Screen.Config.NoScroll} type={Screen.Types.Primary}>
        <Container flex={1}>
          <Scanner
            isEnabled={this.state.isEnabled}
            onBarcodeRead={this.onBarCodeRead}
            startScanner={this.startScanner}
            closeScanner={this.closeScanner}
          />
        </Container>
      </Screen>
    )
  }
}

const mapStateToProps = (state: any, ownProps: any) => ownProps

const mapDispatchToProps = (dispatch: any) => {
  return {
    handleQRCodeURL: (event: any) => {
      if (event.data) {
        dispatch(handleURL(event.data, { postback: true }))
      }
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScannerScreen)
