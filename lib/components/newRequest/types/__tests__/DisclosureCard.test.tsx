import React from 'react'
import renderer from 'react-test-renderer'

import ConnectedDisclosureRequest, { DisclosureCard } from '../DisclosureCard'

const DisclosureCardProps = {
  requestId: 'TEST',
  componentId: 'TEST',
  title: 'Test',
  description: 'Test',
  actionButton: {
    disabled: false,
    text: 'Confirm',
    action: () => jest.fn,
  },
  cancelButton: {
    disabled: false,
    text: 'Confirm',
    action: () => jest.fn,
  },
  statsMessage: 'Text',
  requestItems: [],
  appBranding: {
    profileImage: '',
    bannerImage: '',
    requestor: '',
  },
  verifiedCredentials: [],
  missingCredentials: [],
  error: null,
}

describe('Disclosure Request Card', () => {
  it('renders dumb component', () => {
    const tree = renderer.create(<DisclosureCard {...DisclosureCardProps} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  // it('render connected component', () => {
  //   const globalJest: any = global
  //   const initialState = {}
  //   const store = globalJest.mockStore(initialState)

  //   const wrapper = globalJest
  //     .shallow(<ConnectedDisclosureRequest componentId={'TESTID'} />, { context: { store } })
  //     .toJSON()
  //   expect(wrapper).toMatchSnapshot()
  // })
})
