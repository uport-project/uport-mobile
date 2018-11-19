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
import { View, ScrollView, Platform, TouchableOpacity, StyleSheet} from 'react-native'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultTheme } from 'uPortMobile/lib/styles'
import { colors as globalColors } from 'uPortMobile/lib/styles/globalStyles'
import Text from './Text'
import { map, keys } from 'lodash'
import S from 'string'
import Icon from 'react-native-vector-icons/Ionicons'
import moment from 'moment'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

const maxStringLength = 50

export class Item extends Component {
  
  static propTypes = {
    title: PropTypes.string,
    spacer: PropTypes.bool,
  }
  
  static contextTypes = {
    theme: PropTypes.object
  }

  render () {
    const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
    let value = null
    let count = null
    let onPress = null
    switch (typeof this.props.value) {
      case 'boolean':
        value = this.props.value ? 'Yes' : 'No'
        break
      case 'number':
        value = this.props.value.toString()
        break
      case 'string':
        value = this.props.value.toString()
        if (value.length > maxStringLength) {
          value = `${value.substr(0, maxStringLength)}...`
          onPress = () => this.props.navigator.push({
            screen: 'uport.nestedInfo',
            title: this.props.title,
            passProps: {data: this.props.value}
          })
        }
        break
      case 'object':
        if (Array.isArray(this.props.value)) {
          count = this.props.value.length.toString()
        }
        onPress = () => this.props.navigator.push({
          screen: 'uport.nestedInfo',
          title: this.props.title,
          passProps: {data: this.props.value}
        })
        break
    }
    const ForwardArrow = () => <Icon name={Platform.OS === 'ios' ? 'ios-arrow-forward-outline' : 'md-arrow-forward'} color={colors.secondary} style={{marginLeft: 16, alignSelf: 'center'}} size={20} />
    const Contents = () => (
      <View style={[styles.nestedInfoItem, this.props.spacer === true && styles.nestedInfoItemSpacer]}>
        <View style={{flex: 1}}>
          <View>
            <Text style={{color: colors.secondary, fontSize: 11, paddingBottom: 5 }}>{this.props.title && this.props.title.toUpperCase()}</Text>
          </View>
          {<View>
            <Text style={{fontSize: 16}}>{value || 'More...'}</Text>
          </View>}
        </View>
        {count !== null && <View style={styles.nestedIndfoCount}>
            <Text>{count + ' more items'}</Text>
          </View>}
        {onPress !== null && <ForwardArrow />}
      </View>
    )
    return onPress !== null ? <TouchableOpacity onPress={onPress} ><Contents /></TouchableOpacity> : <Contents />
  }
}

export class Section extends Component {j
  constructor (props) {
    super(props)
    this.renderItem = this.renderItem.bind(this)
  }
  
  static propTypes = {
    title: PropTypes.string,
  }

  static contextTypes = {
    theme: PropTypes.object
  }

  renderItem (data, key) {
    const humanizedTitle = S(key).humanize().titleCase().s
    const allKeys = keys(this.props.data)
    const spacer = key !== allKeys[allKeys.length - 1]
    return <Item spacer={spacer} key={key} navigator={this.props.navigator} title={humanizedTitle} value={data} />
  }

  render () {
    const { styles, colors } = defaultTheme
    return (
      <View>
        {this.props.title !== null && <Text sectionTitle style={{paddingVertical: 8, paddingLeft: 10, fontSize: 12}}>{this.props.title && this.props.title.toUpperCase()}</Text>}
        <View style={[styles.sectionWrapper, {borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: globalColors.white216, borderTopColor: globalColors.white216,}]}>
          {map(this.props.data, this.renderItem)}
        </View>
      </View>
    )
  }
}

export class NestedInfo extends Component {

  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  constructor (props) {
    super(props)
    this.renderItem = this.renderItem.bind(this)
  }

  renderItem (data, key) {
    const humanizedTitle = S(key).humanize().titleCase().s

    switch (typeof data) {
      case 'string':
      case 'number':
      case 'boolean':
        let newData = {}
        newData[key] = data
        return <Section key={key} navigator={this.props.navigator} data={newData} />
      case 'object':
        if (Array.isArray(data)) {
          let newData = {}
          newData[key] = data
          return <Section key={key} navigator={this.props.navigator} data={newData} />
        }      
        break
    }
    return <Section key={key} navigator={this.props.navigator} title={humanizedTitle} data={data} />
  }

  render () {
    const { styles, colors } = defaultTheme
    const { verification } = this.props
    return (
      <View style={[styles.container]}>
        <ScrollView 
          style={[styles.contentContainer, styles.homeContainer, {padding: 0}]}
          contentContainerStyle={{paddingBottom: 44}}>
          {typeof this.props.data !== 'string' && map(this.props.data, this.renderItem)}
          {typeof this.props.data === 'string' && <Text>{this.props.data}</Text>}

          {
            verification && verification.exp &&
            <View>
              <Section data={{expiry: moment(verification.exp).format('DD MMMM YYYY')}} navigator={this.props.navigator}/>
              <Section data={{issuer: verification.iss}} navigator={this.props.navigator} />
              <Section data={{token: verification.token}} navigator={this.props.navigator} />
            </View>
          }
          
        </ScrollView>
      </View>
    )
  }
}

NestedInfo.contextTypes = {
  theme: PropTypes.object
}

export default NestedInfo
