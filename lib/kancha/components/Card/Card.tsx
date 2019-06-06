import * as React from 'react'
import { Container, ContainerProps } from '@kancha'
import { TouchableOpacity } from 'react-native'

interface Card extends ContainerProps {
  onPress?: () => void
}

const Card: React.FC<Card> = props => {
  const br = 5
  return (
    <TouchableOpacity disabled={!props.onPress} onPress={props.onPress}>
      <Container
        flexDirection={'row'}
        backgroundColor={'#FFFFFF'}
        br={br}
        viewStyle={{
          shadowColor: '#000000',
          shadowRadius: 8,
          shadowOpacity: 0.2,
          elevation: 3,
        }}
        {...props}>
        <Container flex={1} br={br}>
          {props.children}
        </Container>
      </Container>
    </TouchableOpacity>
  )
}

export default Card
