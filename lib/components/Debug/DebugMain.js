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
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'
import _ from 'lodash'
import Config from '../../config'

class DebugMain extends React.Component {
  componentDidMount() {
    this.props.navigator.setTitle({
      title: "Debug" 
    })
  }

  render() {
    const flagArray = _.orderBy(_.map(this.props.flags, (value, name) => {
      return {
        name,
        value,
        type: typeof(value),
        disabled: _.includes(Config.flags.disabledInDebugMode, name)
      }
    }), ['type', 'name'], ['desc', 'asc'])
    console.log(flagArray)
    return (
      <KeyboardAwareScrollView>

        <Text title>
          Feature flags
        </Text>        

        {_.map(flagArray, (item) => {
          if (item.type === "boolean") {
            return (<MenuItemSwitch 
              key={item.name}
              title={item.name}
              value={item.value}
              onValueChange={(value) => {let obj={}; obj[item.name]=value; this.props.setFlag(obj)}}
              disabled={item.disabled}
            />)
          } else {
            return (<TextInput
              key={item.name}
              label={item.name}
              placeholder={`Enter value for ${item.name}`}
              value={item.value}
              onChangeText={(value) => {let obj={}; obj[item.name]=value; this.props.setFlag(obj)}}
              editable={!item.disabled}
            />)
          }
        })}

        <Text title>
          Logs
        </Text>        
        <Text subTitle>
          Coming soon
        </Text>  
        <Menu>      
          <MenuItem
            title='Console logs'
          />
          <MenuItem
            title='API calls'
          />
        </Menu>
          
      </KeyboardAwareScrollView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    flags: state.flags
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    setFlag: (flag) => dispatch(setFlagsAction(flag)) // setFlagsAction({darkTheme: true})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(DebugMain))
