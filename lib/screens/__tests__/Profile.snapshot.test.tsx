import 'react-native'
import React from 'react'
import { UserProfile } from '../Profile'
import { render } from 'react-native-testing-library'

jest.mock('react-native-navigation', () => {
  return {
    Navigation: {
      events: jest.fn().mockReturnValue({ bindComponent: jest.fn }),
      mergeOptions: jest.fn(),
    },
  }
})

it('renders a Scanner Screen', () => {
  const tree = render(
    <UserProfile
      avatar={{ uri: '' }}
      name={'TEST'}
      email={'TEST'}
      country={'TEST'}
      phone={'TEST'}
      userData={{}}
      address={'TEST'}
      shareToken={'TEST'}
      verifications={[]}
      allIdentities={[]}
      accounts={[]}
      updateShareToken={jest.fn}
      accountProfileLookup={jest.fn}
      storeOwnClaim={jest.fn}
      editMyInfo={jest.fn}
      addImage={jest.fn}
      switchIdentity={jest.fn}
      refreshBalance={jest.fn}
    />,
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
