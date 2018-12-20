const blacklist = require('metro/src/blacklist')
const extraNodeModules = require('node-libs-browser')

module.exports = {
  getTransformModulePath () {
    return require.resolve('react-native-typescript-transformer')
  },
  getSourceExts () {
    return ['ts', 'tsx']
  },
  getBlacklistRE () {
    return blacklist([/react-native\/local-cli\/core\/__fixtures__.*/])
  },
  extraNodeModules
}
