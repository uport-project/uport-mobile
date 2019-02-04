import * as React from 'react'
import { Screen, Images, Theme, Slide, NavBar, OnboardingSwiperSlide } from '@kancha'
import { Navigator, NavigatorStyle } from 'react-native-navigation'
import Swiper from 'react-native-swiper'
import { OnboardingContent } from 'uPortMobile/lib/content/onboardingSlideContent'

const onboardingSlides: OnboardingSwiperSlide[] = OnboardingContent(Images)

interface LearnProps {
  navigator: Navigator
}

const Learn: React.FC<LearnProps> & { navigatorStyle: NavigatorStyle } = props => {
  return (
    <Screen
      type={Screen.Types.Custom}
      config={Screen.Config.SafeNoScroll}
      backgroundImage={Images.backgrounds.purpleGradientHalve}
      statusBarHidden
      footerNavComponent={
        <NavBar
          leftButtonAction={() => props.navigator.pop()}
          rightButtonAction={() => props.navigator.push({ screen: 'onboarding2.Terms' })}
          rightButttonText={'Next'}
        />
      }
    >
      <Swiper
        loop={false}
        autoplay
        bounces
        activeDotColor={Theme.colors.primary.brand}
        paginationStyle={{ marginBottom: 30 }}
      >
        {onboardingSlides.map((slide: OnboardingSwiperSlide) => {
          return <Slide key={slide.key} title={slide.title} content={slide.content} image={slide.image} />
        })}
      </Swiper>
    </Screen>
  )
}

Learn.navigatorStyle = {
  navBarHidden: true,
}

export default Learn
