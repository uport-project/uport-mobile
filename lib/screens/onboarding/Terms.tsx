import * as React from 'react'
import { Navigator, NavigatorStyle } from 'react-native-navigation'
import { Screen, Container, Text, NavBar } from '@kancha'

import termsConditions from 'uPortMobile/lib/content/termsContent.json'

interface TermsProps {
  navigator: Navigator
}

interface TermComponentProps {
  termsContent: any
}

export const TermsComponent: React.FC<TermComponentProps> = ({ termsContent }) => {
  return (
    <Container padding>
      <Text type={Text.Types.H2} bold>
        {termsContent.name}
      </Text>
      <Text type={Text.Types.SubTitle}>{termsContent.version}</Text>
      <Container paddingTop paddingBottom>
        <Text>{termsContent.notice}</Text>
      </Container>
      <Container paddingTop paddingBottom>
        <Text>{termsContent.summary}</Text>
      </Container>
      {termsContent.sections.map((section: any) => {
        return (
          <Container key={section.section}>
            <Container>
              <Text bold type={Text.Types.H3} paddingBottom>
                {section.title}
              </Text>
            </Container>
            {section.clauses.map((clause: any) => {
              return (
                <Container paddingBottom key={clause.number}>
                  {section.clauses.length > 1 && clause.title && (
                    <Text bold>
                      {clause.number} {clause.title}
                    </Text>
                  )}
                  <Text>{clause.content}</Text>
                </Container>
              )
            })}
          </Container>
        )
      })}
    </Container>
  )
}

/**
 * Terms screen. The terms component could be extracted so it can be used in the setting also
 */
const Terms: React.FC<TermsProps> & { navigatorStyle: NavigatorStyle } = props => {
  return (
    <Screen
      statusBarHidden
      type={Screen.Types.Primary}
      config={Screen.Config.SafeScroll}
      footerNavComponent={
        <NavBar
          leftButtonAction={() => props.navigator.pop()}
          rightButtonAction={() => props.navigator.push({ screen: 'onboarding2.Privacy' })}
          rightButttonText={'I agree'}
        />
      }
    >
      <TermsComponent termsContent={termsConditions} />
    </Screen>
  )
}

Terms.navigatorStyle = {
  navBarHidden: true,
}

export default Terms
