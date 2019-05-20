import * as React from 'react'
import { Request, Screen, Container, Button, Text } from '@kancha'
import { Navigation } from 'react-native-navigation'

interface RequestScreenProps {
  navigator: any
}
interface RequestScreenState {}

class RequestScreen extends React.Component<RequestScreenProps, RequestScreenState> {
  constructor(props: RequestScreenProps) {
    super(props)

    this.state = {}
    this.closeRequestScreen = this.closeRequestScreen.bind(this)
  }

  closeRequestScreen() {
    /**
     * Close modal
     */

    Navigation.dismissAllModals()
  }

  render() {
    return (
      <Screen
        footerNavComponent={
          <Container>
            <Text textAlign={'center'} type={Text.Types.SectionHeader}>
              You have intercated with Onfido 11 times
            </Text>
            <Container flexDirection={'row'} padding>
              <Container flex={1} paddingRight>
                {' '}
                <Button
                  depth={1}
                  buttonText={'Decline'}
                  block={Button.Block.Clear}
                  type={Button.Types.Warning}
                  onPress={() => {
                    ''
                  }}
                />
              </Container>
              <Container flex={2}>
                {' '}
                <Button
                  buttonText={'Accept'}
                  block={Button.Block.Filled}
                  type={Button.Types.Primary}
                  onPress={() => {
                    ''
                  }}
                />
              </Container>
            </Container>
          </Container>
        }
        config={Screen.Config.Scroll}
        type={Screen.Types.Secondary}
        statusBarHidden
      >
        <Request dismissRequest={this.closeRequestScreen} />
      </Screen>
    )
  }
}

export default RequestScreen
