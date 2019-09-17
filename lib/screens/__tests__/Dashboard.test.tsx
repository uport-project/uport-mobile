import * as React from 'react'
import { render } from 'react-native-testing-library'
import { Dashboard } from '../Dashboard'
import credentials from '../../stubbs/credentials.json'

describe('Dashboard', () => {
  it('should render with props', () => {
    const tree = render(<Dashboard componentId="TEST" credentials={credentials} openURL={() => {}}/>).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should display the swag credential', () => {
    const { getByText } = render(<Dashboard componentId="TEST" credentials={credentials} openURL={() => {}}/>)

    expect(getByText(/Swag Pass/)).toBeDefined()
    expect(getByText(/uPort Demo/)).toBeDefined()
  })
})
