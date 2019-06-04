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
  backgroundColor?: string
  avatar: any
  requestor: string
  httpsResolveStatus: any
  size?: 'small' | 'medium'
  subTitle?: string
}

const bannerSize: { [index: string]: number } = {
  small: 180,
  medium: 250,
}

const Banner: React.FC<BannerProps> = props => {
  const BannerStyle: ViewStyle = {
    backgroundColor: '#333333',
    flex: 1,
    height: bannerSize[props.size ? props.size : bannerSize.medium],
  }
  return (
    <ImageBackground source={props.backgroundImage} style={BannerStyle}>
      <Container
        backgroundColor={props.backgroundColor ? props.backgroundColor : 'rgba(0,0,0,0.5)'}
        flex={1}
        alignItems={'center'}
        justifyContent={'center'}
        paddingTop>
        <Logo image={props.avatar} />
        <Container paddingTop>
          <Text type={Text.Types.H3} textColor={'#FFFFFF'}>
            {props.requestor || 'No name provided'}
          </Text>
          <Container paddingTop={5}>
            <Text type={Text.Types.SubTitle} textColor={'#FFFFFF'}>
              {props.subTitle && props.subTitle}
            </Text>
          </Container>
        </Container>
      </Container>
    </ImageBackground>
  )
}

Banner.defaultProps = {
  size: 'medium',
}

export default Banner
