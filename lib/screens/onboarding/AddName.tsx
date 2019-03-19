import * as React from 'react'
import { Screen, Container, Input, NavBar, Text } from '@kancha'
import { Navigator } from 'react-native-navigation'

interface AddNameProps {
  navigator: Navigator
}

class AddName extends React.Component<AddNameProps> {
  static navigatorStyle = {
    navBarHidden: true,
  }

  state = {
    valid: false,
    name: '',
  }

  onChangeText = (text: string) => {
    this.setState({
      valid: !!text,
      name: text,
    })
  }

  render() {
    return (
      <Screen
        type={Screen.Types.Primary}
        config={Screen.Config.SafeNoScroll}
        statusBarHidden
        footerNavComponent={
          <NavBar
            dividerTop
            leftButtonAction={() => this.props.navigator.pop()}
            rightButtonAction={() =>
              this.props.navigator.push({ screen: 'onboarding2.AddAvatar', passProps: { name: this.state.name } })
            }
            rightButttonText={'Next'}
            rightButtonDisabled={!this.state.valid}
          />
        }
      >
        <Container flex={1} justifyContent={'center'} alignItems={'center'}>
          <Container alignItems={'center'} paddingBottom>
            <Text type={Text.Types.H2} bold>
              Name or Username
            </Text>
            <Container paddingTop={5}>
              <Text type={Text.Types.SubTitle}>Required</Text>
            </Container>
          </Container>
          <Container flexDirection={'row'} w={280}>
            <Input
              placeholder={'Enter name or username'}
              textType={Text.Types.H4}
              autoFocus
              value={this.state.name}
              onChangeText={this.onChangeText}
              valid={this.state.valid}
            />
          </Container>
          <Container padding>
            <Text type={Text.Types.SubTitle} textAlign={'center'}>
              Your name will not be shared with us or any other party until you choose to do so. You can change your
              name at anytime.
            </Text>
          </Container>
        </Container>
      </Screen>
    )
  }
}

export default AddName
