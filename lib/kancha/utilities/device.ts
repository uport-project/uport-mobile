import { Platform, Dimensions } from 'react-native'
import DeviceInfo from 'react-native-device-info'

interface DeviceProps {
  w: number
  h: number
  isIOS: boolean
  isAndroid: boolean
  buildNumber: string
}

const isIOS = Platform.OS === 'ios'
const isAndroid = Platform.OS === 'android'
const DeviceWidth = Dimensions.get('window').width
const DeviceHeight = Dimensions.get('window').height
const buildNumber = DeviceInfo.getBuildNumber()

/**
 * Create a Device util to hold all the common values
 */
const Device: DeviceProps = {
  w: DeviceWidth,
  h: DeviceHeight,
  isIOS,
  isAndroid,
  buildNumber,
}

export default Device
