/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        babelTransformerPath: require.resolve('react-native-typescript-transformer'),
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
}
