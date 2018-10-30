jest.mock('react-native-vector-icons/Ionicons', () => {
  const RealComponent = require.requireActual('react-native-vector-icons/Ionicons')
  const React = require('React')
  class Icon extends React.Component {
    render () {
      return React.createElement('Icon', this.props, this.props.children)
    }
  }
  Icon.propTypes = RealComponent.propTypes
  Icon.getImageSource = () => new Promise((resolve, reject) => null)
  return Icon
})

jest.mock('react-native-vector-icons/EvilIcons', () => {
  const RealComponent = require.requireActual('react-native-vector-icons/EvilIcons')
  const React = require('React')
  class Icon extends React.Component {
    render () {
      return React.createElement('Icon', this.props, this.props.children)
    }
  }
  Icon.propTypes = RealComponent.propTypes
  Icon.getImageSource = () => new Promise((resolve, reject) => null)
  return Icon
})

jest.mock('react-native-vector-icons/FontAwesome', () => {
  const RealComponent = require.requireActual('react-native-vector-icons/FontAwesome')
  const React = require('React')
  class Icon extends React.Component {
    render () {
      return React.createElement('Icon', this.props, this.props.children)
    }
  }
  Icon.propTypes = RealComponent.propTypes
  Icon.getImageSource = () => new Promise((resolve, reject) => null)
  return Icon
})

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const RealComponent = require.requireActual('react-native-vector-icons/MaterialCommunityIcons')
  const React = require('React')
  class Icon extends React.Component {
    render () {
      return React.createElement('Icon', this.props, this.props.children)
    }
  }
  Icon.propTypes = RealComponent.propTypes
  Icon.getImageSource = () => new Promise((resolve, reject) => null)
  return Icon
})
