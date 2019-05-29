import * as React from 'react'
import { Vibration, AppState } from 'react-native'
import Permissions from 'react-native-permissions'
import { Navigation } from 'react-native-navigation'
import { Screen, Container, Scanner, Device, Theme } from '@kancha'

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
  hasPermission: null | boolean
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

    Navigation.events().bindComponent(this)

    this.toggleScannerMode = this.toggleScannerMode.bind(this)
    this.onBarCodeRead = this.onBarCodeRead.bind(this)
    this.closeScanner = this.closeScanner.bind(this)
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  async componentDidAppear() {
    this.toggleScannerMode(true)

    let status = await Permissions.check('camera')

    if (status === 'undetermined') {
      status = await Permissions.request('camera')
    }

    this.setState({ ...this.state, hasPermission: status === 'authorized' })
  }

  componentDidDisappear() {
    this.toggleScannerMode(false)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange = (nextAppState: string) => {
    this.setState({ ...this.state, appState: nextAppState })
  }

  toggleScannerMode(enabled: boolean) {
    this.setState({
      ...this.state,
      isEnabled: enabled,
    })
  }

  onBarCodeRead(event: any) {
    Vibration.vibrate(400, false)
    this.props.handleQRCodeURL(event)
    this.toggleScannerMode(false)
    this.closeScanner()
  }

  toggleIOSDrawer() {
    Navigation.mergeOptions('Scanner', {
      sideMenu: {
        right: {
          visible: false,
        },
      },
    })
  }

  popAndroidScannerView() {
    Navigation.dismissAllModals()
  }

  closeScanner() {
    if (Device.isIOS) {
      this.toggleIOSDrawer()
    } else {
      setTimeout(() => {
        this.popAndroidScannerView()
      }, 250)
    }
  }

  render() {
    return (
      <Screen config={Screen.Config.NoScroll} type={Screen.Types.Primary}>
        <Container flex={1} backgroundColor={'#000000'}>
          {this.state.appState === 'active' && this.state.isEnabled && (
            <Scanner
              hasPermission={this.state.hasPermission}
              onBarcodeRead={this.onBarCodeRead}
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
