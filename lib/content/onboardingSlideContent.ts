import { OnboardingSwiperSlide } from '@kancha'

export const OnboardingContent = ({ onboarding }: any): OnboardingSwiperSlide[] => {
  return [
    {
      key: 'slide-1',
      heading: 'Take Back Control',
      content: 'Own your data and identity, share it on your terms.',
      image: onboarding.shield,
    },
    {
      key: 'slide-2',
      heading: 'Redefining Privacy Protection',
      content: 'Nobody can access information you store unless you share it with them. Not even us.',
      image: onboarding.eye,
    },
    {
      key: 'slide-3',
      heading: 'Sign Up for Self-Sovereignty',
      content: 'Enjoy seamless access to the Haven Cloud and anywhere uPort ID is accepted! ',
      image: onboarding.apps,
    },
  ]
}
