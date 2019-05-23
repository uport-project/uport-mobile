/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 */

module.exports = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      // ecma: 8,
      // keep_classnames: true,
      // keep_fnames: true,
      // module: true,
      mangle: {
        // module: true,
        // keep_classnames: true,
        // keep_fnames: true,
      },
    },
    getTransformOptions: async () => ({
      transform: {
        babelTransformerPath: require.resolve('react-native-typescript-transformer'),
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
}
