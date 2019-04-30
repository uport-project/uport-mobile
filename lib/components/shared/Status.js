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
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { offline, working, statusMessage, errorMessage } from 'uPortMobile/lib/selectors/processStatus'

import { textStyles, colors } from 'uPortMobile/lib/styles/globalStyles'

const styles = StyleSheet.create({
  section: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

const Status = (props) => (
  props.offline || props.working || props.message || props.error
  ? <View style={styles.section}>
    { props.working ? <ActivityIndicator color={props.color || colors.grey74} style={{margin: 16}} /> : null }
    { props.offline
    ? <Text style={[textStyles.small, props.color ? {color: props.color} : {}]}>
      offline
    </Text>
    : null }
    { !props.error && props.message
    ? <Text style={[textStyles.small, props.color ? {color: props.color} : {}]}>
      { props.message }
    </Text>
    : null
    }
    { props.error
    ? <Text style={[textStyles.small, {color: 'red'}]}>
      { props.error }
    </Text>
    : null}
  </View>
  : null
)

Status.propTypes = {
  working: PropTypes.bool,
  offline: PropTypes.bool,
  message: PropTypes.string,
  error: PropTypes.string,
  color: PropTypes.string
}

export const Base = Status

export default connect((state, ownProps) => ({
  offline: offline(state),
  working: working(state, ownProps.process),
  message: statusMessage(state, ownProps.process),
  error: errorMessage(state, ownProps.process)
}))(Status)
