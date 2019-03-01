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
import React from 'react'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SchemaLink } from 'apollo-link-schema'
import { createHttpLink } from 'apollo-link-http'
import { Provider } from 'react-redux'
import { Api, typeDefs, resolvers } from 'uport-graph-api'
import { driver } from './db-rn-sqlite3'
import { makeExecutableSchema } from 'graphql-tools'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const api = new Api(driver)

let link

// local
// TODO make sure we handle this in UI by showing activity indicator
api.initialize()
link = new SchemaLink({
  schema,
  context: { api },
})

// external
// link = createHttpLink({
//   uri: 'https://bce992e3.ngrok.io/graphql',
// })

const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
})

export default (props: any) => (
  <ApolloProvider client={graphqlClient} >
    <Provider store={props.store}>
      {props.children}
    </Provider>
  </ApolloProvider>
)
