import { Device } from '@kancha'
import ScannerIOS from './Scanner.ios'
import ScannerAndroid from './Scanner.android'

export default (Device.isIOS ? ScannerIOS : ScannerAndroid)
