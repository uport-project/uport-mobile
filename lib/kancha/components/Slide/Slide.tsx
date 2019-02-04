import * as React from 'react'
import { Image, ImageSourcePropType } from 'react-native'
import { Container, Text } from '@kancha'

export interface OnboardingSwiperSlide {
  key: string
  title: string
  content: string
  image: ImageSourcePropType
}

interface SlideProps extends OnboardingSwiperSlide {}

const Slide: React.FC<SlideProps> = ({ image, title, content }) => {
  return (
    <Container flex={1}>
      <Container flex={1} alignItems={'center'} justifyContent={'center'}>
        <Container backgroundColor={'#958CF6'} br={130} w={260} h={260} alignItems={'center'} justifyContent={'center'}>
          <Image source={image} />
        </Container>
      </Container>
      <Container flex={1} padding={30}>
        <Container marginTop={30} marginBottom>
          <Text type={Text.Types.H2} bold>
            {title}
          </Text>
        </Container>
        <Text>{content}</Text>
      </Container>
    </Container>
  )
}

export default Slide
