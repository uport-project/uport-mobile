import React from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import { Text, Theme } from '../../kancha'

const NavBarTitle = props => {
  return (
    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
      <Text type={'h2'} bold={true} textColor={Theme.colors.inverted.text}>{props.title}</Text>
    </View>
  )
}

NavBarTitle.propTypes = {
  title: PropTypes.string
}

export default NavBarTitle
