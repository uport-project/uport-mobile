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
import { StyleSheet } from 'react-native'
import Editor from './Editor'
import Viewer from './Viewer'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  currentAddress,
  ownClaims
} from 'uPortMobile/lib/selectors/identities'
import { colors, font } from 'uPortMobile/lib/styles/globalStyles'
import { toJs, get } from 'mori'
import {
  addClaims,
  addImage
} from 'uPortMobile/lib/actions/uportActions'
import { editMyInfo, updateShareToken } from 'uPortMobile/lib/actions/myInfoActions'

import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'

const styles = StyleSheet.create({
  nameStyle: {
    flex: 1,
    marginLeft: 24,
    // paddingLeft: 2,
    textAlign: 'left'
    // paddingTop: Platform.OS === 'ios' ? 2 : 12
  },
  input: {
    // padding: 2,
    // margin: 2,
    height: 22
  },
  editAvatar: {
    position: 'absolute',
    top: 2,
    left: 2,
    height: 96,
    width: 96,
    borderRadius: 48,
    backgroundColor: colors.translucentGrey,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const USER_FIELDS = ['name', 'email', 'country', 'phone', 'avatar']

export class MyInformation extends React.Component {
  constructor (props) {
    super()
    this.state = {
      editing: false
    }
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    props.navigator.setStyle({
      navBarNoBorder: true,
      navBarTextColor: colors.grey74,
      navBarButtonColor: colors.purple,
      navBarFontSize: 16,
      navBarFontFamily: font
    })
    this.photoSelection = this.photoSelection.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }
  componentDidMount () {
    Icon.getImageSource('ios-arrow-back-outline', 32, colors.purple).then((back) => {
      this.props.navigator.setButtons({
        leftButtons: [
          {
            id: 'back',
            icon: back
          }
        ],
        rightButtons: [{
          title: 'Edit',
          id: 'edit'
        }]
      })
    })
    this.props.updateShareToken(this.props.address)
  }
  componentWillUpdate (np, ns) {
    ns.editing
    ? (this.props.navigator.setButtons({
      leftButtons: [{
        title: 'Cancel',
        id: 'cancel',
        buttonColor: colors.red
      }],
      rightButtons: [{
        title: 'Save',
        id: 'save',
        buttonColor: colors.green
      }]
    }))
    : Icon.getImageSource('ios-arrow-back-outline', 32, colors.purple).then((back) => {
      this.props.navigator.setButtons({
        leftButtons: [
          {
            id: 'back',
            icon: back
          }
        ],
        rightButtons: [{
          title: 'Edit',
          id: 'edit'
        }]
      })
    })
  }
  onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'edit') { // this is the same id field from the static navigatorButtons definition
        this.setState({editing: true})
      }
      if (event.id === 'back') { // this is the same id field from the static navigatorButtons definition
        debounce(() => this.props.navigator.pop({
        }), 1000, {leading: true, trailing: false})()
      }
      if (event.id === 'save') {
        this.handleSubmit()
      }
      if (event.id === 'cancel') {
        this.handleCancel()
      }
    }
  }

  handleCancel () {
    const change = {}
    USER_FIELDS.map(attr => {
      change[attr] = this.props.userData[attr]
    })
    this.props.editMyInfo(change)
    this.setState({editing: false})
  }

  handleChange (change) {
    this.props.editMyInfo(change)
  }

  changed () {
    const change = {}
    USER_FIELDS.map((attr) => {
      if (this.props[attr] !== this.props.userData[attr]) {
        change[attr] = this.props[attr]
      }
    })
    return change
  }

  handleSubmit () {
    const change = this.changed()
    delete change['avatar']
    if (Object.keys(change).length > 0) {
      this.props.storeOwnClaim(this.props.address, change)
    }
    if (this.props.avatar && this.props.avatar.data) {
      // console.log('Avatar', this.props.avatar)
      this.props.addImage(this.props.address, 'avatar', this.props.avatar)
    }
    this.props.updateShareToken(this.props.address)
    this.setState({editing: false})
  }

  photoSelection () {
    photoSelectionHandler({
      cameraStatus: this.props.cameraStatus,
      photoStatus: this.props.photoStatus,
      segmentId: this.props.segmentId,
      addFn: this.props.editMyInfo
    })
  }
  render () {
    const view = this.state.editing
    ? <Editor
      avatar={this.props.avatar}
      country={this.props.country}
      email={this.props.email}
      handleChange={this.handleChange}
      name={this.props.name}
      phone={this.props.phone}
      photoSelection={this.photoSelection}
      size={this.props.size}
    />
    : <Viewer
      navigator={this.props.navigator}
      address={this.props.address}
      avatar={this.props.avatar}
      country={this.props.country}
      email={this.props.email}
      name={this.props.name}
      phone={this.props.phone}
      userData={this.props.userData}
      shareToken={this.props.shareToken}
    />
    return view
  }
}

MyInformation.propTypes = {
  userData: PropTypes.object,
  address: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string
}

const mapStateToProps = (state, ownProps) => {
  const userData = toJs(ownClaims(state)) || {}
  return {
    ...ownProps,
    avatar: typeof state.myInfo.changed.avatar !== 'undefined' ? state.myInfo.changed.avatar : userData.avatar,
    name: typeof state.myInfo.changed.name !== 'undefined' ? state.myInfo.changed.name : userData.name,
    email: typeof state.myInfo.changed.email !== 'undefined' ? state.myInfo.changed.email : userData.email,
    country: typeof state.myInfo.changed.country !== 'undefined' ? state.myInfo.changed.country : userData.country,
    phone: typeof state.myInfo.changed.phone !== 'undefined' ? state.myInfo.changed.phone : userData.phone,
    userData,
    address: currentAddress(state),
    shareToken: state.myInfo.shareToken
  }
}
export const mapDispatchToProps = (dispatch) => {
  return {
    storeOwnClaim: (address, claims) => {
      dispatch(addClaims(address, claims))
    },
    editMyInfo: change => {
      dispatch(editMyInfo(change))
    },
    addImage: (address, claimType, image) => {
      dispatch(addImage(address, claimType, image))
    },
    updateShareToken: (address) => {
      dispatch(updateShareToken(address))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyInformation)
