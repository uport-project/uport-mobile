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
import { AppState, NativeModules, Platform, PushNotificationIOS } from 'react-native'
import firebase from 'react-native-firebase'

import { eventChannel, END } from 'redux-saga'
import { takeEvery, call, put, select, take, spawn, all } from 'redux-saga/effects'
import { waitUntilConnected } from './networkState'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import { notificationCount } from 'uPortMobile/lib/selectors/activities'
// import { deviceToken } from 'uPortMobile/lib/selectors/snsRegistrationStatus'
import { REGISTER_DEVICE_FOR_NOTIFICATIONS, RECEIVE_DEVICE_TOKEN, UPDATE_BADGE_COUNT, INIT_NOTIFICATIONS, SEND_LOCAL_NOTIFICATION, CANCEL_SCHEDULED_NOTIFICATION } from 'uPortMobile/lib/constants/SnsRegistrationActionTypes'
import { OPEN_ACTIVITY } from 'uPortMobile/lib/constants/UportActionTypes'
import { storeDeviceToken, storeEndpointArn, skipPushNotifications, handleEncryptedMessage } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { handleURL, selectRequest } from 'uPortMobile/lib/actions/requestActions'
import {
  saveError, saveMessage, clearMessage, startWorking, stopWorking
} from 'uPortMobile/lib/actions/processStatusActions'

const MySNS = Platform.OS === "ios" ? NativeModules.RNSNS : NativeModules.MySNS

function * handleMessage (notification) {
  const message = notification.uport ? notification.uport : notification
  if (message.url) {
    const url = message.url
    if (url) {
      yield put(handleURL(url, {postback: true, popup: AppState.currentState === 'active', clientId: message.clientId}))
    }
  } else if (message.messageHash) {
    // it's and encrypted message, fetch it from pututu
    yield put(handleEncryptedMessage(message.messageHash))
  } else if (message.activityId) {
    // console.log(AppState.currentState)
    // if (AppState.currentState !== 'active') {
    yield put(selectRequest(message.activityId))
    // }
  }
}

function * listenToNotifications () {
  const notificationsChannel = yield eventChannel(emitter => {
    try {
      firebase.messaging().onMessage((notification) => {
        emitter(notification.data)
      })

      firebase.notifications().onNotificationDisplayed((notification) => {
        emitter(notification.data)  
      })

      firebase.notifications().onNotificationOpened((notificationOpen) => {
        firebase.notifications().removeDeliveredNotification(notificationOpen.notification.notificationId)
        emitter(notificationOpen.notification.data)
      })
      firebase.notifications().onNotification((notification) => {
        emitter(notification.data)
      })
    } catch (error) {
      console.log('error registering for notifications')
      console.log(error)
    }
    return () => {}
  })

  while (true) {
    const message = yield take(notificationsChannel)
    console.log('onNotificationOpened', {message})
    yield handleMessage(message)
  }
}

function * getInitialNotification () {
  try {
    // console.log('getInitialNotification')
    const message = yield call([firebase.notifications(), 'getInitialNotification'])
    if (!message) return
    yield handleMessage(message.notification.data)
  } catch (error) {
    console.log(error)
  }
}

function * sendLocalNotification ({activityId, message, repeatInterval}) {

  const notification = new firebase.notifications.Notification()
    .setNotificationId(activityId)
    .setBody('You have received a message')
    .setData({
      url: message,
    })
    .android.setChannelId('main')

  firebase.notifications().scheduleNotification(notification, {
    fireDate: new Date().getTime(),
    repeatInterval
})
}

function * cancelLocalNotification ({idString}) {
  firebase.notifications().cancelNotification(idString)
}

function * registerDeviceForNotificationsAndroid () {
  yield put(startWorking('push'))
  try {
    console.log('Registering FCM')
    yield put(saveMessage('push', 'registering'))
    const deviceToken = yield call([firebase.messaging(), 'getToken'])
    console.log(`FCM deviceToken: ${deviceToken}`)
    if (deviceToken) {
      yield receiveDeviceToken({deviceToken})
    } else {
      yield put(skipPushNotifications())
    }
  } catch (error) {
    console.log(error)
  }
  yield put(stopWorking('push'))
}

function * registerDeviceForNotifications () {
  if (Platform.OS === 'ios') {
    yield registerDeviceForNotificationsiOS()
  } else {
    yield registerDeviceForNotificationsAndroid()
  }
}

function * registerDeviceForNotificationsiOS () {
  // console.log('registerDeviceForNotifications')
  yield put(startWorking('push'))
  const regChannel = yield eventChannel(emitter => {
    // console.log('registering events')
    try {
      PushNotificationIOS.addEventListener('register', (event) => {
        // console.log('registered event')
        // console.log(event)
        emitter(event)
        emitter(END)
      })
      PushNotificationIOS.addEventListener('registrationError', (event) => {
        // console.log('error registering')
        // console.log(event)
        emitter(event)
        emitter(END)
      })
    } catch (error) {
      console.log('exception during event registration')
    }
    return () => {
      console.log('unsubscribe to registerDeviceForNotifications')
    }
  })
  try {
    // console.log('requestPermissions')
    yield put(saveMessage('push', 'registering'))
    PushNotificationIOS.requestPermissions()
    // console.log('waiting for event')
    const deviceToken = yield take(regChannel)
    console.log(`APN deviceToken: ${deviceToken}`)
    if (deviceToken) {
      if (deviceToken.message) {
        yield put(saveError('push', deviceToken.message))
      } else {
        yield receiveDeviceToken({deviceToken})
      }
    } else {
      yield put(saveError('push', 'skipped push'))
      yield put(skipPushNotifications())
    }
  } catch (error) {
    // console.log(error.message)
    yield put(saveError('push', error.message))
    console.log(error)
  }
  yield put(stopWorking('push'))
}

function * receiveDeviceToken ({deviceToken}) {
  // console.log('received device token')
  // console.log(deviceToken)
  yield put(saveMessage('push', `Registering ${deviceToken} on SNS`))
  yield put(storeDeviceToken(deviceToken))
  const address = yield select(currentAddress)
  yield call(waitUntilConnected)
  const endpointArn = yield call(MySNS.registerDevice, deviceToken, address)
  // console.log(endpointArn)
  yield put(storeEndpointArn(endpointArn))
  yield put(clearMessage('push'))
}

function * updateBadgeCount () {
  if (Platform.OS === 'ios') {
    const count = yield select(notificationCount)
    yield call([firebase.notifications(), 'getInitialNotification', count])
  }
}

function * notificationRegistrationSaga () {
  yield all([
    takeEvery(INIT_NOTIFICATIONS, getInitialNotification),
    takeEvery(INIT_NOTIFICATIONS, listenToNotifications),
    takeEvery(SEND_LOCAL_NOTIFICATION, sendLocalNotification),
    takeEvery(CANCEL_SCHEDULED_NOTIFICATION, cancelLocalNotification),
    takeEvery(REGISTER_DEVICE_FOR_NOTIFICATIONS, registerDeviceForNotifications),
    takeEvery(RECEIVE_DEVICE_TOKEN, receiveDeviceToken),
    takeEvery([UPDATE_BADGE_COUNT, OPEN_ACTIVITY], updateBadgeCount)
  ])
}

export default notificationRegistrationSaga
