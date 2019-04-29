// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//
/* globals it, expect */
import 'react-native'
import React from 'react'
import ConnectedCard, { DisclosureCard } from '../DisclosureCard-Deprecated'
import FakeProvider from 'uPortMobile/lib/components/testHelpers/FakeProvider'
import FakeNavigator from '../../../testHelpers/FakeNavigator'
import { AcceptCancelGroup, PrimaryButton } from 'uPortMobile/lib/components/shared/Button'
import renderer from 'react-test-renderer'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { toClj, toJs } from 'mori'
// jest.mock('uPortMobile/lib/selectors/requests', () => {
//   return {
//     externalProfile: jest.fn()
//   }
// })
const rinkebyAccount = '2op3oXVofN6R12WorHRS3zzc9sumUfL5xT8'
const kovanAccount = '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX'

const simpleRequest = {
  postback: false,
  id: 14819973609293640,
  account: rinkebyAccount,
  target: rinkebyAccount,
  network: '0x4',
  callback_url: 'https://testapp.uport.me',
  type: 'disclosure',
  client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
}

const segregatedRequest = { ...simpleRequest, network: '0x2a', account: undefined }

const fullRequest = {
  type: 'disclosure',
  postback: false,
  account: rinkebyAccount,
  target: rinkebyAccount,
  id: 14819973609293640,
  validatedSignature: true,
  client_id: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  callback_url: 'https://testapp.uport.me',
  requested: ['name', 'phone', 'description', 'avatar'],
  allClaims: {
    avatar: {
      uri: 'https://cloudflare-ipfs.com/ipfs/QmTXekkFNgrcFkLgya4Ngv1gDTrYjBNzmNMZLa6XM7AvdU',
    },
    connections: {},
    name: 'jeffTest TestWard',
    phone: '15165518624',
  },
}

const fullRequestWithPush = { ...fullRequest, pushPermissions: true }

const currentIdentity = {
  avatar: {
    uri: 'https://cloudflare-ipfs.com/ipfs/QmaJBgr3xHfY94MTzCUY23UWSpRBdTnBJaN3WrERJkgdGb',
  },
  name: 'Jeff PictureTest',
  publicKey:
    '0x04c164b7e86e75d41a74964dc5864facd1a7e472d011b33a84a1365b47d30d7752e26446752cf928056ad903377d2002a30d71f967b3ae348231a2ad1a0e92d3a1',
}

const userClaims = {
  avatar: {
    uri: 'https://cloudflare-ipfs.com/ipfs/QmTXekkFNgrcFkLgya4Ngv1gDTrYjBNzmNMZLa6XM7AvdU',
  },
  connections: {},
  name: 'jeffTest TestWard',
  phone: '15165518624',
}

const verifiedClaims = [
  {
    iss: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
    exp: 1,
    claimType: 'name',
    claim: {
      name: 'jeffTest TestWard',
    },
    issuer: {
      name: 'Global Enterprises',
    },
    token: '0011.TOKEN',
  },
]

const missingClaim = {
  type: 'email',
  reason: 'This is important so we can send you emails',
  essential: true,
}

