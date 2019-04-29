import * as React from 'react'
import { Navigation } from 'react-native-navigation'
import SCREENS from '../Screens'
import { Device, Screen, Images, Theme, Slide, NavBar, OnboardingSwiperSlide, Button, Container } from '@kancha'
import { OnboardingContent } from 'uPortMobile/lib/content/onboardingSlideContent'
import Swiper from 'react-native-swiper'
import TESTID from 'uPortMobile/lib/e2e/testIDs'

const onboardingSlides: OnboardingSwiperSlide[] = OnboardingContent(Images)

interface LearnProps {
  componentId: string
}

const Learn: React.FC<LearnProps> = props => {
  return (
    <Screen
      type={Screen.Types.Custom}
      config={Screen.Config.SafeNoScroll}
      backgroundImage={Images.backgrounds.purpleGradientHalve}
      statusBarHidden
      footerNavComponent={
        <Container alignItems={'center'}>
          <Container w={300}>
            <Button
              testID={TESTID.ONBOARDING_LEARN_CONTINUE}
              fullWidth
              buttonText={'Continue'}
              type={Button.Types.Primary}
              block={Button.Block.Filled}
              onPress={() => Navigation.push(props.componentId, { component: { name: SCREENS.CreateIdentity } })}
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

export default Learn
