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
import { eventChannel, END } from 'redux-saga'
import { AppState, PushNotificationIOS, NativeModules } from 'react-native'
import { takeEvery, call, put, select, take, spawn, all } from 'redux-saga/effects'
import { waitUntilConnected } from './networkState'
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import { notificationCount } from 'uPortMobile/lib/selectors/activities'
import { REGISTER_DEVICE_FOR_NOTIFICATIONS, RECEIVE_DEVICE_TOKEN, UPDATE_BADGE_COUNT, SEND_LOCAL_NOTIFICATION, INIT_NOTIFICATIONS, CANCEL_SCHEDULED_NOTIFICATION } from 'uPortMobile/lib/constants/SnsRegistrationActionTypes'
import { OPEN_ACTIVITY } from 'uPortMobile/lib/constants/UportActionTypes'
import { storeDeviceToken, storeEndpointArn, skipPushNotifications, handleEncryptedMessage } from 'uPortMobile/lib/actions/snsRegistrationActions'
import { handleURL, selectRequest } from 'uPortMobile/lib/actions/requestActions'
import {
  saveMessage, saveError, clearMessage, startWorking, stopWorking
} from 'uPortMobile/lib/actions/processStatusActions'

const RNSNS = NativeModules.RNSNS

function * handleMessage (message) {
  try {
    console.log(message)
    const data = message.getData()
    // console.log(data)
    if (data.uport) {
      const url = data.uport && data.uport.url
      if (url) {
        yield put(handleURL(url, {postback: true, popup: AppState.currentState === 'active', clientId: data.uport.clientId, legacyPush: true}))
      } else if (data.uport.messageHash) {
        // it's and encrypted message, fetch it from pututu
        yield put(handleEncryptedMessage(data.uport.messageHash))
      }
    } else if (data.activityId) {
      // console.log(AppState.currentState)
      // if (AppState.currentState !== 'active') {
      yield put(selectRequest(data.activityId))
      // }
    }
  } catch (e) {
    console.log(e)
  }
}

function * listenToNotifications () {
  // const token = yield select(deviceToken)
  // if (!token) return
  const notificationsChannel = yield eventChannel(emitter => {
    try {
      PushNotificationIOS.addEventListener('notification', (message) => {
        // console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        // console.log('received notification')
        // console.log(message)
        emitter(message)
      })
      PushNotificationIOS.addEventListener('localNotification', (message) => {
        // console.log('received local notification')
        // console.log(message)
        emitter(message)
      })
    } catch (error) {
      console.log('error registering for notifications')
      console.log(error)
    }
    return () => {
      // console.log('unsubscribe to notification')
    }
  })

  while (true) {
    const message = yield take(notificationsChannel)
    // console.log('<<<<<====== received message through notificationsChannel')
    yield handleMessage(message)
  }
}

function * getInitialNotification () {
  try {
    const message = yield call(PushNotificationIOS.getInitialNotification)
    if (!message) return
    // console.log('<<<<<<===== getInitialNotification')
    yield handleMessage(message)
  } catch (error) {
    // console.log(error)
  }
}

function * registerDeviceForNotifications () {
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
  console.log('received device token')
  // console.log(deviceToken)
  yield put(saveMessage('push', `Registering ${deviceToken} on SNS`))
  yield put(storeDeviceToken(deviceToken))
  const address = yield select(currentAddress)
  yield call(waitUntilConnected)
  const endpointArn = yield call(RNSNS.registerDevice, deviceToken, address)
  console.log(endpointArn)
  yield put(storeEndpointArn(endpointArn))
  yield put(clearMessage('push'))
}

// this is deprecated will be removed soon
function * sendLocalNotification ({activityId, message, repeatInterval}) {
  yield call(PushNotificationIOS.scheduleLocalNotification, {fireDate: new Date().getTime(), alertBody: message, soundName: '', userInfo: {activityId}, repeatInterval: repeatInterval, uport: {url: message}})
}

function * cancelLocalNotification ({activityId}) {
  yield call(PushNotificationIOS.cancelLocalNotifications, {userInfo: {activityId}})
}

function * updateBadgeCount () {
  const count = yield select(notificationCount)
  yield call(PushNotificationIOS.setApplicationIconBadgeNumber, count)
}

function * notificationRegistrationSaga () {
  yield all([
    takeEvery(INIT_NOTIFICATIONS, getInitialNotification),
    takeEvery(INIT_NOTIFICATIONS, listenToNotifications),
    takeEvery(REGISTER_DEVICE_FOR_NOTIFICATIONS, registerDeviceForNotifications),
    takeEvery(RECEIVE_DEVICE_TOKEN, receiveDeviceToken),
    // Disabling this. Will remove soon
    takeEvery(SEND_LOCAL_NOTIFICATION, sendLocalNotification),
    takeEvery(CANCEL_SCHEDULED_NOTIFICATION, cancelLocalNotification),
    takeEvery([UPDATE_BADGE_COUNT, OPEN_ACTIVITY], updateBadgeCount)
  ])
}

export default notificationRegistrationSaga
