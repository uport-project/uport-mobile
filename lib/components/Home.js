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
import { connect } from 'react-redux'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native'
import { debounce } from 'lodash'

// Components
import Icon from 'react-native-vector-icons/Ionicons'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import AvatarNameHeader from './shared/AvatarNameHeader'
import Fab from './shared/Fab'
// Selectors
import {
  currentAvatar,
  currentName
} from 'uPortMobile/lib/selectors/identities'

// Styles
import { colors, font } from 'uPortMobile/lib/styles/globalStyles'

import { NavigationActions } from 'uPortMobile/lib/utilities/NavigationActions'

const styles = StyleSheet.create({
  iconCircle: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.grey130,
    borderRadius: 19,
    justifyContent: 'center',
    width: 38,
    height: 38
  },
  menuItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white216,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 28
  },
  menuItemArrow: {
  },
  menuItemText: {
    color: colors.grey74,
    flexGrow: 1,
    fontFamily: font,
    fontSize: 20,
    lineHeight: 27,
    marginLeft: 13
  }
})

// const analytics = new Analytics('TP9aPQLX69CtFXTtQtRmqGjUjNgRiRo3')

export let rootNavigator = {}

export class Home extends React.Component {

  constructor (props) {
    super()
    rootNavigator = props.navigator
    NavigationActions.setNavigator(props.navigator)
    rootNavigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    rootNavigator.setStyle({
      navBarNoBorder: true,
      navBarTextColor: colors.grey74,
      navBarButtonColor: colors.grey74,
      navBarBackgroundColor: colors.white246
    })
  }
  componentDidMount () {
    this.props.navigator.setDrawerEnabled({
      side: 'right', // the side of the drawer since you can have two, 'left' / 'right'
      enabled: false // should the drawer be enabled or disabled (locked closed)
    })
    Icon.getImageSource('ios-menu', 32, colors.purple).then((menu) => {
      this.props.navigator.setButtons({
        leftButtons: [
          {id: 'menu', icon: menu, buttonColor: colors.purple}
        ],
        rightButtons: [
          {
            id: 'notifications', 
            component: 'uport.notificationsButton',
          }
        ]
      })
    })
  }
  onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'menu') { // this is the same id field from the static navigatorButtons definition
        this.props.navigator.push({
          screen: 'uport.more',
          animated: true,
          title: 'More'
        })
      }
    }
  }

  render () {
    return (
      <View style={{
        backgroundColor: colors.white,
        flex: 1
      }}>

        {/* Avatar Name Row */}
        <AvatarNameHeader avatar={this.props.avatar} name={this.props.name} />
        <View style={{
          justifyContent: 'flex-start',
          flex: 0,
          flexDirection: 'column',
          elevation: 8
        }}>
          <View>
            <TouchableOpacity onPress={debounce(() => {
              this.props.navigator.push({
                screen: 'uport.myInfo',
                title: 'Identity',
                animated: true, // does the push have transition animation or does it happen immediately (optional)
              })
            }, 1000, {leading: true, trailing: false})}>
              <View style={styles.menuItem}>
                <View style={styles.iconCircle}>
                  <Icon name={'md-information'} color={colors.grey130} size={33} style={{height: 33}} />
                </View>
                <Text style={styles.menuItemText}>
                  Identity
                </Text>
                <Icon name={'ios-arrow-forward-outline'} color={colors.grey216} size={20} style={styles.menuItemArrow} />
              </View>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={{}} onPress={debounce(() => {
              this.props.navigator.push({
                screen: 'uport.verifications',
                title: 'Verifications',
                animated: true,
              })
            }, 1000, {leading: true, trailing: false})}>
              <View style={styles.menuItem}>
                <View style={styles.iconCircle}>
                  <Icon name={'ios-checkmark'} color={colors.grey130} size={33} style={{height: 32}} />
                </View>
                <Text style={styles.menuItemText}>
                  Verifications
                </Text>
                <Icon name={'ios-arrow-forward-outline'} color={colors.grey216} size={20} style={styles.menuItemArrow} />
              </View>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={{}} onPress={debounce(() => {
              this.props.navigator.push({
                screen: 'uport.accounts',
                title: 'Accounts'
              })
            }, 1000, {leading: true, trailing: false})}>
              <View style={styles.menuItem}>
                <View style={styles.iconCircle}>
                  <FAIcon name={'user-o'} color={colors.grey130} size={22} style={{height: 24}} />
                </View>
                <Text style={styles.menuItemText}>
                  Accounts
                </Text>
                <Icon name={'ios-arrow-forward-outline'} color={colors.grey216} size={20} style={styles.menuItemArrow} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Fab
          icon='qrcode-scan'
          onPress={() => this.props.navigator.push({
            screen: 'uport.scanner',
            animated: false,
            navigatorStyle: {
              navBarHidden: true
            }
          })}
        />
      </View>

    )
  }
}

Home.propTypes = {
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    avatar: currentAvatar(state),
    name: currentName(state)
  }
}

export const Base = Home

export default connect(mapStateToProps)(Home)
