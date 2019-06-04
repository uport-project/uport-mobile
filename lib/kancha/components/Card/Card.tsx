import * as React from 'react'
import { Container } from '@kancha'

interface Card {}

const Card: React.FC<Card> = props => {
  const br = 5
  return (
    <Container
      backgroundColor={'#FFFFFF'}
      br={br}
      viewStyle={{
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        elevation: 3,
      }}>
      <Container flex={1} br={br} viewStyle={{ overflow: 'hidden' }}>
        {props.children}
      </Container>
    </Container>
  )
}

export default Card
