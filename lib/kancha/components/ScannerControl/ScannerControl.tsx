import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { Container, Text, Icon, Button } from '@kancha'
import ScannerButton from './ScannerButton'

interface ScannerControl {
  closeScanner: () => void
}

const ScannerControl: React.FC<ScannerControl> = ({ closeScanner }) => {
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
          {/* <Icon name={'close'} font={'feather'} size={40} color={'white'} /> */}
        </TouchableOpacity>
      </Container>
      <Container alignItems={'center'} justifyContent={'space-between'} />
      <Container flex={3} />
    </Container>
  )
}

export default ScannerControl
