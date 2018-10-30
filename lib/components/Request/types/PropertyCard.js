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
import { WebView, View } from 'react-native'
import { Text } from '../../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { currentRequest } from 'uPortMobile/lib/selectors/requests'

export class PropertyCard extends React.Component {
  
  render () {
    const { styles } = this.context.theme ? this.context.theme : defaultTheme

    return (
      <View style={styles.container}>
        {!this.props.request.authorizedAt && <Text title>Updating configuration</Text>}
        {!this.props.request.authorizedAt && <Text p>Please wait...</Text>}

        {this.props.request.authorizedAt && <Text title>Configuration updated</Text>}
        {this.props.request.authorizedAt && <Text p>Close this card to continue</Text>}
      </View>
    )
  }
}

PropertyCard.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    request: currentRequest(state)
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(PropertyCard))