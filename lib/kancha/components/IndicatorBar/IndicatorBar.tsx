import * as React from 'react'
import { ViewStyle } from 'react-native'
import { Container, Text, Theme } from '@kancha'

interface IndicatorBarProps {
  text: string
}

const IndicatorBar: React.FC<IndicatorBarProps> = ({ text }) => {
  const triangle: ViewStyle = {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#222222',
    transform: [{ rotate: '180deg' }],
  }

  return (
    <Container backgroundColor={Theme.colors.primary.background}>
      <Container backgroundColor={'#222222'} padding>
        <Text textColor={'#FFFFFF'} type={Text.Types.SectionHeader} textAlign={'center'}>
          {text}
        </Text>
      </Container>
      <Container alignItems={'center'}>
        <Container viewStyle={triangle} />
      </Container>
    </Container>
  )
}

export default IndicatorBar
