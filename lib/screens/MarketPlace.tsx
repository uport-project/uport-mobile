import * as React from 'react'
import { Container, MarketPlace } from '@kancha'

interface MarketPlaceModalProps {
  dismiss: (componentId?: string) => void
  componentId?: string
}

const MarketPlaceModal: React.FC<MarketPlaceModalProps> = props => {
  return (
    <Container flex={1} justifyContent={'flex-end'} padding>
      <MarketPlace />
    </Container>
  )
}

export default MarketPlaceModal
