import * as React from 'react'
import { Device, Screen, Images, Theme, Slide, NavBar, OnboardingSwiperSlide, Button, Container } from '@kancha'
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
        <Container alignItems={'center'}>
          <Container w={320}>
            <Button
              fullWidth
              buttonText={'Continue'}
              type={Button.Types.Primary}
              block={Button.Block.Filled}
              onPress={() => props.navigator.push({ screen: 'onboarding2.CreateIdentity' })}
            />
          </Container>
        </Container>
      }
    >
      <Swiper
        style={{ marginTop: Device.isIOS ? 30 : 100 }}
        loop={false}
        autoplay
        bounces
        activeDotColor={Theme.colors.primary.brand}
        paginationStyle={{ marginBottom: Device.isIOS ? -30 : -20 }}
      >
        {onboardingSlides.map((slide: OnboardingSwiperSlide) => {
          return <Slide key={slide.key} heading={slide.heading} content={slide.content} image={slide.image} />
        })}
      </Swiper>
    </Screen>
  )
}

Learn.navigatorStyle = {
  drawUnderNavBar: true,
  navBarTranslucent: true,
  navBarTransparent: true,
  navBarBackgroundColor: 'transparent',
  navBarButtonColor: 'white',
  topBarElevationShadowEnabled: false,
}

export default Learn
