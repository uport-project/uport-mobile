import * as React from 'react'
import { Screen, Container, Button, Text } from '@kancha'
import { Image } from 'react-native'

interface WelcomeProps {}

class Welcome extends React.Component<WelcomeProps> {
  render() {
    return (
      <Screen backgroundImage={'purple-gradient'} type={Screen.Types.Custom} config={Screen.Config.SafeNoScroll}>
        <Container flex={1}>
          <Container flex={1} justifyContent={'space-around'} alignItems={'center'} paddingTop={50}>
            <Image
              source={require('uPortMobile/assets/images/uport-white.png')}
              style={{ height: 100 }}
              resizeMode={'contain'}
            />
            <Text type={Text.Types.H3} textColor={'white'} bold textAlign={'center'}>
              Get started by creating a new identity.
            </Text>
          </Container>
          <Container flex={1} paddingTop>
            <Button
              bold
              centered
              buttonText={'Create New Identity'}
              onPress={() => 'Create New Identity'}
              type={Button.Types.Custom}
              block={Button.Block.Filled}
            />
            <Button
              bold
              centered
              buttonText={'Recover Identity'}
              onPress={() => 'Recover Identity'}
              type={Button.Types.Custom}
              block={Button.Block.Clear}
            />
          </Container>
        </Container>
      </Screen>
    )
  }
}

export default Welcome
