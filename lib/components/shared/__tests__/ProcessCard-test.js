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
import React from 'react'
import { Text } from 'react-native'
import FakeProvider from '../../testHelpers/FakeProvider'
import fakeStore from '../../testHelpers/fakeStore'
import ProcessCard, { Base } from '../ProcessCard'
import renderer from 'react-test-renderer'
import PropTypes from 'prop-types'
import { toClj } from 'mori'
import sinon from 'sinon'

const process = 'nisaba'
const empty = {
  status: toClj({}),
  networking: {}
}

const offline = {
  status: toClj({}),
  networking: { online: false }
}

const working = {
  status: toClj({
    nisaba: { working: true }
  }),
  networking: {}
}

const workingAndMessage = {
  status: toClj({
    nisaba: {
      working: true,
      message: 'sending number'
    }
  }),
  networking: {}
}

const errorState = {
  status: toClj({
    nisaba: { error: 'Server is down' }
  }),
  networking: {}
}

function onContinue () {}
function onProcess () {}
function onSkip () {}

it('renders continue button', () => {
  const tree = renderer.create(
    <FakeProvider state={empty}>
      <ProcessCard onContinue={onContinue}>
        <Text>Hello</Text>
      </ProcessCard>
    </FakeProvider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

describe('disabled button', () => {
  it('invalid state', () => {
    const tree = renderer.create(
      <FakeProvider state={empty}>
        <ProcessCard
          process={process}
          onContinue={onContinue}
          invalid
        >
          <Text>Hello</Text>
        </ProcessCard>
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('offline', () => {
    const tree = renderer.create(
      <FakeProvider state={offline}>
        <ProcessCard
          process={process}
          onContinue={onContinue}
        >
          <Text>Hello</Text>
        </ProcessCard>
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('working', () => {
    const tree = renderer.create(
      <FakeProvider state={working}>
        <ProcessCard
          process={process}
          onContinue={onContinue}
        >
          <Text>Hello</Text>
        </ProcessCard>
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('working and message', () => {
    const tree = renderer.create(
      <FakeProvider state={workingAndMessage}>
        <ProcessCard
          process={process}
          onContinue={onContinue}
        >
          <Text>Hello</Text>
        </ProcessCard>
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('error', () => {
    const tree = renderer.create(
      <FakeProvider state={errorState}>
        <ProcessCard
          process={process}
          onContinue={onContinue}
        >
          <Text>Hello</Text>
        </ProcessCard>
      </FakeProvider>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})

it('renders skip button if skippable', () => {
  const tree = renderer.create(
    <FakeProvider state={empty}>
      <ProcessCard skippable
        onContinue={onContinue}
        onSkip={onSkip}>
        <Text>Hello</Text>
      </ProcessCard>
    </FakeProvider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

describe('event handling', () => {
  // Juju to be able to reach in and test handlers
  class FakeProcessCard extends Base {
    getChildContext () {
      return {store: fakeStore(this.props.state)}
    }
  }
  FakeProcessCard.childContextTypes = {
    store: PropTypes.object.isRequired
  }
  it('calls onContinue if no onProcess', () => {
    const onContinue = sinon.spy()
    const component = renderer.create(
      <FakeProcessCard state={empty} onContinue={onContinue}>
        <Text>Hello</Text>
      </FakeProcessCard>
    )
    const card = component.getInstance()
    expect(component.toJSON()).toMatchSnapshot()
    card.performAction()
    expect(onContinue.calledOnce).toBeTruthy()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('calls only onProcess', () => {
    const onContinue = sinon.spy()
    const onProcess = sinon.spy()
    const component = renderer.create(
      <FakeProcessCard state={empty} onProcess={onProcess} onContinue={onContinue}>
        <Text>Hello</Text>
      </FakeProcessCard>
    )
    const card = component.getInstance()
    expect(component.toJSON()).toMatchSnapshot()
    card.performAction()
    expect(onProcess.calledOnce).toBeTruthy()
    expect(onContinue.calledOnce).toBeFalsy()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('calls onComplete if onProcess returns true', () => {
    const onContinue = sinon.spy()
    const onProcess = () => true
    const component = renderer.create(
      <FakeProcessCard state={empty} onProcess={onProcess} onContinue={onContinue}>
        <Text>Hello</Text>
      </FakeProcessCard>
    )
    const card = component.getInstance()
    expect(component.toJSON()).toMatchSnapshot()
    card.performAction()
    expect(onContinue.calledOnce).toBeTruthy()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('calls onSkip from performSkip', () => {
    const onContinue = jest.fn()
    const onSkip = jest.fn()
    this.wrapper = global.shallow(
      <Base
        process={process}
        onSkip={onSkip}
        onContinue={onContinue}
      />
    )
    const instance = this.wrapper.instance()
    instance.performSkip()
    expect(onSkip).toHaveBeenCalled()
  })
  it('calls onContinue from performSkip when onSkip not present', () => {
    const onContinue = jest.fn()
    this.wrapper = global.shallow(
      <Base
        process={process}
        onContinue={onContinue}
      />
    )
    const instance = this.wrapper.instance()
    instance.performSkip()
    expect(onContinue).toHaveBeenCalled()
  })

  describe('updating props', () => {
    // I'm uncertain these tests reflect real life. Need to test it integrated first
    // In particular I would like to test actually setting props, but we need enzyme to do that AFAIK
    // Enzyme is not yet ready for react-0.16

    it('calls onComplete after completing', () => {
      const onContinue = sinon.spy()
      const onProcess = sinon.spy()
      const component = renderer.create(
        <FakeProcessCard state={working} onProcess={onProcess} onContinue={onContinue}>
          <Text>Hello</Text>
        </FakeProcessCard>
      )
      const card = component.getInstance()
      card.performAction()
      expect(onContinue.calledOnce).toBeFalsy()
      const updateProps = card.componentWillReceiveProps.bind(card)
      updateProps({completed: true})
      expect(onContinue.calledOnce).toBeTruthy()
    })

    it('does not call onComplete if error message', () => {
      const onContinue = sinon.spy()
      const onProcess = sinon.spy()
      const component = renderer.create(
        <FakeProcessCard state={working} error='hello' onProcess={onProcess} onContinue={onContinue}>
          <Text>Hello</Text>
        </FakeProcessCard>
      )
      const card = component.getInstance()
      card.performAction()
      expect(onContinue.calledOnce).toBeFalsy()
      const updateProps = card.componentWillReceiveProps.bind(card)
      updateProps({failed: true})
      expect(onContinue.calledOnce).toBeFalsy()
    })
  })
})
