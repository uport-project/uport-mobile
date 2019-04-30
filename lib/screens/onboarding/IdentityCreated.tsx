import * as React from 'react'
import { Image } from 'react-native'
import { Screen, Container, Images, Text, Theme } from '@kancha'

interface IdentityCreatedProps {}

class IdentityCreated extends React.Component<IdentityCreatedProps> {
  render() {
    return (
      <Screen
        backgroundImage={Images.backgrounds.purpleGradientWithPattern}
        type={Screen.Types.Custom}
        config={Screen.Config.SafeNoScroll}
      >
        <Container flex={1} alignItems={'center'} justifyContent={'center'}>
          <Container
            backgroundColor={'#958CF6'}
            br={130}
            w={260}
            h={260}
            alignItems={'center'}
            justifyContent={'center'}
            marginBottom={50}
          >
            <Image source={Images.onboarding.tick} />
          </Container>
          <Container>
            <Text type={Text.Types.H2} bold textColor={'white'}>
              Identity successfully created!
            </Text>
          </Container>
        </Container>
      </Screen>
    )
  }
}

export default IdentityCreated
