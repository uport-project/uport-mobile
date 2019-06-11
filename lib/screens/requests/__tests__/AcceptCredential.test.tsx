import * as React from 'react'
import { render, fireEvent } from 'react-native-testing-library'
import AcceptCredential from '../credentials/AcceptCredential'

const props = {
  verification: {
    claim: {
      'Test Credential': {
        name: 'Bob',
        job: 'QA Engineer',
      },
    },
    iss: 'did:ethr:0x27f3d476352659dbff6ecf559abf27a51feb8449',
  },
  address: '',
  title: 'Test Credential',
  issuer: {
    name: 'Test Issuer',
    avatar: {
      uri: 'https://someimageurl.png',
    },
    bannerImage: {
      uri: 'https://someimageurl.png',
    },
  },
  request: {},
  authorizeRequest: jest.fn(),
  cancelRequest: jest.fn(),
}

describe('MarketPlaceModal', () => {
  const component = render(<AcceptCredential {...props} />)
  const tree = component.toJSON()

  it('renders with props', () => {
    expect(tree).toMatchSnapshot()
  })

  it('should have an accept button', () => {
    const { getByText } = component
    expect(getByText('Accept')).toBeDefined()
  })

  it('should have an decline button', () => {
    const { getByText } = component
    expect(getByText('Decline')).toBeDefined()
  })

  it('should call authorize when accept', () => {
    const { getByText } = component

    fireEvent.press(getByText('Accept'))
    expect(props.authorizeRequest).toHaveBeenCalled()
  })

  it('should call cancel when cancel when declined', () => {
    const { getByText } = component

    fireEvent.press(getByText('Decline'))
    expect(props.cancelRequest).toHaveBeenCalled()
  })
})
