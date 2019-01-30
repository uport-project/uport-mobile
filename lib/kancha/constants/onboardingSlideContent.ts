import { ImageSourcePropType } from 'react-native'

export interface OnboardingSwiperSlide {
  key: string
  title: string
  content: string
  image: ImageSourcePropType
}

export const OnboardingContent = ({ onboarding }: any): OnboardingSwiperSlide[] => {
  return [
    {
      key: 'slide-1',
      title: 'Take back control',
      content:
        'uPort allows you to receive and store important information about yourself so that you can keep it under your control',
      image: onboarding.shield,
    },
    {
      key: 'slide-2',
      title: 'Protect your privacy',
      content: 'Control what data you share with applications you interact with. ',
      image: onboarding.eye,
    },
    {
      key: 'slide-3',
      title: 'Use new apps',
      content: 'Login to a new wave of decentralized applications for gaming, finance, social media and much more!',
      image: onboarding.apps,
    },
  ]
}
