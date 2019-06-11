import * as React from 'react'
import { render } from 'react-native-testing-library'
import MarketPlaceModal from '../MarketPlace'

const config = {
  name: 'Test name',
  description: 'test Description',
  dismiss: 'No thanks',
  serviceProviders: [
    {
      referenceId: '55e345',
      product: 'Product name',
      provider: 'Product provider',
      url: 'https://www.somedomain.com',
      logo: 'https://www.somedomain.com',
    },
  ],
}

describe('MarketPlaceModal', () => {
  it('renders with props', () => {
    const tree = render(<MarketPlaceModal config={config} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