const missingClaimWithIssuer = {
  type: 'email',
  iss: [{ did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', url: 'https://uport.claims' }],
  reason: 'This is important so we can send you emails',
  essential: true,
}

const missingClaimWithMultipleIssuer = {
  type: 'email',
  iss: [
    { did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', url: 'https://uport.claims' },
    { did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc0a', url: 'https://serto.claims' },
  ],
  reason: 'This is important so we can send you emails',
  essential: true,
}

const missingClaimWithIssuerWithoutURL = {
  type: 'email',
  iss: [{ did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01' }],
  reason: 'This is important so we can send you emails',
  essential: true,
}

const client = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  name: 'Coinbase',
}

const clear = () => null
const cancel = () => {}
const authorize = () => {}

describe('DisclosureCard', () => {
  describe('with network', () => {
    describe('with pre-existing account', () => {
      it('renders correctly with a simple request', () => {
        const tree = renderer
          .create(
            <DisclosureCard
              requestId={simpleRequest.id}
              account={rinkebyAccount}
              client={client}
              network={'0x4'}
              requested={userClaims}
              verified={[]}
              cancelRequest={cancel}
              interactionStats={{ share: 1 }}
              clear={clear}
              authorizeRequest={authorize}
              currentIdentity={currentIdentity}
            />,
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
    describe('with no existing account for network', () => {
      it('renders correctly with a simple request', () => {
        const tree = renderer
          .create(
            <DisclosureCard
              requestId={simpleRequest.id}
              client={client}
              network={'0x4'}
              requested={userClaims}
              verified={[]}
              cancelRequest={cancel}
              interactionStats={{ share: 1 }}
              clear={clear}
              authorizeRequest={authorize}
              currentIdentity={currentIdentity}
            />,
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
    describe('with no existing segregated account for client', () => {
      it('renders correctly with a simple request', () => {
        const tree = renderer
          .create(
            <DisclosureCard
              requestId={simpleRequest.id}
              client={client}
              network={'0x4'}
              actType={'segregated'}
              requested={userClaims}
              verified={[]}
              cancelRequest={cancel}
              interactionStats={{ share: 1 }}
              clear={clear}
              authorizeRequest={authorize}
              currentIdentity={currentIdentity}
            />,
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })

  it('renders correctly with a simple request and client info', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          requestId={simpleRequest.id}
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          client={client}
          requested={userClaims}
          verified={[]}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
          authorizeRequest={authorize}
          currentIdentity={currentIdentity}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a segregated account request and client info', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          requestId={segregatedRequest.id}
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          client={client}
          requested={userClaims}
          verified={[]}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
          authorizeRequest={authorize}
          currentIdentity={currentIdentity}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with error', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          requestId={simpleRequest.id}
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          error='JWT has Expired'
          client={client}
          requested={userClaims}
          verified={[]}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
          authorizeRequest={authorize}
          currentIdentity={currentIdentity}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a full disclosure request', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          requestId={fullRequest.id}
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          client={client}
          requested={userClaims}
          verified={[]}
          currentIdentity={currentIdentity}
          authorizeRequest={authorize}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a full disclosure request and verifiedClaims', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          actType='none'
          requestId={fullRequest.id}
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          client={client}
          requested={userClaims}
          verified={verifiedClaims}
          missing={[]}
          currentIdentity={currentIdentity}
          authorizeRequest={authorize}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  describe('missing claims', () => {
    it('renders disabled button and descriptions for essential missing claims', () => {
      const tree = renderer
        .create(
          <DisclosureCard
            actType='none'
            requestId={fullRequest.id}
            currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
            client={client}
            requested={userClaims}
            verified={[]}
            missing={[missingClaim]}
            currentIdentity={currentIdentity}
            authorizeRequest={authorize}
            cancelRequest={cancel}
            interactionStats={{ share: 1 }}
            clear={clear}
          />,
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('renders disabled button and descriptions for essential missing claims without urls', () => {
      const tree = renderer
        .create(
          <DisclosureCard
            actType='none'
            requestId={fullRequest.id}
            currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
            client={client}
            requested={userClaims}
            verified={[]}
            missing={[missingClaimWithIssuer]}
            currentIdentity={currentIdentity}
            authorizeRequest={authorize}
            cancelRequest={cancel}
            interactionStats={{ share: 1 }}
            clear={clear}
          />,
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('renders disabled button and descriptions for essential missing claims with urls', () => {
      const tree = renderer
        .create(
          <DisclosureCard
            actType='none'
            requestId={fullRequest.id}
            currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
            client={client}
            requested={userClaims}
            verified={[]}
            missing={[missingClaimWithIssuer, missingClaimWithIssuerWithoutURL, missingClaimWithMultipleIssuer]}
            currentIdentity={currentIdentity}
            authorizeRequest={authorize}
            cancelRequest={cancel}
            interactionStats={{ share: 1 }}
            clear={clear}
          />,
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('renders enabled button and descriptions for non essential missing claims', () => {
      const tree = renderer
        .create(
          <DisclosureCard
            actType='none'
            requestId={fullRequest.id}
            currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
            client={client}
            requested={userClaims}
            verified={[]}
            missing={[{ ...missingClaim, essential: false }]}
            currentIdentity={currentIdentity}
            authorizeRequest={authorize}
            cancelRequest={cancel}
            interactionStats={{ share: 1 }}
            clear={clear}
          />,
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  it('renders correctly with a full disclosure request and client info', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          requestId={fullRequest.id}
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          client={client}
          verified={[]}
          currentIdentity={currentIdentity}
          authorizeRequest={authorize}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
          requested={userClaims}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a full disclosure request with pushPermissions request and sns not enabled', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          requestId={fullRequestWithPush.id}
          pushPermissions
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          client={client}
          verified={[]}
          currentIdentity={currentIdentity}
          authorizeRequest={authorize}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
          requested={userClaims}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a full disclosure request with pushPermissions request and push being registered', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          requestId={fullRequestWithPush.id}
          pushPermissions
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          client={client}
          verified={[]}
          currentIdentity={currentIdentity}
          authorizeRequest={authorize}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
          pushWorking
          requested={userClaims}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with a full disclosure request with pushPermissions request and sns enabled', () => {
    const tree = renderer
      .create(
        <DisclosureCard
          requestId={fullRequestWithPush.id}
          pushPermissions
          currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
          client={client}
          currentIdentity={currentIdentity}
          authorizeRequest={authorize}
          cancelRequest={cancel}
          interactionStats={{ share: 1 }}
          clear={clear}
          snsRegistered
          verified={[]}
          requested={userClaims}
        />,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
  describe('unpublished identity', () => {
    const workingAndMessage = {
      status: toClj({
        persona: {
          working: true,
          message: 'Identity is being registered',
        },
      }),
      networking: {},
    }

    const errorState = {
      status: toClj({
        persona: { error: 'This did not work' },
      }),
      networking: {},
    }

    it('renders correctly with identity not yet published to registry', () => {
      const tree = renderer
        .create(
          <FakeProvider state={workingAndMessage}>
            <DisclosureCard
              requestId={simpleRequest.id}
              unpublished
              currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
              client={client}
              requested={userClaims}
              verified={[]}
              cancelRequest={cancel}
              interactionStats={{ share: 1 }}
              clear={clear}
              authorizeRequest={authorize}
              currentIdentity={currentIdentity}
            />
          </FakeProvider>,
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('renders correctly after publishing identity to registry failed', () => {
      const tree = renderer
        .create(
          <FakeProvider state={errorState}>
            <DisclosureCard
              requestId={simpleRequest.id}
              unpublished
              currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
              client={client}
              requested={userClaims}
              verified={[]}
              cancelRequest={cancel}
              interactionStats={{ share: 1 }}
              clear={clear}
              authorizeRequest={authorize}
              currentIdentity={currentIdentity}
            />
          </FakeProvider>,
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
  it('renders a connected DisclosureCard', () => {
    const initialState = { sns: {} }
    const wrapper = global.shallow(<ConnectedCard requestId={simpleRequest} navigator={new FakeNavigator()} />, {
      context: { store: global.mockStore(initialState) },
    })
    expect(wrapper.dive()).toMatchSnapshot()
  })

  // it('calls externalProfile correctly', () => {
  //   const initialState = {sns: {}}
  //   let store = global.mockStore(initialState)
  //   let toJs = jest.fn()
  //   const wrapper = global.shallow(
  //     <ConnectedCard
  //       navigator={new FakeNavigator()}
  //     />,
  //     { context: { store: store } },
  //   )
  //   console.log(wrapper.props().issuer())
  //   expect(toJs).toHaveBeenCalled()
  //   // expect(wrapper.dive()).toMatchSnapshot()
  // })

  it('calls clearRequest correctly', () => {
    const initialState = { sns: {} }
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const wrapper = global.shallow(<ConnectedCard navigator={new FakeNavigator()} />, { context: { store: store } })
    wrapper.props().clearRequest()
    expect(store.dispatch).toHaveBeenCalled()
    // expect(wrapper.dive()).toMatchSnapshot()
  })
  it('calls authorizeRequest correctly', () => {
    const initialState = { sns: {} }
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const wrapper = global.shallow(<ConnectedCard navigator={new FakeNavigator()} />, { context: { store: store } })
    wrapper.props().authorizeRequest(simpleRequest)
    expect(store.dispatch).toHaveBeenCalled()
    // expect(wrapper.dive()).toMatchSnapshot()
  })
  it('calls cancelRequest correctly', () => {
    const initialState = { sns: {} }
    let store = global.mockStore(initialState)
    store.dispatch = jest.fn()
    const wrapper = global.shallow(<ConnectedCard navigator={new FakeNavigator()} />, { context: { store: store } })
    wrapper.props().cancelRequest(simpleRequest)
    expect(store.dispatch).toHaveBeenCalled()
    // expect(wrapper.dive()).toMatchSnapshot()
  })

  it('calls authorizeRequest from the onAccept press', () => {
    const authorizeRequest = jest.fn()
    this.wrapper = global.shallow(
      <DisclosureCard
        request={simpleRequest}
        currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
        client={client}
        requested={userClaims}
        verified={[]}
        missing={[]}
        cancelRequest={cancel}
        interactionStats={{ share: 1 }}
        clear={clear}
        actType='none'
        authorizeRequest={authorizeRequest}
        currentIdentity={currentIdentity}
      />,
    )
    this.wrapper
      .find(PrimaryButton)
      .props()
      .onPress()
    expect(authorizeRequest).toHaveBeenCalled()
  })

  // it('calls cancelRequest from the onCancel press', () => {
  //   const cancelRequest = jest.fn()
  //   this.wrapper = global.shallow(
  //     <DisclosureCard
  //       request={simpleRequest}
  //       currentAddress='0x2bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'
  //       client={client}
  //       requested={userClaims}
  //       verified={[]}
  //       interactionStats={{share: 1}}
  //       clear={clear}
  //       actType='none'
  //       cancelRequest={cancelRequest}
  //       currentIdentity={currentIdentity} />)
  //   this.wrapper.find(PrimaryButton).props().onPress()
  //   expect(cancelRequest).toHaveBeenCalled()
  // })
})
