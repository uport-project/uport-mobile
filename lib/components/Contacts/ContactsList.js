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
import {
  FlatList,
  Text,
  View
} from 'react-native'

import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import Icon from 'react-native-vector-icons/Ionicons'
// Selectors
import { connections } from 'uPortMobile/lib/selectors/identities'

// Actions
// import { contactsSelectContact } from 'uPortMobile/lib/actions/contactsActions'

import globalStyles, {colors} from 'uPortMobile/lib/styles/globalStyles'

const ContactListItem = ({item}) => (
  <View style={[globalStyles.menuItem]}>
    <Avatar size={40} source={item} />
    <Text style={[globalStyles.menuItemText, {flex: 1, marginLeft: 19}]}>
      {item.name ? item.name : `${item.address.slice(0, 30)}...`}
    </Text>
  </View>
)

export class ContactsList extends React.Component {
  constructor (props) {
    super()
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    // this.handleContactClick = this.handleContactClick.bind(this)
  }
  componentDidMount () {
    Icon.getImageSource('ios-arrow-back-outline', 32, '#9B9B9B').then((back) => {
      Icon.getImageSource('ios-add', 40, '#9B9B9B').then((add) => {
        this.props.navigator.setButtons({
          // commenting out the add button until we know what to with it
          // rightButtons: [
          //   {id: 'add', icon: add}
          // ],
          leftButtons: [
            {id: 'back', icon: back}
          ]
        })
      })
    })
  }
  onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'back') { // this is the same id field from the static navigatorButtons definition
        this.props.navigator.pop({
        })
      }
      // if (event.id === 'add') { // this is the same id field from the static navigatorButtons definition
      //   // this.props.toggleDrawer({
      //   //   side: 'left',
      //   //   animated: true
      //   // })
      // }
    }
  }
  // handleContactClick (contact) {
  //   this.props.selectContact(contact)
  //   this.props.navigator.push({
  //     screen: 'contacts.detail'
  //   })
  // }
  render () {
    return (
      <View style={{backgroundColor: colors.white246, flex: 1}}>
        <FlatList
          style={{backgroundColor: '#ffffff'}}
          data={this.props.connections}
          renderItem={ContactListItem}
          keyExtractor={(item, index) => item.address}
        />
      </View>
    )
  }
}

ContactsList.propTypes = {
  connections: PropTypes.array,
  selectContact: PropTypes.func
}

ContactsList.defaultProps = { connections: [] }

const mapStateToProps = (state) => {
  return {
    connections: connections(state) || []
  }
}

// export const mapDispatchToProps = (dispatch) => {
//   return {
//     selectContact: (contact) => dispatch(contactsSelectContact(contact))
//   }
// }

export default connect(mapStateToProps)(ContactsList)
