import * as React from 'react'
import { Container, Card, Text, Icon, Button } from '@kancha'
import { Image, Linking } from 'react-native'
import { Navigation } from 'react-native-navigation'

interface ServiceProviders {
  referenceId: string
  product: string
  provider: string
  url: string
  logo: string
}

const serviceProviders: ServiceProviders[] = [
  {
    referenceId: '55e345',
    product: 'Home Loans',
    provider: 'Ally',
    url: 'https://www.ally.com/home-loans/mortgage/',
    logo: 'https://cdn6.aptoide.com/imgs/5/f/7/5f74c0034e337647b3f3fa7fad409428_icon.png?w=240',
  },
  {
    referenceId: '567856',
    product: 'Personal Loan',
    provider: 'HSBC',
    url: 'https://www.ally.com/home-loans/mortgage/',
    logo: 'https://cdn6.aptoide.com/imgs/5/f/7/5f74c0034e337647b3f3fa7fad409428_icon.png?w=240',
  },
  {
    referenceId: '234789',
    product: 'Plum Savings',
    provider: 'PLUM',
    url: 'https://www.ally.com/home-loans/mortgage/',
    logo: 'https://cdn6.aptoide.com/imgs/5/f/7/5f74c0034e337647b3f3fa7fad409428_icon.png?w=240',
  },
]

interface MarketPlaceProps {}

const MarketPlace: React.FC<MarketPlaceProps> = props => {
  return (
    <Card>
      <Container padding>
        <Text bold type={Text.Types.H3}>
          Your Onfido ID is reusable!
        </Text>
      </Container>
      <Container paddingLeft paddingRight paddingBottom>
        <Text type={Text.Types.Body}>Discover services that accept Onfido ID. Enjoy seamless and easy onboarding.</Text>
      </Container>
      <Container padding>
        {serviceProviders.map((provider: ServiceProviders) => {
          return (
            <Card key={provider.referenceId} marginBottom onPress={() => Linking.openURL(provider.url)}>
              <Container padding flexDirection={'row'} alignItems={'center'}>
                <Container>
                  <Image source={{ uri: provider.logo }} style={{ height: 30, width: 30 }} resizeMode={'cover'} />
                </Container>
                <Container flex={1} marginLeft marginRight>
                  <Text type={Text.Types.SubTitle}>{provider.provider.toUpperCase()}</Text>
                  <Text type={Text.Types.Body} bold>
                    {provider.product}
                  </Text>
                </Container>
                <Container>
                  <Icon name={'externalLink'} font={'evil'} />
                </Container>
              </Container>
            </Card>
          )
        })}
      </Container>
      <Container padding>
        <Button
          fullWidth
          type={Button.Types.Primary}
          block={Button.Block.Clear}
          buttonText={'Use it later'}
          onPress={() => Navigation.dismissAllModals()}
        />
      </Container>
    </Card>
  )
}

export default MarketPlace
