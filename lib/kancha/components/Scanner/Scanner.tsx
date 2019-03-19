import * as React from 'react'
import { ViewStyle, SafeAreaView } from 'react-native'
import { Container, ScannerControl, Text } from '@kancha'
import { RNCamera } from 'react-native-camera'

export interface ScannerProps {
  /**
   * Camera permissions
   */
  hasCameraPermission: boolean | null
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
}

const QRCodeScanner: React.FC<ScannerProps> = ({
  hasCameraPermission,
  isEnabled,
  onBarcodeRead,
  startScanner,
  closeScanner,
}) => {
  const scannerViewStyles: ViewStyle = {
    flex: 1,
    justifyContent: 'flex-end',
    borderWidth: 5,
    borderRadius: 40,
    borderColor: isEnabled ? 'rgba(255,0,0, 0.3)' : 'rgba(0,0,0, 0)',
  }

  return (
    <RNCamera
      captureAudio={false}
      onBarCodeRead={onBarcodeRead}
      style={{ flex: 1 }}
      pendingAuthorizationView={
        <Container flex={1} backgroundColor={'black'} alignItems={'center'} justifyContent={'center'} padding={20}>
          <Container paddingBottom>
            <Text type={Text.Types.H2} textColor={'white'} textAlign={'center'}>
              Permissions
            </Text>
          </Container>
          <Text type={Text.Types.SubTitle}>Checking if camera permissions are enabled...</Text>
        </Container>
      }
      notAuthorizedView={
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
      }
    >
      <SafeAreaView style={scannerViewStyles}>
        <ScannerControl startScanner={startScanner} working={isEnabled} closeScanner={closeScanner} />
      </SafeAreaView>
    </RNCamera>
  )
}

export default QRCodeScanner
