import * as React from 'react'
import { ViewStyle, SafeAreaView } from 'react-native'
import { Container, Button, Text, Icon } from '@kancha'
import { RNCamera } from 'react-native-camera'

interface ScannerProps {
  /**
   * Callback when barcode has been read
   */
  onBarcodeRead: (event: any) => void
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

const QRCodeScanner: React.FC<ScannerProps> = ({ onBarcodeRead, closeScanner, hasPermission }) => {
  const scannerViewStyles: ViewStyle = {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  }

  return hasPermission ? (
    <RNCamera captureAudio={false} onBarCodeRead={onBarcodeRead} style={{ flex: 1 }}>
      <SafeAreaView style={scannerViewStyles}>
        <Container paddingBottom={35}>
          <Button
            type={Button.Types.Secondary}
            onPress={() => closeScanner()}
            block={Button.Block.Clear}
            buttonText={'Close'}
          />
        </Container>
      </SafeAreaView>
    </RNCamera>
  ) : (
    <NoPermission />
  )
}

export default QRCodeScanner
