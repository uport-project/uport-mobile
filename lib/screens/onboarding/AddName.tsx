import * as React from 'react'
import { Screen, Container, Input, NavBar } from '@kancha'
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
      <Screen type={Screen.Types.Primary}>
        <Container>
          <Input value={'Hello Text'} />
        </Container>
        <NavBar
          leftButtonAction={() => this.props.navigator.pop()}
          rightButtonAction={() => this.props.navigator.push({ screen: 'onboarding2.AddName' })}
          rightButttonText={'Skip'}
        />
      </Screen>
    )
  }
}

export default AddName
