const blacklist = require('metro/src/blacklist')
const extraNodeModules = require('node-libs-browser')

module.exports = {
  getBlacklistRE () {
    return blacklist([/react-native\/local-cli\/core\/__fixtures__.*/])
  },
  extraNodeModules
}