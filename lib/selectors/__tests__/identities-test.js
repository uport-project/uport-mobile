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
import { storeIdentity, storeSubAccount, updateInteractionStats, storeCurrentIdentity } from 'uPortMobile/lib/actions/uportActions'
import {
  currentAddress,
  currentIdentity,
  rootIdentities,
  normalizeDID,
  currentDID,
  hasIdentity,
  ownClaims,
  currentName,
  publicUportMap,
  publicUport,
  connections,
  interactionStats,
  otherIdentities,
  currentAvatar,
  publicUportForAddress,
  hasEncryptionKey,
  ipfsProfile,
  publicEncKey,
  pututuToken,
  subAccounts,
  allIdentities,
  validPrimaryAddresses,
  myAccounts,
  allAddresses,
  sharableProfileForAddress,
  accountsForNetwork,
  currentStoredIdentity,
  identityByAddress,
  hasPublishedDID,
  accountForClientIdAndNetwork,
  accountForClientIdSignerTypeAndNetwork
} from 'uPortMobile/lib/selectors/identities'
import { toJs, toClj, assocIn, reduce } from 'mori'

const simpleIdentity = {
  controllerAddress: '0xff708db3af14fbd9b125ac88d3f7c1c03e6bc36f',
  deviceAddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
  publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
  publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
  pututuToken: 'pututu-token-xxxx',
  ipfsProfile: 'IPFS_PROFILE_EG',
  network: 'rinkeby',
  recoveryAddress: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  address: '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV',
  hexaddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6a',
  own: {
    name: 'Alice',
    phone: '555-555-5555',
    description: 'Always part of any transaction',
    avatar: { uri: '/ipfs/avatar' },
    banner: { uri: '/ipfs/banner' },
    connections: {
      knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc03', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc00', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc05', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc04', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc08']
    }
  }
}

const ethrIdentity = {
  deviceAddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
  pututuToken: 'pututu-token-xxxx',
  network: 'mainnet',
  recoveryAddress: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  address: 'did:ethr:0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
  hexaddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
  own: {
    name: 'Alice',
    phone: '555-555-5555',
    description: 'Always part of any transaction',
    avatar: { uri: '/ipfs/avatar' },
    banner: { uri: '/ipfs/banner' },
    connections: {
      knows: ['0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc03', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc00', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc05', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc04', '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc08']
    }
  }
}

const onboardingIdentity = {
  deviceAddress: '0x8dd7ef5c99be7a454b4a9869683a3a394fde9777',
  publicKey: '0xf09ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
  publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
  network: 'rinkeby',
  address: 'new'
}

const connection = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc01',
  name: 'Bob'
}

const connection2 = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc02',
  name: 'Alice'
}

const connection3 = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc03'
}

const connection4 = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc04',
  name: 'Carol'
}

const connection5 = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc05',
  name: 'Alicia'
}

const connection6 = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc00'
}

const connection7 = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc07'
}

const connection8 = {
  address: '0x1bc5cbf71b068642fc5e89c5e3d0bdb3e366bc08',
  name: 'Bob'
}

const withIdentity = {
  uport: reduce(uportReducer, null,
    [storeIdentity(simpleIdentity),
    {type: 'STORE_EXTERNAL_UPORT', address: connection.address, profile: connection},
    {type: 'STORE_EXTERNAL_UPORT', address: connection2.address, profile: connection2},
    {type: 'STORE_EXTERNAL_UPORT', address: connection3.address, profile: connection3},
    {type: 'STORE_EXTERNAL_UPORT', address: connection4.address, profile: connection4},
    {type: 'STORE_EXTERNAL_UPORT', address: connection5.address, profile: connection5},
    {type: 'STORE_EXTERNAL_UPORT', address: connection6.address, profile: connection6},
    {type: 'STORE_EXTERNAL_UPORT', address: connection7.address, profile: connection7},
    {type: 'STORE_EXTERNAL_UPORT', address: connection8.address, profile: connection8}])
}

