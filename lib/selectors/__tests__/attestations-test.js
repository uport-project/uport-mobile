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
import uportReducer from 'uPortMobile/lib/reducers/uportReducer'
import { storeIdentity } from 'uPortMobile/lib/actions/uportActions'
import {
  attestationLedger,
  onlyLatestAttestations,
  requestedClaims,
  missingClaims,
  attestationSummary,
  allClaims,
  verifiedClaimsTokens,
  thirdPartyAttestationSummary,
  onlyLatestAttestationsWithIssuer,
  hasAttestations,
  requestedOwnClaims
} from 'uPortMobile/lib/selectors/attestations'
import { toJs, toClj } from 'mori'

const simpleIdentity = {
  address: 'did:ethr:0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
  own: {
    name: 'Alice',
    phone: '555-555-5555',
    description: 'UX Designer',
    connections: {
      knows: ['did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01']
    }
  },
  attestations: {
    '0011': {
      iss: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      iat: 1555183565000,
      exp: 1555183566000,
      claim: {
        name: 'Alice'
      },
      token: '0011.TOKEN'
    },
    '0015': {
      iss: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      iat: 1555183566,
      exp: 1555183567,
      claim: {
        name: 'Alice'
      },
      token: '0015.TOKEN'
    },
    '0012': {
      iat: 1555183567,
      iss: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
      claim: {
        name: 'Alice'
      },
      token: '0012.TOKEN'
    },
    '0013': {
      iat: 1555183568,
      iss: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      claim: {
        phone: '555-555-5555'
      },
      token: '0013.TOKEN'
    },
    '0014': {
      iat: 1555183569,
      iss: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      claim: {
        nationalId: 'xxx0xxxx0xxx'
      },
      token: '0014.TOKEN'
    }
  }
}

const withoutAttestations = toClj({
  address: 'did:ethr:0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a'
})

const withIssuers = toClj({
  external: {
    'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01': {
      name: 'Issuer 1'
    },
    'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02': {
      name: 'Issuer 2'
    }
  }
})
const uport = uportReducer(withIssuers, storeIdentity(simpleIdentity))
const withIdentity = {uport}

const otherIdentity = {
  network: 'kovan',
  address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
  own: {
    name: 'Alice Kovan',
    phone: '555-555-5555'
  },
  attestations: {
    '0020': {
      iss: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      iat: 1555183568,
      claim: {
        phone: '555-555-5555'
      },
      token: '0013.TOKEN'
    },
    '0021': {
      iss: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
      iat: 1555183569,
      claim: {
        nationalId: 'xxx0xxxx0xxx'
      },
      token: '0014.TOKEN'
    }
  }
}

const withMultipleIdentities = {
  uport: uportReducer(uport, storeIdentity(otherIdentity))
}

it('returns full ledger', () => {
  expect(toJs(attestationLedger({}))).toMatchSnapshot()
  expect(toJs(attestationLedger(withIdentity))).toMatchSnapshot()
  expect(toJs(attestationLedger(withMultipleIdentities))).toMatchSnapshot()
})

it('returns ledger with only the latest attestations', () => {
  expect(toJs(onlyLatestAttestations({}))).toEqual([])
  expect(toJs(onlyLatestAttestations(withIdentity))).toMatchSnapshot()
  expect(toJs(onlyLatestAttestations(withMultipleIdentities))).toMatchSnapshot()
})

it('returns third party attestations summary', () => {
  expect(toJs(thirdPartyAttestationSummary(withIdentity))).toMatchSnapshot()
  expect(toJs(thirdPartyAttestationSummary(withMultipleIdentities))).toMatchSnapshot()
})

it('returns full attestations summary', () => {
  expect(attestationSummary(withIdentity)).toMatchSnapshot()
  expect(attestationSummary(withMultipleIdentities)).toMatchSnapshot()
})

it('returns allClaims', () => {
  expect(toJs(allClaims(withIdentity))).toMatchSnapshot()
  expect(toJs(allClaims(withMultipleIdentities))).toMatchSnapshot()
})

