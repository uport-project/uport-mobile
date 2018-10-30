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
import { setFlagsAction } from 'flag'
import { connectTheme } from 'uPortMobile/lib/styles'
import { 
  KeyboardAwareScrollView,
  TextInput,
  Text,
  MenuItemSwitch
} from 'uPortMobile/lib/components/shared'

class DesignSystemMain extends React.Component {
  componentDidMount() {
    this.props.navigator.setTitle({
      title: "Design System" 
    })
  }

  render() {
    return (
      <KeyboardAwareScrollView>

        <MenuItemSwitch 
          title="Dark Theme"
          value={this.props.darkThemeFlag}
          onValueChange={this.props.setDarkThemeFlag}
        />

        <Text title>
          Lorem ipsum dolor sit amet
        </Text>
        
        <Text subTitle>
          Consectetur adipiscing elit
        </Text>

        <Text p>
          Aliquam mattis, urna quis posuere sollicitudin, 
          turpis velit consequat urna, 
          nec tempor urna ante at elit.
        </Text>
        
        <Text p>
          Sed ut nisi euismod, fringilla lorem vitae, 
          volutpat justo. Vestibulum cursus iaculis sollicitudin. 
          Interdum et malesuada fames ac ante ipsum primis in faucibus.
        </Text>

        <Text title>
          Text input
        </Text>

        <TextInput
          label="Name"
          placeholder="Enter your name"
          returnKeyType="next"
          />

        <TextInput
          label="Phone"
          prefixValue="+45"
          prefixOnPress={()=> console.log('press')}
          placeholder="Enter your phone number"
          keyboardType="numeric"
          returnKeyType="next"
          />

        <TextInput
          label="Activation code"
          placeholder="Enter 6-digit code"
          keyboardType="numeric"
          returnKeyType="next"
          />

        <TextInput
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          returnKeyType="next"
          />

        <Text title>Buttons</Text>
        <Text p>
          Todo
        </Text>
          
      </KeyboardAwareScrollView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    darkThemeFlag: state.flags.darkTheme
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    setDarkThemeFlag: (enabled) => dispatch(setFlagsAction({darkTheme: enabled}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(DesignSystemMain))
