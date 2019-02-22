import React from 'react'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SchemaLink } from 'apollo-link-schema'

import { Provider } from 'react-redux'
import { Api, typeDefs, resolvers } from 'uport-graph'
import { driver } from './db-rn-sqlite3'
import { makeExecutableSchema } from 'graphql-tools'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const api = new Api(driver)

const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new SchemaLink({
    schema,
    context: { api },
   }),
})

export default (props: any) => (
  <ApolloProvider client={graphqlClient} >
    <Provider store={props.store}>
      {props.children}
    </Provider>
  </ApolloProvider>
)
