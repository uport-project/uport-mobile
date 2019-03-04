import { OnboardingSwiperSlide } from '@kancha'

export const OnboardingContent = ({ onboarding }: any): OnboardingSwiperSlide[] => {
  return [
    {
      key: 'slide-1',
      heading: 'Take back control',
      content: 'Recieve and store important information about yourself',
      image: onboarding.shield,
    },
    {
      key: 'slide-2',
      heading: 'Protect your privacy',
      content: 'Nobody can see the information you store unless you share it with them',
      image: onboarding.eye,
    },
    {
      key: 'slide-3',
      heading: 'Sign up and sign in',
      content: 'Enjoy quick, seamless, and often free access to new services',
      image: onboarding.apps,
    },
  ]
}
