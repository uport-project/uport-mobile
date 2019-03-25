import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { Container, Text, Icon } from '@kancha'
import ScannerButton from './ScannerButton'

interface ScannerControl {
  working: boolean
  startScanner: () => void
  closeScanner: () => void
}

const ScannerControl: React.FC<ScannerControl> = ({ working, startScanner, closeScanner }) => {
  const scannerText = working ? 'Scanning...' : 'Tap to scan QR code'
  return (
    <Container
      justifyContent={'center'}
      flexDirection={'row'}
      backgroundColor={'rgba(0,0,0,0.3)'}
      padding
      br={40}
      marginLeft={20}
      marginRight={20}
    >
      <Container flex={3} alignItems={'center'} justifyContent={'center'}>
        <TouchableOpacity onPress={() => closeScanner()}>
          <Icon name={'close'} font={'feather'} size={40} color={'white'} />
        </TouchableOpacity>
      </Container>
      <Container alignItems={'center'} justifyContent={'space-between'}>
        <Container paddingBottom>
          <Text textAlign={'center'} textColor={'#FFFFFF'}>
            {scannerText}
          </Text>
        </Container>
        <ScannerButton onPress={startScanner} working={working} />
      </Container>
      <Container flex={3} />
    </Container>
  )
}

export default ScannerControl
