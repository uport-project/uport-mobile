import * as React from 'react'
import { Container, Survey } from '@kancha'

interface SurveyModalProps {
  componentId: string,
  config: any
}

const SurveyModal: React.FC<SurveyModalProps> = props => {
  return (
    <Container flex={1} justifyContent={'flex-end'} padding>
      <Survey config={props.config} componentId={props.componentId}/>
    </Container>
  )
}

export default SurveyModal
