jest.mock('react-native-svg', () => {
  /**
   * https://github.com/react-native-community/react-native-svg/issues/198
   */

   const React = require('react')
  const ReactNativeSvg = jest.genMockFromModule('react-native-svg')
  
  const excludedExports = ['Svg', 'default', '__esModule']
  const componentsToMock = Object.keys(ReactNativeSvg).filter(key => {
    return !excludedExports.includes(key)
  })
  
  function generateSvgMocks(names) {
    return names.reduce((acc, name) => {
      acc[name] = generateSvgMock(name)
      return acc
    }, generateSvgMock('Svg'))
  }
  
  function generateSvgMock(name) {
    return class SvgMock extends React.Component {
      static displayName = name
      static propTypes = ReactNativeSvg[name].propType
  
      render() {
        return React.createElement(name, this.props, this.props.children)
      }
    }
  }

  return generateSvgMocks(componentsToMock)
})