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

import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native'
import Permissions from 'react-native-permissions'
import ImagePicker from 'react-native-image-picker'
import analytics from 'uPortMobile/lib/utilities/analytics'

import { authorizeCamera, authorizePhotos } from 'uPortMobile/lib/actions/authorizationActions'

const photoSelection = ({ cameraStatus, photoStatus, segmentId, addFn }) => {
  const photoOptions = {
    title: 'Add Picture',
    takePhotoButtonTitle: 'Take Photo',
    chooseFromLibraryButtonTitle: 'Choose from Library',
    quality: 0.5,
    maxWidth: 300,
    maxHeight: 300,
    allowsEditing: true,
    storageOptions: {
      skipBackup: true,
    },
  }
  const ImagePickerHandler = () => {
    ImagePicker.showImagePicker(photoOptions, response => {
      if (response.didCancel) {
        if (segmentId) analytics.track({ userId: segmentId, event: '[MOBILE] Onboarding Avatar Photo Cancel' })
        console.log('User cancelled photo picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
        if (segmentId) {
          analytics.track({
            userId: segmentId,
            event: '[MOBILE] Onboarding Avatar Photo Error',
            properties: {
              errorText: response.error,
            },
          })
        }
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        addFn({ avatar: response })
        // this.props.authorizeCameraAndPhotos(cameraPermission, photoPermission)
      }
    })
  }
  const androidPermissionsRequest = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(response => {
      let photoPermission = response
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(response => {
        let cameraPermission = response
        if (photoPermission && cameraPermission) {
          ImagePickerHandler()
        }
      })
    })
  }
  const iosPermissionsRequest = () => {
    Permissions.request('camera').then(response => {
      let cameraPermission = response
      Permissions.request('photo').then(response => {
        let photoPermission = response
        if (photoPermission === 'authorized' && cameraPermission === 'authorized') {
          ImagePickerHandler()
        }
      })
    })
  }
  const deniedHandler = () => {
    if (cameraStatus === 'denied' || photoStatus === 'denied') {
      if (segmentId) analytics.track({ userId: segmentId, event: '[MOBILE] Onboarding Avatar Permissions Alert' })
      if (Platform.OS === 'ios') {
        Alert.alert('Camera and Photo Access Required', 'Please authorize uport to access cameras and photos', [
          { text: 'Go to Settings', onPress: () => Linking.openURL('app-settings:') },
          {
            text: 'Cancel',
            onPress: () => true, // console.log('ONBOARDING: Cancel Permissions')
          },
        ])
      } else {
        Alert.alert('Camera and Photo Access Required', 'Please authorize uport to access cameras and photos', [
          {
            text: 'OK',
            onPress: () => true, // console.log('ONBOARDING: Cancel Permissions')
          },
        ])
      }
    }
  }
  Platform.OS === 'android' ? androidPermissionsRequest() : iosPermissionsRequest()
  deniedHandler()
}

export const cameraPermissionsDispatcher = dispatch => {
  Platform.OS === 'android'
    ? PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(response => {
        response ? dispatch(authorizeCamera('authorized')) : dispatch(authorizeCamera('denied'))
      })
    : Permissions.requestPermission('camera').then(response => dispatch(authorizeCamera(response)))
}

export const photoPermissionsDispatcher = dispatch => {
  Platform.OS === 'android'
    ? PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(response => {
        response ? dispatch(authorizePhotos('authorized')) : dispatch(authorizePhotos('denied'))
      })
    : Permissions.requestPermission('photo').then(response => dispatch(authorizePhotos(response)))
}

export default photoSelection