const withEthrIdentity = {
  uport: reduce(uportReducer, null,
    [storeIdentity(ethrIdentity),
    {type: 'STORE_EXTERNAL_UPORT', address: connection.address, profile: connection},
    {type: 'STORE_EXTERNAL_UPORT', address: connection2.address, profile: connection2},
    {type: 'STORE_EXTERNAL_UPORT', address: connection3.address, profile: connection3},
    {type: 'STORE_EXTERNAL_UPORT', address: connection4.address, profile: connection4},
    {type: 'STORE_EXTERNAL_UPORT', address: connection5.address, profile: connection5},
    {type: 'STORE_EXTERNAL_UPORT', address: connection6.address, profile: connection6},
    {type: 'STORE_EXTERNAL_UPORT', address: connection7.address, profile: connection7},
    {type: 'STORE_EXTERNAL_UPORT', address: connection8.address, profile: connection8}])
}

const otherIdentity = {
  network: 'kovan',
  address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
  deviceAddress: '0xadd7ef5c99be7a454b4a9869683a3a394fde9777',
  own: {
    name: 'Alice Kovan',
    phone: '555-555-5555'
  }
}

const withMultipleIdentities = {
  uport: uportReducer(withIdentity.uport, storeIdentity(otherIdentity))
}

const subIdentity = {
  network: 'kovan',
  name: 'subIdentity1',
  address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
  deviceAddress: '0xadd7ef5c99be7a454b4a9869683a3a394fde9778',
  parent: '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV',
  controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6b',
  createdAt: 1492997058053,
  updatedAt: 1492997058053
}

const subIdentity2 = {
  network: 'kovan',
  name: 'subIdentity2',
  address: '35A7s7LGbDxdsFpYYggjFjcbBHom79zfciS',
  deviceAddress: '0xadd7ef5c99be7a454b4a9869683a3a394fde9779',
  parent: '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV',
  controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6c',
  createdAt: 1492997058050,
  updatedAt: 1492997058050
}

const clientId = '0xgnosis'

const appSpecificIdentityMainNet = {
  network: 'mainnet',
  address: '2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX',
  clientId,
  signerType: 'KeyPair',
  deviceAddress: '0xadd7ef5c99be7a454b4a9869683a3a394fde9701',
  parent: '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV',
  controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6c',
  createdAt: 1492997058050,
  updatedAt: 1492997058050
}
const appSpecificIdentityRopsten = {
  network: 'ropsten',
  address: '2oDZvNUgn77w2BKTkd9qKpMeUo8EL94QL5V',
  clientId,
  signerType: 'MetaIdentityManager',
  deviceAddress: '0xadd7ef5c99be7a454b4a9869683a3a394fde9701',
  parent: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6b',
  controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6c',
  createdAt: 1492997058050,
  updatedAt: 1492997058050
}
const appSpecificIdentityKovan = {
  network: 'kovan',
  address: '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX',
  clientId,
  signerType: 'MetaIdentityManager',
  deviceAddress: '0xadd7ef5c99be7a454b4a9869683a3a394fde9701',
  parent: '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV',
  controllerAddress: '0x9df0e9759b17f34e9123adbe6d3f25d54b72ad6c',
  createdAt: 1492997058050,
  updatedAt: 1492997058050
}

const withSubIdentity = {
  uport: uportReducer(withIdentity.uport, storeSubAccount(subIdentity))
}

const withMultipleSubIdentities = {
  uport: uportReducer(withSubIdentity.uport, storeSubAccount(subIdentity2))
}

const withAppSpecificIdentities = {
  uport: reduce(uportReducer, null,
    [storeIdentity(simpleIdentity),
      storeSubAccount(appSpecificIdentityMainNet),
      storeSubAccount(appSpecificIdentityRopsten),
      storeSubAccount(appSpecificIdentityKovan)])
}

const withStats = uportReducer(withIdentity.uport, updateInteractionStats('0x8dd7ef5c99be7a454b4a9869683a3a394fde9777', 'request'))

const withOnboarding = {uport: uportReducer(null, storeIdentity(onboardingIdentity))}

