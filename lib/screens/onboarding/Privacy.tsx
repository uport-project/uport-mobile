import * as React from 'react'
import { Navigator, NavigatorStyle } from 'react-native-navigation'
import { Screen, Container, Text, NavBar } from '@kancha'

import termsConditions from 'uPortMobile/lib/content/privacyContent.json'

interface PrivacyProps {
  navigator: Navigator
}

const Privacy: React.FC<PrivacyProps> & { navigatorStyle: NavigatorStyle } = props => {
  return (
    <Screen
      statusBarHidden
      type={Screen.Types.Primary}
      config={Screen.Config.SafeScroll}
      footerNavComponent={
        <NavBar
          leftButtonAction={() => props.navigator.pop()}
          rightButtonAction={() => props.navigator.push({ screen: 'onboarding2.AddName' })}
          rightButttonText={'I agree'}
        />
      }
    >
      <Container padding>
        <Text type={Text.Types.H2} bold>
          Privacy Policy
        </Text>
        <Text type={Text.Types.SubTitle}>{termsConditions.version}</Text>
        <Container paddingTop paddingBottom>
          <Text>{termsConditions.notice}</Text>
        </Container>
        <Container paddingTop paddingBottom>
          <Text>{termsConditions.summary}</Text>
        </Container>
        {termsConditions.sections.map(section => {
          return (
            <Container key={section.section}>
              <Container>
                <Text bold type={Text.Types.H3}>
                  {section.title}
                </Text>
              </Container>
              {section.clauses.map(clause => {
                return (
                  <Container paddingBottom key={clause.number}>
                    <Text bold>
                      {section.clauses.length > 1 && clause.number} {clause.title && clause.title}
                    </Text>
                    <Text>{clause.content}</Text>
                  </Container>
                )
              })}
            </Container>
          )
        })}
      </Container>
    </Screen>
  )
}

Privacy.navigatorStyle = {
  navBarHidden: true,
}

export default Privacy
