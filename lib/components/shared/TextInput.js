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
import { View, TextInput, Text, TouchableHighlight } from 'react-native'
import { defaultTheme } from 'uPortMobile/lib/styles'

class CustomTextInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      prefixActive: false
    }
  }
  render() {
    const { props, context } = this
    const { styles, colors, isDark } = context.theme ? context.theme : defaultTheme    
    return (
      <View>
        {props.label && <Text 
          style={styles.textInputLabel}>
          {props.label}
        </Text>}
    
        <View style={[styles.textInputWrapper, props.multiline && styles.textInputWrapperMultiline]}>
          
          {props.prefixValue && <TouchableHighlight
            style={styles.textInputPrefixButton}
            onPress={props.prefixOnPress}
            underlayColor={colors.brand}
            onShowUnderlay={() => this.setState({prefixActive: true})}
            onHideUnderlay={() => this.setState({prefixActive: false})}
            >
            <Text style={[
              styles.textInputPrefixLabel,
              {color: this.state.prefixActive ? colors.background : colors.brand}
            ]}>
              {props.prefixValue}
            </Text>
          </TouchableHighlight>}
          
          <TextInput 
            {...props} 
            underlineColorAndroid={colors.background}
            keyboardAppearance={isDark ? 'dark' : 'light'}
            style={[styles.textInput, props.multiline && styles.textInputMultiline]}
            placeholderTextColor={colors.border}
            multiline={props.multiline}
            />
        </View>
      </View>
    )
  }
}

CustomTextInput.propTypes = {
  ...TextInput.propTypes,
  label: PropTypes.string,
  prefixValue: PropTypes.string,
  prefixOnPress: PropTypes.func,
  multiline: PropTypes.bool,
}

CustomTextInput.contextTypes = {
  theme: PropTypes.object
}


export default CustomTextInput