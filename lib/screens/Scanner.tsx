import * as React from 'react'
import { Screen, Container, Scanner } from '@kancha'

/**
 * Timeout value for scanner to stop trying to scan QR codes
 */
const SCANNER_TIMEOUT = 10000

interface ScannerScreenProps {}
interface ScannerScreenState {
  isEnabled: boolean
}

class ScannerScreen extends React.Component<ScannerScreenProps, ScannerScreenState> {
  timeout: any

  constructor(props: ScannerScreenProps) {
    super(props)

    /**
     * Set the enabled flag locally in the screen
     */
    this.state = {
      isEnabled: false,
    }

    this.startScanner = this.startScanner.bind(this)
    this.toggleScannerMode = this.toggleScannerMode.bind(this)
  }

  toggleScannerMode(enabled: boolean) {
    this.setState({
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

  render() {
    return (
      <Screen statusBarHidden config={Screen.Config.NoScroll} type={Screen.Types.Primary}>
        <Container flex={1}>
          <Scanner
            isEnabled={this.state.isEnabled}
            onBarcodeRead={() => null}
            startScanner={this.startScanner}
            closeScanner={() => null}
          />
        </Container>
      </Screen>
    )
  }
}

export default ScannerScreen
