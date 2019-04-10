import { AppRegistry } from 'react-native'
import firebase from 'react-native-firebase'

const bgMessaging = async (message) => {
    const customNotification = JSON.parse(message.data.custom_notification)
    const notification = new firebase.notifications.Notification()
      .setNotificationId(message.messageId)
      .setTitle(customNotification.title)
      .setBody(customNotification.body)
      .setData(message.data)
      .android.setChannelId('main')
      .android.setSmallIcon(customNotification.icon)

    firebase.notifications().displayNotification(notification)
    return Promise.resolve()
}

const channel = new firebase.notifications.Android.Channel('main', 'Main Channel', firebase.notifications.Android.Importance.Max)
.setDescription('Main channel')

firebase.notifications().android.createChannel(channel)

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging)
import { start } from './lib/start'

start()
