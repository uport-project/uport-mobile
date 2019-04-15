module.exports = {
  sourceMaps: true,
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          tweetnacl: './lib/vendor/nacl-fast',
          'tweetnacl-util': './lib/vendor/nacl-util',
        }
      }
    ]
  ]
};
