import { makeExecutableSchema } from 'graphql-tools'
import { db } from 'uPortMobile/lib/sagas/databaseSaga'
import store from 'uPortMobile/lib/store/store'
import { currentDID, rootIdentities, identityAccounts } from 'uPortMobile/lib/selectors/identities'

const typeDefs = `
  type Identity {
    did: String!
    data: [SignedData]
    contacts: [Identity]
    accounts: [Account]
  }

  type Account {
    address: String!
    owner: Identity
    network: String
    deviceAddress: String
    accountType: String
    balance: Int
  }

  type SignedData {
    hash: String!
    iss: Identity
    sub: Identity
    type: String
  }

  # the schema allows the following query:
  type Query {
    me: Identity
    identities: [Identity]
    identity(did: String!): Identity
    dataByHash(hash: String!): SignedData
  }
`

const resolvers = {
  Query: {
    me: () : Identity => {
      const did = currentDID(store.getState())
      console.log(`me()`, did)
      return { did }
    },
    identities: () : [Identity] => {
      return rootIdentities(store.getState()).map( (did:string) => ({did}))
    },
    identity: (did: string) : Identity => ({did})
  },

  Identity: {
    accounts: (identity: Identity) : [Account] => identityAccounts(store.getState(), identity)
  },

  Account: {
    owner: (account:Account) : Identity => ({did: account.owner})
  }
}

export default makeExecutableSchema({
  typeDefs,
  resolvers,
})