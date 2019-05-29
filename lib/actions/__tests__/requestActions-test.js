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

import {handleURL, handleMessage, authorizeRequest, cancelRequest, selectRequest, selectAccountForRequest, clearRequest, saveRequest } from 'uPortMobile/lib/actions/requestActions.js'

it('creates a HANDLE_URL action with default postback', () => {
  expect(handleURL('ethereum:0x')).toMatchSnapshot()
})

it('creates a HANDLE_MESSAGE action with default postback', () => {
  expect(handleMessage('eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIzNHdqc3h3dmR1YW5vN05GQzh1ak5KbkZqYmFjZ1llV0E4bSIsImlhdCI6MTQ4NTMyMTEzMywiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiZXhwIjoxNDg1NDA3NTMzfQ.sg1oJ7J_f2pWaX2JwqzA61oWMUK5v0LYVxUp3PvG7Y25CVYWPyQ6UhA7U9d4w3Ny74k7ryMaUz7En5RSL4pyXg')).toMatchSnapshot()
})

it('creates a HANDLE_URL action with postback', () => {
  expect(handleURL('ethereum:0x', {postback: true})).toMatchSnapshot()
})

it('creates a HANDLE_URL action without postback', () => {
  expect(handleURL('ethereum:0x', {postback: false})).toMatchSnapshot()
})

it('creates a HANDLE_URL action with postback, no popup and client id', () => {
  expect(handleURL('ethereum:0x', {postback: true, popup: false, clientId: '0x010203'})).toMatchSnapshot()
})

it('creates a AUTHORIZE_REQUEST action', () => {
  expect(authorizeRequest(123)).toMatchSnapshot()
})

it('creates a CANCEL_REQUEST action', () => {
  expect(cancelRequest(123)).toMatchSnapshot()
})

it('creates a SELECT_REQUEST action', () => {
  expect(selectRequest(123)).toMatchSnapshot()
})

it('creates a SELECT_REQUEST_FOR_ACCOUNT action', () => {
  expect(selectAccountForRequest(123, '0x234')).toMatchSnapshot()
})

it('creates a CLEAR_REQUEST action', () => {
  expect(clearRequest()).toMatchSnapshot()
})

it('creates a SAVE_REQUEST action', () => {
  expect(saveRequest(123)).toMatchSnapshot()
})
