import * as React from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { Screen, Container, Input, NavBar, Text } from '@kancha'
import { Navigator } from 'react-native-navigation'

interface AddNameProps {
  navigator: Navigator
}

class AddName extends React.Component<AddNameProps> {
  static navigatorStyle = {
    navBarHidden: true,
  }

  render() {
    return (
      <Screen type={Screen.Types.Primary} config={Screen.Config.SafeNoScroll}>
        <Container flex={1} justifyContent={'center'} alignItems={'center'}>
          <Container flexDirection={'row'} w={280}>
            <Input value={'Hello Text'} textType={Text.Types.H4} autoFocus />
          </Container>
          <Container alignItems={'center'} paddingTop>
            <Text type={Text.Types.H2} bold>
              Name or Nickname
            </Text>
          </Container>
        </Container>
        <NavBar
          leftButtonAction={() => this.props.navigator.pop()}
          rightButtonAction={() => this.props.navigator.push({ screen: 'onboarding2.AddName' })}
          rightButttonText={'Next'}
        />
      </Screen>
    )
  }
}

export default AddName
