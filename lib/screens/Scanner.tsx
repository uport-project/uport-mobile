import * as React from 'react'
import { Vibration, AppState } from 'react-native'
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
  appState: string
  hasPermission: null | string
}

export class ScannerScreen extends React.Component<ScannerScreenProps, ScannerScreenState> {
  timeout: any

  constructor(props: ScannerScreenProps) {
    super(props)

    /**
     * manage all camera state in container
     */
    this.state = {
      isEnabled: false,
      appState: AppState.currentState,
      hasPermission: null,
    }

    this.startScanner = this.startScanner.bind(this)
    this.toggleScannerMode = this.toggleScannerMode.bind(this)
    this.onBarCodeRead = this.onBarCodeRead.bind(this)
    this.closeScanner = this.closeScanner.bind(this)
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)

    const hasPermission = await Permissions.check('camera')

    console.tron.log(hasPermission)

    if (hasPermission !== 'authorized') {
      const request = await Permissions.request('camera')
      this.setState({ hasPermission: request })
    }

    this.setState({ hasPermission })
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange = (nextAppState: string) => {
    this.setState({ ...this.state, appState: nextAppState })
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
      setTimeout(() => {
        this.popAndroidScannerView()
      }, 250)
    }

    this.stopScannerTimer()
  }

  render() {
    console.tron.log(this.state)
    return (
      <Screen config={Screen.Config.NoScroll} type={Screen.Types.Primary}>
        <Container flex={1}>
          {this.state.appState === 'active' && (
            <Scanner
              hasPermission={this.state.hasPermission === 'authorized'}
              isEnabled={this.state.isEnabled}
              onBarcodeRead={this.onBarCodeRead}
              startScanner={this.startScanner}
              closeScanner={this.closeScanner}
            />
          )}
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
