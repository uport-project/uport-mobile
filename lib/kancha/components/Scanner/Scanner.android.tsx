import * as React from 'react'
import { Container } from '@kancha'
import { ScannerProps, ScannerState } from './scannerProps'

interface AndroidScannerProps extends ScannerProps {}
interface AndroidScannerState extends ScannerState {}

const ScannerAndroid: React.FC<AndroidScannerProps> = () => {
  return <Container />
}

export default ScannerAndroid
