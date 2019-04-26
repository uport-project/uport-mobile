import * as React from 'react'
import { ViewStyle, SafeAreaView } from 'react-native'
import { Container, ScannerControl, Text } from '@kancha'
import { RNCamera } from 'react-native-camera'

interface ScannerProps {
  /**
   * Scanner enabled
   */
  isEnabled: boolean
  /**
   * Callback when barcode has been read
   */
  onBarcodeRead: (event: any) => void
  /**
   * Callback when barcode has been read
   */
  startScanner: () => void

  /**
   * Close the scanner
   */
  closeScanner: () => void

  /**
   * Camera has permission
   */
  hasPermission: boolean | null
}

const NoPermission = () => {
  return (
    <Container flex={1} backgroundColor={'black'} alignItems={'center'} justifyContent={'center'} padding={20}>
      <Container paddingBottom>
        <Text type={Text.Types.H2} textColor={'white'} textAlign={'center'}>
          Connect with uPort
        </Text>
      </Container>
      <Text type={Text.Types.SubTitle}>
        QR scanner requires camera access. Enable camera access in settings so you can scan QR codes and start
        connecting to apps.
      </Text>
    </Container>
  )
}

const PendingPermission = () => {
  return (
    <Container flex={1} backgroundColor={'black'} alignItems={'center'} justifyContent={'center'} padding={20}>
      <Container paddingBottom>
        <Text type={Text.Types.H2} textColor={'white'} textAlign={'center'}>
          Permissions
        </Text>
      </Container>
      <Text type={Text.Types.SubTitle}>Checking if camera permissions are enabled...</Text>
    </Container>
  )
}

const QRCodeScanner: React.FC<ScannerProps> = ({
  isEnabled,
  onBarcodeRead,
  startScanner,
  closeScanner,
  hasPermission,
}) => {
  const scannerViewStyles: ViewStyle = {
    flex: 1,
    justifyContent: 'flex-end',
    borderWidth: 5,
    borderRadius: 40,
    borderColor: isEnabled ? 'rgba(255,0,0, 0.3)' : 'rgba(0,0,0, 0)',
  }

  return hasPermission ? (
    <RNCamera captureAudio={false} onBarCodeRead={onBarcodeRead} style={{ flex: 1 }}>
      <SafeAreaView style={scannerViewStyles}>
        <ScannerControl startScanner={startScanner} working={isEnabled} closeScanner={closeScanner} />
      </SafeAreaView>
    </RNCamera>
  ) : (
    <NoPermission />
  )
}

export default QRCodeScanner
