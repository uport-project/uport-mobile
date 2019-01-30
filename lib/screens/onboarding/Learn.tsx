import * as React from 'react'
import { Image } from 'react-native'
import {
  Screen,
  Container,
  Text,
  Images,
  Button,
  Theme,
  OnboardingContent,
  OnboardingSwiperSlide,
  Slide,
  NavBar,
} from '@kancha'
import { Navigator } from 'react-native-navigation'
import Swiper from 'react-native-swiper'

const onboardingSlides: OnboardingSwiperSlide[] = OnboardingContent(Images)

interface LearnProps {
  navigator: Navigator
}

class Learn extends React.Component<LearnProps> {
  static navigatorStyle = {
    navBarHidden: true,
  }

  state = {
    index: 0,
  }

  updateSlideIndex = (index: number) => {
    this.setState({ index })
  }

  render() {
    return (
      <Screen
        type={Screen.Types.Custom}
        config={Screen.Config.SafeNoScroll}
        backgroundImage={Images.backgrounds.purpleGradientHalve}
      >
        <Swiper
          loop={false}
          bounces
          activeDotColor={Theme.colors.primary.brand}
          paginationStyle={{ marginBottom: 30 }}
          onIndexChanged={this.updateSlideIndex}
        >
          {onboardingSlides.map((slide: OnboardingSwiperSlide) => {
            return <Slide key={slide.key} title={slide.title} content={slide.content} image={slide.image} />
          })}
        </Swiper>
        <NavBar
          leftButtonAction={() => this.props.navigator.pop()}
          rightButtonAction={() => this.props.navigator.push({ screen: 'onboarding2.IdentityCreated' })}
          rightButttonText={this.state.index === 2 ? 'Next' : 'Skip'}
        />
      </Screen>
    )
  }
}

export default Learn