const withSecondaryOnboarding = {
  uport: reduce(uportReducer, null, [
    storeIdentity(simpleIdentity),
    storeCurrentIdentity(simpleIdentity.address),
    storeIdentity(onboardingIdentity)
  ])
}

describe('normalizeDID()', () => {
  it('should pass through valid dids', () => {
    expect(normalizeDID('did:uport:2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toEqual('did:uport:2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')
    expect(normalizeDID('did:ethr:0xadd7ef5c99be7a454b4a9869683a3a394fde9701')).toEqual('did:ethr:0xadd7ef5c99be7a454b4a9869683a3a394fde9701')  
  })

  it('should return undefined for all invalids', () => {
    expect(normalizeDID('')).toBeUndefined()
    expect(normalizeDID()).toBeUndefined()
    expect(normalizeDID('    ')).toBeUndefined()
    expect(normalizeDID('0xadd7ef5c')).toBeUndefined()
    expect(normalizeDID('did:0xadd7ef5c')).toBeUndefined()  
  })

  it('should normalize MNIDs to did:uport', () => {
    expect(normalizeDID('34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual('did:uport:34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')
    expect(normalizeDID('2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toEqual('did:uport:2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')  
  })
 
  it('should normalize ethereum addresses into ethr dids', () => {
    expect(normalizeDID('0xadd7ef5c99be7a454b4a9869683a3a394fde9701')).toEqual('did:ethr:0xadd7ef5c99be7a454b4a9869683a3a394fde9701')
  })
})

describe('currentDid()', () => {
  it('returns address', () => {
    expect(currentDID(withIdentity)).toBe(`did:uport:${simpleIdentity.address}`)
    expect(currentDID(withMultipleIdentities)).toBe(`did:uport:${otherIdentity.address}`)
  })
})

describe('rootIdentities()', () => {
  expect(rootIdentities(withIdentity)).toEqual([`did:uport:${simpleIdentity.address}`])
  expect(rootIdentities(withMultipleIdentities)).toEqual([`did:uport:${otherIdentity.address}`, `did:uport:${simpleIdentity.address}`])
  expect(rootIdentities(withSubIdentity)).toEqual([`did:uport:${simpleIdentity.address}`])
  expect(rootIdentities(withMultipleSubIdentities)).toEqual([`did:uport:${simpleIdentity.address}`])
})

it('returns address', () => {
  expect(currentAddress(withIdentity)).toBe(simpleIdentity.address)
  expect(currentAddress(withMultipleIdentities)).toBe(otherIdentity.address)
})

it('returns current identity', () => {
  expect(toJs(currentIdentity(withIdentity))).toMatchSnapshot()
  expect(toJs(currentIdentity(withMultipleIdentities))).toMatchSnapshot()
})

it('hasIdentity is true if identity is added', () => {
  expect(hasIdentity(withIdentity)).toBeTruthy()
  expect(hasIdentity(withMultipleIdentities)).toBeTruthy()
})

it('hasIdentity is false if there is no identity', () => {
  expect(hasIdentity({})).toBeFalsy()
})

it('hasIdentity is false if we still have no proxy generated', () => {
  expect(hasIdentity(withOnboarding)).toBeFalsy()
})

it('ownClaims returns all claims', () => {
  expect(toJs(ownClaims(withIdentity))).toMatchSnapshot()
  expect(toJs(ownClaims(withMultipleIdentities))).toMatchSnapshot()
})

it('returns name', () => {
  expect(currentName(withIdentity)).toBe('Alice')
  expect(currentName(withMultipleIdentities)).toBe('Alice Kovan')
})

it('checks if user hasEncryptionKey', () => {
  expect(hasEncryptionKey(withIdentity)).toBe(true)
  expect(hasEncryptionKey(withMultipleIdentities)).toBe(false)
})

it('returns users publicEncKey', () => {
  expect(publicEncKey(withIdentity, simpleIdentity.address)).toBe(simpleIdentity.publicEncKey)
  expect(publicEncKey(withMultipleIdentities, simpleIdentity.address)).toBe(simpleIdentity.publicEncKey)
  expect(publicEncKey(withMultipleIdentities, otherIdentity.address)).toBe(null)
})

it('returns users pututuToken', () => {
  expect(pututuToken(withIdentity, simpleIdentity.address)).toBe(simpleIdentity.pututuToken)
  expect(pututuToken(withMultipleIdentities, simpleIdentity.address)).toBe(simpleIdentity.pututuToken)
  expect(pututuToken(withMultipleIdentities, otherIdentity.address)).toBe(null)
})

it('returns users ipfsProfile', () => {
  expect(ipfsProfile(withIdentity, simpleIdentity.address)).toBe(simpleIdentity.ipfsProfile)
  expect(ipfsProfile(withMultipleIdentities, simpleIdentity.address)).toBe(simpleIdentity.ipfsProfile)
  expect(ipfsProfile(withMultipleIdentities, otherIdentity.address)).toBe(null)
})

it('returns true if user hasPublishedDID', () => {
  expect(hasPublishedDID(withIdentity, simpleIdentity.address)).toBeTruthy()
  expect(hasPublishedDID(withEthrIdentity)).toBeTruthy()
  expect(hasPublishedDID(withMultipleIdentities, simpleIdentity.address)).toBeTruthy()
  expect(hasPublishedDID(withMultipleIdentities, otherIdentity.address)).toBeFalsy()
})

it('publicUportMap returns public data', () => {
  expect(toJs(publicUportMap(withIdentity))).toMatchSnapshot()
  expect(toJs(publicUportMap(withMultipleIdentities))).toMatchSnapshot()
})

it('publicUportForAddress returns public data for address', () => {
  expect(publicUportForAddress(withIdentity, '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toMatchSnapshot()
  expect(publicUportForAddress(withMultipleIdentities, '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toMatchSnapshot()
  expect(publicUportForAddress(withMultipleIdentities, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toMatchSnapshot()
})

it('publicUport returns public data as a js object', () => {
  expect(publicUport(withIdentity)).toMatchSnapshot()
  expect(publicUport(withMultipleIdentities)).toMatchSnapshot()
})

it('connections returns my connections', () => {
  expect(connections(withIdentity)).toMatchSnapshot()
  expect(connections(withMultipleIdentities)).toMatchSnapshot()
})

it('connections returns my interaction stats', () => {
  expect(toJs(interactionStats({uport: withStats}))).toMatchSnapshot()
})

it('currentAvatar returns avatar of current identity', () => {
  expect(currentAvatar(withIdentity)).toMatchSnapshot()
  expect(currentAvatar(withMultipleIdentities)).toMatchSnapshot()
})

it('allIdentities returns all primary identities', () => {
  expect(toJs(allIdentities(withIdentity))).toEqual([simpleIdentity])
  expect(toJs(allIdentities(withMultipleIdentities))).toEqual([otherIdentity, simpleIdentity])
  expect(toJs(allIdentities(withSubIdentity))).toEqual([simpleIdentity])
  expect(toJs(allIdentities(withMultipleSubIdentities))).toEqual([simpleIdentity])
})

it('otherIdentities returns any other identities I have', () => {
  expect(otherIdentities(withIdentity)).toEqual([])
  expect(otherIdentities(withMultipleIdentities)).toEqual([simpleIdentity])
  expect(otherIdentities(withSubIdentity)).toEqual([])
  expect(otherIdentities(withMultipleSubIdentities)).toEqual([])
})

it('validPrimaryAddresses returns all primary identities valid for current network', () => {
  expect(toJs(validPrimaryAddresses(withIdentity))).toMatchSnapshot()
  expect(toJs(validPrimaryAddresses(withMultipleIdentities))).toMatchSnapshot()
  expect(toJs(validPrimaryAddresses(withSubIdentity))).toMatchSnapshot()
  expect(toJs(validPrimaryAddresses(withMultipleSubIdentities))).toMatchSnapshot()
  expect(toJs(validPrimaryAddresses(withSecondaryOnboarding))).toMatchSnapshot()
})

it('subAccounts returns all my sub accounts', () => {
  expect(subAccounts(withIdentity, '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toEqual([])
  expect(subAccounts(withMultipleIdentities, '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toEqual([])
  expect(subAccounts(withSubIdentity, '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toEqual([subIdentity])
  expect(subAccounts(withMultipleSubIdentities, '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toEqual([subIdentity2, subIdentity])

  expect(subAccounts(withIdentity, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual([])
  expect(subAccounts(withMultipleIdentities, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual([])
  expect(subAccounts(withSubIdentity, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual([])
  expect(subAccounts(withMultipleSubIdentities, '34ukSmiK1oA1C5Du8aWpkjFGALoH7nsHeDX')).toEqual([])
})

it('myAccounts returns all myself with all my sub identities', () => {
  expect(myAccounts(withIdentity)).toEqual([simpleIdentity])
  expect(myAccounts(withMultipleIdentities)).toEqual([otherIdentity])
  expect(myAccounts(withSubIdentity)).toEqual([simpleIdentity, subIdentity])
  expect(myAccounts(withMultipleSubIdentities)).toEqual([simpleIdentity, subIdentity2, subIdentity])
})

it('returns app specific identities for given clientId and network', () => {
  expect(accountForClientIdAndNetwork(withMultipleSubIdentities, '0x4', clientId)).toEqual(null)
  expect(accountForClientIdAndNetwork(withIdentity, '0x4', clientId)).toEqual(null)
  expect(accountForClientIdAndNetwork(withAppSpecificIdentities, '0x1', clientId)).toEqual(appSpecificIdentityMainNet)
  expect(accountForClientIdAndNetwork(withAppSpecificIdentities, '0x3', clientId)).toEqual(appSpecificIdentityRopsten)
  expect(accountForClientIdAndNetwork(withAppSpecificIdentities, '0x2a', clientId)).toEqual(appSpecificIdentityKovan)
  expect(accountForClientIdAndNetwork(withAppSpecificIdentities, '0x4', clientId)).toEqual(null)
  expect(accountForClientIdAndNetwork(withSubIdentity, '0x2a', clientId)).toEqual(null)
})

it('returns app specific identities for given clientId, signerType and network', () => {
  expect(accountForClientIdSignerTypeAndNetwork(withMultipleSubIdentities, '0x4', clientId, 'MetaIdentityManager')).toEqual(null)
  expect(accountForClientIdSignerTypeAndNetwork(withIdentity, '0x4', clientId, 'MetaIdentityManager')).toEqual(null)
  expect(accountForClientIdSignerTypeAndNetwork(withAppSpecificIdentities, '0x1', clientId, 'KeyPair')).toEqual(appSpecificIdentityMainNet)
  expect(accountForClientIdSignerTypeAndNetwork(withAppSpecificIdentities, '0x1', clientId, 'MetaIdentityManager')).toEqual(null)
  expect(accountForClientIdSignerTypeAndNetwork(withAppSpecificIdentities, '0x3', clientId, 'MetaIdentityManager')).toEqual(appSpecificIdentityRopsten)
  expect(accountForClientIdSignerTypeAndNetwork(withAppSpecificIdentities, '0x3', clientId, 'KeyPair')).toEqual(null)
  expect(accountForClientIdSignerTypeAndNetwork(withAppSpecificIdentities, '0x2a', clientId, 'MetaIdentityManager')).toEqual(appSpecificIdentityKovan)
  expect(accountForClientIdSignerTypeAndNetwork(withAppSpecificIdentities, '0x2a', clientId, 'KeyPair')).toEqual(null)
  expect(accountForClientIdSignerTypeAndNetwork(withAppSpecificIdentities, '0x4', clientId, 'MetaIdentityManager')).toEqual(null)
  expect(accountForClientIdSignerTypeAndNetwork(withSubIdentity, '0x2a', clientId, 'MetaIdentityManager')).toEqual(null)
})

it('accountsForNetwork returns all identities able to handle network', () => {
  expect(accountsForNetwork(withIdentity, '0x1')).toEqual([])
  expect(accountsForNetwork(withMultipleIdentities, '0x1')).toEqual([])
  expect(accountsForNetwork(withSubIdentity, '0x1')).toEqual([])
  expect(accountsForNetwork(withMultipleSubIdentities, '0x1')).toEqual([])

  expect(accountsForNetwork(withIdentity, '0x4')).toEqual([simpleIdentity])
  expect(accountsForNetwork(withMultipleIdentities, '0x4')).toEqual([simpleIdentity])
  expect(accountsForNetwork(withSubIdentity, '0x4')).toEqual([simpleIdentity])
  expect(accountsForNetwork(withMultipleSubIdentities, '0x4')).toEqual([simpleIdentity])

  expect(accountsForNetwork(withIdentity, '0x2a')).toEqual([])
  expect(accountsForNetwork(withMultipleIdentities, '0x2a')).toEqual([otherIdentity])
  expect(accountsForNetwork(withSubIdentity, '0x2a')).toEqual([subIdentity])
  expect(accountsForNetwork(withMultipleSubIdentities, '0x2a')).toEqual([subIdentity, subIdentity2])

  expect(accountsForNetwork(withAppSpecificIdentities, '0x1')).toEqual([])
  expect(accountsForNetwork(withAppSpecificIdentities, '0x3')).toEqual([])
  expect(accountsForNetwork(withAppSpecificIdentities, '0x4')).toEqual([simpleIdentity])
  expect(accountsForNetwork(withAppSpecificIdentities, '0x2a')).toEqual([])
})

it('accountsForNetwork should be ordered in reverse chronological order', () => {
  expect(accountsForNetwork(withSubIdentity, '0x2a')).toEqual([subIdentity])
  expect(accountsForNetwork(withMultipleSubIdentities, '0x2a')).toEqual([subIdentity, subIdentity2])
})

it('finds the identityByAddress', () => {
  expect(identityByAddress(withIdentity, connection.address)).toEqual(connection)
  expect(identityByAddress(withIdentity, connection2.address)).toEqual(connection2)
  expect(identityByAddress(withIdentity, connection3.address)).toEqual(connection3)
  expect(identityByAddress(withIdentity, connection4.address)).toEqual(connection4)
  expect(identityByAddress(withIdentity, connection5.address)).toEqual(connection5)
  expect(identityByAddress(withIdentity, connection6.address)).toEqual(connection6)
  expect(identityByAddress(withIdentity, connection7.address)).toEqual(connection7)
  expect(identityByAddress(withIdentity, connection8.address)).toEqual(connection8)
  expect(identityByAddress(withIdentity, 'not added')).toEqual(null)
  expect(identityByAddress(withMultipleIdentities, connection.address)).toEqual(connection)
  expect(identityByAddress(withMultipleIdentities, connection2.address)).toEqual(connection2)
  expect(identityByAddress(withMultipleIdentities, connection3.address)).toEqual(connection3)
  expect(identityByAddress(withMultipleIdentities, connection4.address)).toEqual(connection4)
  expect(identityByAddress(withMultipleIdentities, connection5.address)).toEqual(connection5)
  expect(identityByAddress(withMultipleIdentities, connection6.address)).toEqual(connection6)
  expect(identityByAddress(withMultipleIdentities, connection7.address)).toEqual(connection7)
  expect(identityByAddress(withMultipleIdentities, connection8.address)).toEqual(connection8)
  expect(identityByAddress(withMultipleIdentities, 'not added')).toEqual(null)
})

it('returns the currentStoredIdentity', () => {
  expect(currentStoredIdentity(withIdentity)).toBe(null)
  expect(currentStoredIdentity(withOnboarding)).toBe(null)
  expect(currentStoredIdentity(withSecondaryOnboarding)).toBe(simpleIdentity.address)
})

it('returns the shared profile', () => {
  expect(sharableProfileForAddress(withIdentity, '2osGwhCweF72aBMFFkk59JrFHNdyG9mwrNV')).toEqual({
    publicEncKey: '0xf19ef47d5359e36d8fb004be6bf96591836fcdf8421fe599f7e33fd97fc8d0746bbd509d00c90a8c5860bb097e4911b133d405238d67f524d892f6c13dd9b7dc',
    name: 'Alice',
    avatar: { uri: '/ipfs/avatar' }
  })
})
