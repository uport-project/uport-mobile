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
import { Animated, Dimensions, Platform } from 'react-native'
import { connect } from 'react-redux'
import { connectTheme } from 'uPortMobile/lib/styles'
import { 
  Text,
} from 'uPortMobile/lib/components/shared'

let osStatusBarHeight = Platform.OS === 'ios' ? 20 : 0
osStatusBarHeight = Platform.OS === 'ios' && Dimensions.get('window').height === 812 ? 30 : osStatusBarHeight
const statusBarHeight = 30 + osStatusBarHeight

class NetworkStatusBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      marginTop: new Animated.Value(-statusBarHeight)
    }
    this.handleAnimation = this.handleAnimation.bind(this)
  }
  componentDidMount() {
    this.handleAnimation(this.props.online)
  }

  handleAnimation(online) {
    if (online === true || online === undefined) {
      Animated.timing(
        this.state.marginTop,
        {
          duration: 1000,
          toValue: -statusBarHeight, 
        }
      ).start()
    } else {
      Animated.timing(
        this.state.marginTop,
        {
          duration: 250,
          toValue: 0, 
        }
      ).start();
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.online !== this.props.online){
      this.handleAnimation(nextProps.online)
    }
  }

  render() {
    return (
      this.props.online === false ? <Animated.View style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: statusBarHeight,
        marginTop: this.state.marginTop,
        paddingTop: osStatusBarHeight,
        backgroundColor: this.props.online ? '#35B87B' : '#F94847'
        
      }}>
        <Text statusBar>{this.props.online ? 'Network connection detected': 'No network connection detected'}</Text>
      </Animated.View> : null
    )
  }
}

const mapStateToProps = (state) => {
  return {
    online: state.networking.online
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(NetworkStatusBar))
