import * as React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
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
  const component = renderer.create(<AcceptCredential {...props} />)
  const tree = component.toJSON()

  it('renders with props', () => {
    expect(tree).toMatchSnapshot()
  })

  it('should have an accept button', () => {
    const wrapper = renderer.create(<AcceptCredential {...props} />).root
    const acceptButton = wrapper.findByProps({ buttonText: 'Accept' })

    acceptButton.props().onPress()

    expect(acceptButton).toBeDefined()
    // expect(props.authorizeRequest).toHaveBeenCalled()
  })

  // it('should have an decline button', () => {
  //   const wrapper = shallow(<AcceptCredential {...props} />)
  //   const declineButton = wrapper.findWhere(node => node.prop('buttonText') === 'Decline')
  //   // declineButton.props().onPress()

  //   // expect(declineButton).toBeDefined()
  //   // expect(props.cancelRequest).toHaveBeenCalled()
  // })

  // it('should fire function when accept it tapped', () => {})
  // it('should fire function when decline it tapped', () => {})
})
