import * as React from 'react'
import { Container, MarketPlace } from '@kancha'

interface MarketPlaceModalProps {
  componentId: string,
  config: any
}

const MarketPlaceModal: React.FC<MarketPlaceModalProps> = props => {
  return (
    <Container flex={1} justifyContent={'flex-end'} padding>
      <MarketPlace config={props.config} componentId={props.componentId}/>
    </Container>
  )
}

export default MarketPlaceModal
