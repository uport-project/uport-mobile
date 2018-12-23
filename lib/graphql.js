import React from 'react'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SchemaLink } from 'apollo-link-schema'
import { Provider } from 'react-redux'
import schema from 'uPortMobile/lib/schemas/root'

const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new SchemaLink({ schema })
})

export default props => (
  <ApolloProvider client={graphqlClient} >
    <Provider store={props.store}>
      {props.children}
    </Provider>
  </ApolloProvider>
)
