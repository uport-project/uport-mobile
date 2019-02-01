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
import { createSelector } from 'reselect'
import { filter, find } from 'lodash'
import { ipfsUrl } from '../utilities/ipfs'

interface RootState {
  vc: ReducerState,
}

export const contactList = (state: RootState) => state.vc && state.vc.contactList || []

export const contact = (state: RootState, did: string): Contact => {
  return find(
    contactList(state),
    (contact: Contact) => contact.did === did
  ) || {
    did: did,
  }
}

export const contactDetails = (state: RootState, did: string): {contact?: Contact, claims: VerifiableClaim[]} => {
  return {
    contact: contact(state, did),
    claims: state.vc.contactDetails[did] || [],
  }
}

export const profileForDID = (state: RootState, did: string) => {
  const item = contact(state, did)

  const profile = {
    ...item,
    address: did,
    url: (did.slice(0, 10) === 'did:https:') ? `https://${did.slice(10)}` : item.url,
    avatar: { uri: item.profileImage },
  }

  return profile
}
