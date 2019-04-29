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

import { connect } from 'react-redux'

// Selectors
import { currentRequestType } from 'uPortMobile/lib/selectors/requests'

// Components
import DisclosureCard from './types/DisclosureCard'
import TransactionCard from './types/TransactionCard'

import { Container } from '@kancha'

export class Request extends React.Component {
  showRequestScreen() {
    switch (this.props.requestType) {
      case 'sign':
        return <TransactionCard />
      case 'disclosure':
        return <DisclosureCard componentId={this.props.componentId} />
      default:
        return <Container />
    }
  }

  render() {
    return this.showRequestScreen()
  }
}

const mapStateToProps = state => {
  return {
    requestType: currentRequestType(state),
  }
}

export default connect(mapStateToProps)(Request)
