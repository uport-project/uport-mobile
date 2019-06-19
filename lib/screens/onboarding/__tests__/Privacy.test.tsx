import React from 'react'
import { render } from 'react-native-testing-library'
import Privacy from '../Privacy'

describe('Privacy Policy', () => {
  it('should render', () => {
    const tree = render(<Privacy componentId={'TEST'} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
