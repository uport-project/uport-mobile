import 'react-native'
import React from 'react'
import { ScannerScreen } from '../Scanner'
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
  const tree = render(<ScannerScreen componentId={'TEST'} handleQRCodeURL={jest.fn} />).toJSON()
  expect(tree).toMatchSnapshot()
})
