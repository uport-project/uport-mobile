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
import { Alert } from 'react-native'
import PropTypes from 'prop-types'
import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'
import { setFlagsAction } from 'flag'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

// Components
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

export class SettingsRoot extends React.Component {

  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  constructor(props) {
    super(props)
    this.state = {
      secretCounter: 0
    }
    this.handleSecretCounterIncrement = this.handleSecretCounterIncrement.bind(this)
  }
  handleSecretCounterIncrement() {
    this.setState({secretCounter: this.state.secretCounter + 1})

    if (this.state.secretCounter > 9) {
      Alert.alert(
        'Debug Mode', 
        'Do you really want to enable Debug Mode?',
        [
          {text: 'Cancel', onPress: () => {this.setState({secretCounter: 0})}, style: 'cancel'},
          {text: 'OK', onPress: () => {this.setState({secretCounter: 0}); this.props.setFlag({debug: true})}},
        ]
      )
    }
  }
  render () {
    const channel = this.props.channel ? ` (${this.props.channel})` : ''
    return (
      <Menu>
        <MenuItem title='App Version' value={`${this.props.version}${channel}`} onPress={this.handleSecretCounterIncrement} />
        <MenuItem title='Privacy Policy' value='v1.1 (5/24/2018)' navigator={this.props.navigator} destination='settings.privacy' />
        <MenuItem title='Terms and Conditions' value='v1.2 (5/24/2018)' navigator={this.props.navigator} destination='settings.terms' />
        <MenuItem title='Support' href='https://chat.uport.me' last/>
      </Menu>
    )
  }
}

SettingsRoot.propTypes = {
  version: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ])
}

const mapStateToProps = (state) => {
  return {
    version: DeviceInfo.getBuildNumber(),
    channel: state.settings && state.settings.channel,
  }
}
export const mapDispatchToProps = (dispatch) => {
  return {
    setFlag: (flag) => dispatch(setFlagsAction(flag)) // setFlagsAction({darkTheme: true})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsRoot)
