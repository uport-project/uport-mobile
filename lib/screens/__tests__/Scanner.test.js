import 'react-native'
import React from 'react'
import ConnectedScanner, { ScannerScreen } from '../Scanner'
import renderer from 'react-test-renderer'

jest.mock('react-native-navigation', () => {
  return {
    Navigation: {
      events: jest.fn().mockReturnValue({ bindComponent: jest.fn }),
    },
  }
})

it('renders a Scanner Screen', () => {
  const tree = renderer.create(<ScannerScreen componentId={'TEST'} />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders a connected Scanner', () => {
  const initialState = {}
  const wrapper = global.shallow(<ConnectedScanner componentId={'TEST'} />, {
    context: { store: global.mockStore(initialState) },
  })
  expect(wrapper.dive()).toMatchSnapshot()
})
