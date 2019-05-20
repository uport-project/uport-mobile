import * as React from 'react'
import { Container, Text, Section, ListItem, Button, Icon, Credential } from '@kancha'

import { ImageBackground, ViewStyle, Image } from 'react-native'

interface RequestProps {
  dismissRequest: () => void
}

interface RequestState {}

const IndicatorBar: React.FC<any> = () => {
  const triangle: ViewStyle = {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#333333',
    transform: [{ rotate: '180deg' }],
  }

  return (
    <Container backgroundColor={'#FFFFFF'}>
      <Container backgroundColor={'#333333'} padding>
        <Text textColor={'#FFFFFF'} type={Text.Types.SectionHeader} textAlign={'center'}>
          JP Morgan is requesting you do something
        </Text>
      </Container>
      <Container alignItems={'center'}>
        <Container viewStyle={triangle} />
      </Container>
    </Container>
  )
}

const RequestContent: React.FC<any> = () => {
  return (
    <Section noTopMargin noTopBorder>
      <ListItem title={'Title of item'}>Main Item Name</ListItem>
      <ListItem title={'Title of item'}>Main Item Name</ListItem>
      <ListItem title={'Title of item'}>Main Item Name</ListItem>
      <Credential claimType={'Hello World'} componentId={'TEST'} missing />
    </Section>
  )
}

const Logo: React.FC<any> = () => {
  return (
    <Image
      source={require('uPortMobile/assets/images/sample-logo.png')}
      borderRadius={10}
      style={{ height: 60, width: 60 }}
    />
  )
}

const Banner: React.FC<any> = () => {
  const BannerStyle: ViewStyle = {
    backgroundColor: '#333333',
    flex: 1,
    height: 250,
  }

  return (
    <ImageBackground source={require('uPortMobile/assets/images/sydney.png')} style={BannerStyle}>
      <Container
        backgroundColor={'rgba(0,0,0,0.5)'}
        flex={1}
        alignItems={'center'}
        justifyContent={'center'}
        paddingTop>
        <Logo />
        <Container paddingTop>
          <Text type={Text.Types.H3} textColor={'#FFFFFF'}>
            Name of Entity
          </Text>
        </Container>
      </Container>
    </ImageBackground>
  )
}

/**
 * Request component handles the display of all  requests
 */
class Request extends React.Component<RequestProps, RequestState> {
  render() {
    return (
      <Container>
        <Container viewStyle={{ position: 'absolute', zIndex: 10, top: 20, right: 20 }}>
          <Button
            iconButton
            noPadding
            icon={<Icon name={Icon.Names.close} font={'evil'} color={'#FFFFFF'} size={30} />}
            onPress={() => this.props.dismissRequest()}
          />
        </Container>
        <Banner />
        <IndicatorBar />
        <RequestContent />
      </Container>
    )
  }
}

export default Request
