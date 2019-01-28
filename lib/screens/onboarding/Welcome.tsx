import * as React from 'react'
import { Screen, Container, Button, Text } from '@kancha'

interface WelcomeProps {}

class Welcome extends React.Component<WelcomeProps> {
  render() {
    return (
      <Screen type={Screen.Types.Custom}>
        <Container flex={1}>
          {/* <Button
            buttonText={'Primary Filled'}
            onPress={() => 'Hello Button'}
            type={Button.Types.Primary}
            block={Button.Block.Filled}
          />
          <Button
            buttonText={'Primary Outlined'}
            onPress={() => 'Hello Button'}
            type={Button.Types.Primary}
            block={Button.Block.Outlined}
          />
          <Button
            buttonText={'Primary Clear'}
            onPress={() => 'Hello Button'}
            type={Button.Types.Primary}
            block={Button.Block.Clear}
          />
          <Button
            buttonText={'Confirm Filled'}
            onPress={() => 'Hello Button'}
            type={Button.Types.Confirm}
            block={Button.Block.Filled}
          /> */}
        </Container>
      </Screen>
    )
  }
}

export default Welcome
