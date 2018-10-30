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
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  StyleSheet,
  View,
  Platform,
  TouchableHighlight,
} from 'react-native'
import { TextInput } from '../shared'
import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'


// Components
import Avatar from 'uPortMobile/lib/components/shared/Avatar'

// Selectors
import {
  segmentId,
  currentAddress,
  ownClaims,
  currentIdentity
} from 'uPortMobile/lib/selectors/identities'
import {
  offline
} from 'uPortMobile/lib/selectors/processStatus'
import { toJs } from 'mori'

// Actions
import {
  addData
} from 'uPortMobile/lib/actions/onboardingActions'
import {
  addImageOnboarding,
  addClaims
} from 'uPortMobile/lib/actions/uportActions'

import ProcessCard from '../shared/ProcessCard'
import { Text } from '../shared'
import { connectTheme } from 'uPortMobile/lib/styles'
import { track } from 'uPortMobile/lib/actions/metricActions'

// Styles
import {colors, textStyles, onboardingStyles} from 'uPortMobile/lib/styles/globalStyles'
const styles = StyleSheet.create({
  emptyAvatar: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: colors.lightPurple,
  }
})

export class OnboardingAvatar extends React.Component {

  constructor (props) {
    super(props)
    this.photoSelection = this.photoSelection.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.onComplete = this.onComplete.bind(this)
    this.onProcess = this.onProcess.bind(this)
    // console.log('ONBOARDING AVATAR')
    this.state = {
      name: ''
    }
  }
  componentWillMount () {
    this.props.trackSegment('Open')
  }

  onProcess () {
    this.props.trackSegment('Submit')
    const userData = {...this.props.userData, name: this.state.name}
    this.props.addData(userData)
    this.props.storeClaims(this.props.address, userData)
    this.continue()
  }

  continue () {
    if (Platform.OS === 'ios') {
      this.props.navigator.push({
        screen: 'onboarding.notifications',
        navigatorStyle: {
          navBarHidden: true
        }
      })
    } else {
      this.props.navigator.push({
        screen: 'onboarding.testnetWarning',
        navigatorStyle: {
          navBarHidden: true
        }
      })
    }
  }

  onComplete () {
    this.props.trackSegment('Skip')
    this.continue()
  }

  handleCancel () {
    this.props.addData({avatar: false})
    this.props.storeClaims(this.props.address, {name: 'Identity 1'})
    this.continue()
  }
  photoSelection () {
    photoSelectionHandler({
      cameraStatus: this.props.cameraStatus,
      photoStatus: this.props.photoStatus,
      segmentId: this.props.segmentId,
      addFn: this.props.addImageOnboarding
    })
  }
  handleChange (name) {
    this.setState({name})
  }

  render () {
    return (
      <ProcessCard
        skippable
        invalid={!this.state.name}
        onProcess={this.onProcess}
        onContinue={this.onComplete}
        onSkip={this.handleCancel}
      >
        <Text title>
          Enter Your Information
        </Text>
        <Text p>
          Your information is private and only stored on your device
        </Text>

        <TouchableHighlight
          style={{alignSelf: 'center'}}
          onPress={() => this.photoSelection()}
          underlayColor='rgba(0,0,0,0.0)'>
          <View>
            { this.props.userData.avatar
            ? <Avatar size={124} source={this.props.userData.avatar} initialsStyle={{fontSize: 36}} />
            : <View style={styles.emptyAvatar}>
              <Text infoButtonLabel style={{marginBottom: 0}}>Upload Photo</Text>
            </View>}
            {!this.props.userData.avatar && <Text infoButtonLabel>Tap to upload</Text>}
          </View>
        </TouchableHighlight>

        <TextInput
          onChangeText={(name) => this.handleChange(name)}
          value={this.state.name}
          label='Name'
          placeholder='Enter your name'
          returnKeyType='next'
          allowFontScaling
        />
      </ProcessCard>
    )
  }
}

OnboardingAvatar.propTypes = {
  cameraStatus: PropTypes.string,
  navigator: PropTypes.object,
  offline: PropTypes.bool,
  photoStatus: PropTypes.string,
  segmentId: PropTypes.string,
  userData: PropTypes.object,
  myInfo: PropTypes.object,
  addData: PropTypes.func,
  addImageOnboarding: PropTypes.func,
  authorizeCamera: PropTypes.func,
  authorizePhotos: PropTypes.func,
  trackSegment: PropTypes.func
}

const mapStateToProps = (state) => {
  return {
    cameraStatus: state.authorization.cameraAuthorized,
    offline: offline(state),
    address: currentAddress(state),
    photoStatus: state.authorization.photoAuthorized,
    segmentId: segmentId(state),
    userData: state.onboarding.userData,
    myInfo: toJs(ownClaims(state)),
    identity: toJs(currentIdentity(state))
  }
}
export const mapDispatchToProps = (dispatch) => {
  return {
    addData: (data) => {
      dispatch(addData(data))
    },
    storeClaims: (address, data) => {
      dispatch(addClaims(address, data))
    },
    addImageOnboarding: (avatarObj) => {
      dispatch(addImageOnboarding(avatarObj))
    },
    trackSegment: (event) => {
      dispatch(track(`Onboarding Avatar ${event}`))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(OnboardingAvatar))
