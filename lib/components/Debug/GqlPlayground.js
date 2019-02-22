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
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { connectTheme } from 'uPortMobile/lib/styles'
import { View } from 'react-native'
import { 
  KeyboardAwareScrollView,
  TextInput,
  Text,
} from 'uPortMobile/lib/components/shared'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

export const GET_ALL = gql`
  query GetAll {
    identities {
      did
    }
  }
`

const ADD_DID = gql`
  mutation newIdentity($did: String!) {
    newIdentity(did: $did) {
      did
    }
  }
`

class GqlPlayground extends React.Component {
  componentDidMount() {
    this.props.navigator.setTitle({
      title: "Design System" 
    })
  }

  render() {
    return (
      <KeyboardAwareScrollView>

        <Text title>
          GraphQL playground
        </Text>
        
        

        <TextInput
          label="New entry"
          placeholder="Enter did"
          returnKeyType="next"
          />

 
        <Query query={GET_ALL}>
          {({ loading, error, data }) => {
            console.log({data})
            if (loading) return (<Text>Loading</Text>)
            if (error) {
              console.log({error})
              return (<Text>Error</Text>)
            }
            return (
              <View>
                {data.identities && data.identities.map(item => <Text p>
                  {item.did}
                </Text>)}
              </View>
            )
          }}
        </Query>
          
      </KeyboardAwareScrollView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(GqlPlayground))
