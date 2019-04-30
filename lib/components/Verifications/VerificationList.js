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
// Frameworks
import React from 'react'
import PropTypes from 'prop-types'
// import { connect } from 'react-redux'
import { FlatList } from 'react-native'

import VerificationListItem from './VerificationListItem'

const keyExtractor = (item, index) => `${item.iat}-${index}`

const VerificationList = (props) => {
  return (
    <FlatList
      data={props.verifications}
      renderItem={({item}) =>
        <VerificationListItem
          verification={item}
          selectVerification={props.selectVerification}
          date={new Date(item.iat)} />
      }
      keyExtractor={keyExtractor}
    />
  )
}

VerificationList.propTypes = {
  own: PropTypes.object,
  verifications: PropTypes.array.isRequired,
  selectVerification: PropTypes.func
}

export default VerificationList
