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

export const getList = state => state && state.vc && state.vc.jwt || []

const claimValue = (key, claims) => {
  let value

  const potentialClaims = filter(
    claims,
    (claim) => claim.payload && claim.payload.claim && claim.payload.claim[key]
  )

  // We could have more intelligent logic here
  // E.x. if we have a self signed claim and a claim signed by `currentAddress`
  // we pick the latter. Or maybe we could pick more popular one. Etc.
  if (potentialClaims && potentialClaims.length > 0) {
    value = potentialClaims.pop().payload.claim[key]
  }

  return value
}


export const profileForDID = (state, did) => {
  const claims = filter(
    getList(state),
    (claim) => claim.payload && claim.payload.sub && claim.payload.sub === did
  )

  const profile = {
    address: did
  }

  const name = claimValue('name', claims)
  if (name) {
    profile['name'] = name
  }

  const description = claimValue('description', claims)
  if (description) {
    profile['description'] = description
  }

  const url = claimValue('url', claims)
  if (url) {
    profile['url'] = url
  }
  // Exception for did:https
  if (did.slice(0, 10) === 'did:https:') {
    profile.url = `https://${did.slice(10)}`
  }
  
  const profileImage = claimValue('profileImage', claims)
  if (profileImage) {
    if (profileImage['/']) {
      profile['avatar'] = { uri: ipfsUrl + profileImage['/']}
    } else {
      profile['avatar'] = profileImage
    }
  }

  const bannerImage = claimValue('bannerImage', claims)

  return profile
}