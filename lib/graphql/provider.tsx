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
import * as RX from 'reactxp'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SchemaLink } from 'apollo-link-schema'
import { createHttpLink } from 'apollo-link-http'
import { Provider } from 'react-redux'
import { Api, typeDefs, resolvers } from 'uport-graph-api'
import { RnSqlite } from './db-rn-sqlite3'
import { makeExecutableSchema } from 'graphql-tools'
import mobileDidManager from './MobileDidManager'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

let link
let needsMigrations = false

// local
// const driver = new RnSqlite()
// const api = new Api(driver)
// needsMigrations = true
// link = new SchemaLink({
//   schema,
//   context: { api },
// })

// external
link = createHttpLink({
  uri: 'https://4c196a54.ngrok.io',
})

const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
  typeDefs: `
    extend type Query {
      currentDid: String!
      myDids: [String!]!
    }
    extend type Mutation {
      newDid: String
    }
  `,
  resolvers: {
    Query: {
      currentDid: (_, _args, { }) => {
        return mobileDidManager.getDids()[0]
      },
      myDids: (_, _args, { }) => {
        return mobileDidManager.getDids()
      },
    },
    Mutation: {
      newDid: (_, _args, { }) => {
        return mobileDidManager.newDid()
      },
    },
  },
})

interface Props extends RX.CommonProps {
  store: any
}
interface State {
  isRunningMigrations: boolean
}

class CustomProvider extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      isRunningMigrations: needsMigrations,
    }
  }

  componentDidMount() {
    if (needsMigrations) {
      driver.initialize()
      .then(() => api.initialize())
      .then(() => {
        this.setState({ isRunningMigrations: false })
      })
      .catch(e => console.log(e))
    }
  }

  render() {
    if (this.state.isRunningMigrations) {
      return (<RX.View style={Styles.container}>
        <RX.Text>Updating data...</RX.Text>
      </RX.View>)
    }
    else {
      return (
        <ApolloProvider client={graphqlClient} >
          <Provider store={this.props.store}>
            {this.props.children}
          </Provider>
      </ApolloProvider>
      )
    }
  }
}

const Styles = {
  container: RX.Styles.createViewStyle({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }),
}

export default CustomProvider