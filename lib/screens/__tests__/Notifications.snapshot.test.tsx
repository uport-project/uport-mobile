import * as React from 'react'
import { render } from 'react-native-testing-library'
import { Notifications } from '../Notifications'

jest.mock('react-native-navigation', () => {
  return {
    Navigation: {
      mergeOptions: () => true,
    },
  }
})

describe('Notifications', () => {
  it('should render default screen', () => {
    const tree = render(<Notifications />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
