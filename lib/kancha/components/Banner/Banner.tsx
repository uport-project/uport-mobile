import * as React from 'react'
import { ImageBackground, ViewStyle, Image } from 'react-native'
import { Container, Text } from '@kancha'

const Logo: React.FC<any> = props => {
  return (
    <Container backgroundColor={'#FFFFFF'} br={10} viewStyle={{ overflow: 'hidden' }}>
      <Image resizeMode={'cover'} source={props.image} style={{ width: 70, height: 70 }} />
    </Container>
  )
}

interface BannerProps {
  backgroundImage: any
  avatar: any
  requestor: string
  httpsResolveStatus: any
}

const Banner: React.FC<BannerProps> = props => {
  const BannerStyle: ViewStyle = {
    backgroundColor: '#333333',
    flex: 1,
    height: 250,
  }
  return (
    <ImageBackground source={props.backgroundImage} style={BannerStyle}>
      <Container
        backgroundColor={'rgba(0,0,0,0.5)'}
        flex={1}
        alignItems={'center'}
        justifyContent={'center'}
        paddingTop
      >
        <Logo image={props.avatar} />
        <Container paddingTop>
          <Text type={Text.Types.H3} textColor={'#FFFFFF'}>
            {props.requestor || 'No name provided'}
          </Text>
        </Container>
      </Container>
    </ImageBackground>
  )
}

export default Banner
