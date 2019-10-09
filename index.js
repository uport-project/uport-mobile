import App from './lib/navigators'
import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings(['componentWillUpdate', 'componentWillReceiveProps', 'componentWillMount'])

App()
