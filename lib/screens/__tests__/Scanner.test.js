import 'react-native'
import React from 'react'
import ConnectedScanner, { ScannerScreen } from '../Scanner'
import renderer from 'react-test-renderer'

it('renders a Scanner Screen', () => {
  const tree = renderer.create(<ScannerScreen />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders a connected Scanner', () => {
  const initialState = {}
  const wrapper = global.shallow(<ConnectedScanner />, {
    context: { store: global.mockStore(initialState) },
  })
  expect(wrapper.dive()).toMatchSnapshot()
})
