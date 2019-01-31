import * as React from 'react'
import { Navigator, NavigatorStyle } from 'react-native-navigation'
import { Screen, Container, Text, NavBar } from '@kancha'

interface TermsProps {
  navigator: Navigator
}

const Terms: React.FC<TermsProps> & { navigatorStyle: NavigatorStyle } = props => {
  return (
    <Screen
      type={Screen.Types.Primary}
      config={Screen.Config.SafeScroll}
      footerNavComponent={
        <NavBar
          leftButtonAction={() => props.navigator.pop()}
          rightButtonAction={() => props.navigator.push({ screen: 'onboarding2.AddName' })}
          rightButttonText={'Next'}
        />
      }
    >
      <Text type={Text.Types.H1}>Hello World</Text>
    </Screen>
  )
}

Terms.navigatorStyle = {
  navBarHidden: true,
}

export default Terms
