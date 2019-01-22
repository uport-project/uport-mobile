import { Platform, Dimensions } from 'react-native'

interface DeviceProps {
  w: number
  h: number
  isIOS: boolean
  isAndroid: boolean
}

const isIOS = Platform.OS === 'ios'
const isAndroid = Platform.OS === 'android'
const DeviceWidth = Dimensions.get('window').width
const DeviceHeight = Dimensions.get('window').height

/**
 * Create a Device util to hold all the common values
 */
const Device: DeviceProps = {
  w: DeviceWidth,
  h: DeviceHeight,
  isIOS,
  isAndroid,
}

export default Device
