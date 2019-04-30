import * as React from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { Container } from '@kancha'

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

export default ScannerButton
