import { AppRegistry } from 'react-native'
import firebase from 'react-native-firebase'

const bgMessaging = async (message) => {
    // handle your message
    console.log({message})
    // const customNotification = JSON.parse(message.data.custom_notification)
    const notification = new firebase.notifications.Notification()
      .setNotificationId(message.messageId)
      .setTitle('My notification title')
      .setBody('My notification body')
      .setData(message.data)
      .android.setChannelId('main')

    firebase.notifications().displayNotification(notification)
    return Promise.resolve()
}

const channel = new firebase.notifications.Android.Channel('main', 'Main Channel', firebase.notifications.Android.Importance.Max)
.setDescription('My apps main channel');

// Create the channel
firebase.notifications().android.createChannel(channel);

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
import { start } from './lib/start'

start()
