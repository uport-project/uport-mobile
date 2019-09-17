import * as React from 'react'
import { Container, Card, Text, Icon, Button } from '@kancha'
import { Image, Linking } from 'react-native'
import { Navigation } from 'react-native-navigation'

interface SurveyProps {
  componentId: string,
  config: any
}

const Survey: React.FC<SurveyProps> = props => {
  return (
    <Card>
      <Container padding>
        <Text bold type={Text.Types.H3}>
          {props.config.title}
        </Text>
      </Container>
      <Container paddingLeft paddingRight paddingBottom>
        <Text type={Text.Types.Body}>{props.config.description}</Text>
      </Container>
      <Container padding>
        <Button
          fullWidth
          type={Button.Types.Primary}
          block={Button.Block.Filled}
          buttonText={props.config.accept}
          onPress={() => Linking.openURL(props.config.surveyUrl)}
        />
      </Container>
      <Container padding>
        <Button
          fullWidth
          type={Button.Types.Primary}
          block={Button.Block.Clear}
          buttonText={props.config.dismiss}
          onPress={() => Navigation.dismissModal(props.componentId)}
        />
      </Container>
    </Card>
  )
}

export default Survey