describe('requestedClaims', () => {
  it('returns self attested', () => {
    expect(toJs(requestedClaims(withIdentity, {}))).toEqual({})
    expect(toJs(requestedClaims(withIdentity, {requested: ['name', 'phone']}))).toEqual({name: 'Alice', phone: '555-555-5555'})
    expect(toJs(requestedClaims(withIdentity, {requested: ['name', 'phone'], verified: ['nationalId', 'nonexisting']}))).toEqual({name: 'Alice', nationalId: 'xxx0xxxx0xxx', phone: '555-555-5555'})
  
    expect(toJs(requestedClaims(withMultipleIdentities, {}))).toEqual({})
    expect(toJs(requestedClaims(withMultipleIdentities, {requested: ['name']}))).toEqual({name: 'Alice Kovan'})
    expect(toJs(requestedClaims(withMultipleIdentities, {requested: ['name', 'phone'], verified: ['nationalId', 'nonexisting']}))).toEqual({name: 'Alice Kovan', nationalId: 'xxx0xxxx0xxx', phone: '555-555-5555'})
  })

  it('handles claims specs', () => {
    expect(toJs(requestedClaims(withIdentity, {claims: {user_info: {name: null}}}))).toEqual({name: 'Alice'})
    expect(toJs(requestedClaims(withIdentity, {claims: {verifiable: {name: {iss: ['did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01']}}}}))).toEqual({name: 'Alice'})
    expect(toJs(requestedClaims(withIdentity, {claims: {verifiable: {name: {iss: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'}, nationalId: null}}}))).toEqual({name: 'Alice', nationalId: 'xxx0xxxx0xxx'})
    expect(toJs(requestedClaims(withIdentity, {claims: {user_info: {name: null}, verifiable: {nationalId: null}}}))).toEqual({name: 'Alice', nationalId: 'xxx0xxxx0xxx'})
  })

  it('ignores old specs if claims spec exists', () => {
    expect(toJs(requestedClaims(withIdentity, {requested: ['description'], verified: ['nationalId'], claims: {user_info: {name: null}}}))).toEqual({name: 'Alice', nationalId: 'xxx0xxxx0xxx'})
    expect(toJs(requestedClaims(withIdentity, {requested: ['description'], verified: ['nationalId'], claims: {verifiable: {name: {iss: ['did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01']}}}}))).toEqual({name: 'Alice', description: 'UX Designer'})
    expect(toJs(requestedClaims(withIdentity, {requested: ['description'], verified: ['nationalId'], claims: {user_info: {phone: null}, verifiable: {name: null}}}))).toEqual({name: 'Alice', phone: '555-555-5555'})
  })
})

describe('requestedOwnClaims', () => {
  describe('openid like', () => {
    it('returns self attested', () => {
      expect(toJs(requestedOwnClaims(withIdentity, undefined))).toEqual({})
      expect(toJs(requestedOwnClaims(withIdentity, {}))).toEqual({})
      expect(toJs(requestedOwnClaims(withIdentity, {claims: {user_info: {}}}))).toEqual({})
      expect(toJs(requestedOwnClaims(withIdentity, {claims: {user_info: {name: null}}}))).toEqual({name: 'Alice'})
      expect(toJs(requestedOwnClaims(withIdentity, {requested: ['name'], claims: {}}))).toEqual({name: 'Alice'})
      expect(toJs(requestedOwnClaims(withIdentity, {claims: {user_info: {name: {essential: true}, nationalId: null, nonexisting: null}}}))).toEqual({name: 'Alice'})
      expect(toJs(requestedOwnClaims(withMultipleIdentities, {claims: {user_info: {}}}))).toEqual({})
      expect(toJs(requestedOwnClaims(withMultipleIdentities, {claims: {user_info: {name: null}}}))).toEqual({name: 'Alice Kovan'})
      expect(toJs(requestedOwnClaims(withMultipleIdentities, {claims: {user_info: {name: {essential: true}, nationalId: null, nonexisting: null}}}))).toEqual({name: 'Alice Kovan'})
    })
  })

  describe('LEGACY', () => {
    it('returns self attested', () => {
      expect(toJs(requestedOwnClaims(withIdentity, {requested: []}))).toEqual({})
      expect(toJs(requestedOwnClaims(withIdentity, {requested: ['name']}))).toEqual({name: 'Alice'})
      expect(toJs(requestedOwnClaims(withIdentity, {requested: ['name', 'nationalId', 'nonexisting']}))).toEqual({name: 'Alice'})
      expect(toJs(requestedOwnClaims(withMultipleIdentities, {requested: []}))).toEqual({})
      expect(toJs(requestedOwnClaims(withMultipleIdentities, {requested: ['name']}))).toEqual({name: 'Alice Kovan'})
      expect(toJs(requestedOwnClaims(withMultipleIdentities, {requested: ['name', 'nationalId', 'nonexisting']}))).toEqual({name: 'Alice Kovan'})
    })
  })
})

describe('missingClaims', () => {
  it('handles missing claims specs', () => {
    expect(missingClaims(withIdentity, {claims: {verifiable: {name: {iss: [{did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'}]}}}})).toEqual([])
    expect(missingClaims(withIdentity, {claims: {verifiable: {cityId: {iss: [{did: 'did:web:city.claims', url: 'https://city.claims'}], essential: true, reason: 'We need this'}, name: null}}})).toEqual([{claimType: 'cityId', iss: [{did: 'did:web:city.claims', url: 'https://city.claims'}], essential: true, reason: 'We need this'}])
    expect(missingClaims(withIdentity, {claims: {verifiable: {name: {iss: [{did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc0a'}]}}}})).toEqual([{claimType: 'name', iss: [{did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc0a'}]}])
    expect(missingClaims(withIdentity, {claims: {verifiable: {name: {iss: [{did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc0b'}]}, nationalId: null}}})).toEqual([{claimType: 'name', iss: [{did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc0b'}]}])
  })

  it('LEGACY FORMAT', () => {
    expect(missingClaims(withIdentity, {verified: ['name']})).toEqual([])
    expect(missingClaims(withIdentity, {verified: ['name', 'cityId']})).toEqual([{claimType: 'cityId'}])
  })
})

describe('verifiedClaimsTokens', () => {
  it('returns verifiedClaimsTokens', () => {
    expect(toJs(verifiedClaimsTokens(withIdentity, {}))).toEqual([])
    expect(toJs(verifiedClaimsTokens(withIdentity, {claims: {verifiable: { name: null }}}))).toEqual(['0012.TOKEN', '0015.TOKEN'])
    expect(toJs(verifiedClaimsTokens(withIdentity, {claims: {verifiable: { name: null, nationalId: null, nonexisting: null }}}))).toEqual(['0012.TOKEN', '0015.TOKEN', '0014.TOKEN'])

    expect(toJs(verifiedClaimsTokens(withMultipleIdentities, {}))).toEqual([])
    expect(toJs(verifiedClaimsTokens(withMultipleIdentities, {claims: {verifiable: { name: null }}}))).toEqual([])
    expect(toJs(verifiedClaimsTokens(withMultipleIdentities, {claims: {verifiable: { name: null, nationalId: null, nonexisting: null }}}))).toEqual(['0014.TOKEN'])
  })

  it('handles required issuers', () => {
    expect(toJs(verifiedClaimsTokens(withIdentity, {claims: {verifiable: { name: { iss: [{did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'}] } }}}))).toEqual(['0015.TOKEN'])
    expect(toJs(verifiedClaimsTokens(withIdentity, {claims: {verifiable: { name: { iss: [{did: 'did:ethr:0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01'}]}, nationalId: null }}}))).toEqual(['0015.TOKEN', '0014.TOKEN'])
  })

  it('LEGACY FORMAT', () => {
    expect(toJs(verifiedClaimsTokens(withIdentity, {verified: ['name']}))).toEqual(['0012.TOKEN', '0015.TOKEN'])
    expect(toJs(verifiedClaimsTokens(withIdentity, {verified: ['name', 'nationalId', 'nonexisting']}))).toEqual(['0012.TOKEN', '0015.TOKEN', '0014.TOKEN'])

    expect(toJs(verifiedClaimsTokens(withMultipleIdentities, {verified: ['name']}))).toEqual([])
    expect(toJs(verifiedClaimsTokens(withMultipleIdentities, {verified: ['name', 'nationalId', 'nonexisting']}))).toEqual(['0014.TOKEN'])
  })

  it('ignores legacy format if openid like format extists', () => {
    expect(toJs(verifiedClaimsTokens(withIdentity, {verified: ['nationalId'], claims: {verifiable: { name: null }}}))).toEqual(['0012.TOKEN', '0015.TOKEN'])
  })
})

it('returns all onlyLatestAttestationsWithIssuer', () => {
  expect(onlyLatestAttestationsWithIssuer(withIdentity)).toMatchSnapshot()
  expect(onlyLatestAttestationsWithIssuer(withMultipleIdentities)).toMatchSnapshot()
})

describe('hasAttestations', () => {
  expect(hasAttestations(withIdentity)).toBeTruthy()
  expect(hasAttestations(withoutAttestations)).toBeFalsy()
})
