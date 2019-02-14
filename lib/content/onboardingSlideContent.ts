import { OnboardingSwiperSlide } from '@kancha'

export const OnboardingContent = ({ onboarding }: any): OnboardingSwiperSlide[] => {
  return [
    {
      key: 'slide-1',
      heading: 'Take back control',
      content:
        'uPort allows you to receive and store important information about yourself and keep it under your control at all times.',
      image: onboarding.shield,
    },
    {
      key: 'slide-2',
      heading: 'Protect your privacy',
      content:
        'Control the data you share with applications and services, including us. Nobody can see the information you store in uPort unless you share it with them.',
      image: onboarding.eye,
    },
    {
      key: 'slide-3',
      heading: 'Sign up and sign in',
      content:
        'Login to traditional applications including a new wave of decentralized apps for gaming, finance, social media and much more!',
      image: onboarding.apps,
    },
  ]
}
