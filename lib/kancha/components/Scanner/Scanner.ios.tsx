import * as React from 'react'
import { ActivityIndicator, TouchableOpacity, ViewStyle, SafeAreaView } from 'react-native'
import { Container, Text, Icon } from '@kancha'
import { RNCamera } from 'react-native-camera'
import Permissions from 'react-native-permissions'
import { ScannerProps, ScannerState } from './scannerProps'

interface IOSScannerProps extends ScannerProps {}
interface IOSScannerState extends ScannerState {}

class IOSScanner extends React.Component<IOSScannerProps, IOSScannerState> {
  /**
   * Persmissions handled locally as state
   */
  state = {
    hasCameraPermission: null,
  }

  async componentDidMount() {
    let status = await Permissions.check('camera')
    if (status === 'undetermined') {
      status = await Permissions.request('camera')
    }
    this.setCamerPermissions(status)
  }

  setCamerPermissions(status: string) {
    this.setState({ hasCameraPermission: status === 'authorized' })
  }

  renderScanner() {
    const { isEnabled, startScanner, closeScanner, onBarcodeRead } = this.props
    const scannerText = isEnabled ? 'Scanning...' : 'Tap to scan QR code'
    const scannerViewStyles: ViewStyle = {
      flex: 1,
      justifyContent: 'flex-end',
      borderWidth: 5,
      borderRadius: 40,
      borderColor: isEnabled ? 'rgba(255,0,0, 0.3)' : 'rgba(0,0,0, 0)',
    }
    return (
      <RNCamera captureAudio={false} onBarCodeRead={onBarcodeRead} style={{ flex: 1 }}>
        <SafeAreaView style={scannerViewStyles}>
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
              {/* <TouchableOpacity onPress={() => closeScanner()}>
                <Icon name={'close'} font={'feather'} size={40} color={'white'} />
              </TouchableOpacity> */}
            </Container>
            <Container alignItems={'center'} justifyContent={'space-between'}>
              <Container paddingBottom>
                <Text textAlign={'center'} textColor={'#FFFFFF'}>
                  {scannerText}
                </Text>
              </Container>
              <ScannerButton onPress={startScanner} working={isEnabled} />
            </Container>
            <Container flex={3} />
          </Container>
        </SafeAreaView>
      </RNCamera>
    )
  }

  renderNoPermission() {
    return <Container />
  }

  render() {
    return this.state.hasCameraPermission ? this.renderScanner() : this.renderNoPermission()
  }
}

export default IOSScanner

/**
 * Temp
 */
interface ScannerButtonProps {
  onPress: () => void
  working: boolean
}

const ScannerButton: React.FC<ScannerButtonProps> = ({ onPress, working }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        width: 100,
        height: 100,
        borderWidth: 3,
        backgroundColor: 'white',
      }}
    >
      {working ? <ActivityIndicator size={'small'} /> : <Container />}
    </TouchableOpacity>
  )
}
