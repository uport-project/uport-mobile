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
import { AppState, NativeModules } from 'react-native'
import firebase from 'react-native-firebase'

import { eventChannel } from 'redux-saga'
import { takeEvery, call, put, select, take, spawn, all } from 'redux-saga/effects'
import { waitUntilConnected } from './networkState'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
// import { deviceToken } from 'uPortMobile/lib/selectors/snsRegistrationStatus'
import { REGISTER_DEVICE_FOR_NOTIFICATIONS, RECEIVE_DEVICE_TOKEN, UPDATE_BADGE_COUNT, INIT_NOTIFICATIONS, SEND_LOCAL_NOTIFICATION, CANCEL_SCHEDULED_NOTIFICATION } from 'uPortMobile/lib/constants/SnsRegistrationActionTypes'
import { OPEN_ACTIVITY } from 'uPortMobile/lib/constants/UportActionTypes'
import { storeDeviceToken, storeEndpointArn, skipPushNotifications, handleEncryptedMessage } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { handleURL, selectRequest } from 'uPortMobile/lib/actions/requestActions'
import {
  saveMessage, clearMessage, startWorking, stopWorking
} from 'uPortMobile/lib/actions/processStatusActions'

const MySNS = NativeModules.MySNS

function * handleMessage (message) {
  console.log('handleMessage', {message})
  if (message.url) {
    const url = message.url
    if (url) {
      yield put(handleURL(url, {postback: true, popup: AppState.currentState === 'active', clientId: message.clientId}))
    }
  } else if (message.messageHash) {
    // console.log('handling:', message.messageHash)
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
  // console.log('listenToNotifications')
  const notificationsChannel = yield eventChannel(emitter => {
    try {
      this.notificationListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
        emitter(notificationOpen.notification.data)
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
    console.log('getInitialNotification', {message})
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

function * registerDeviceForNotifications () {
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
  // const count = yield select(unreadCount)
  // yield call(PushNotificationIOS.setApplicationIconBadgeNumber, count)
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
