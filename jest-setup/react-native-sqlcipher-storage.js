jest.mock('react-native-sqlcipher-storage', () => {
  return {
    openDatabase: jest.fn(),
    DEBUG: jest.fn(),
    enablePromise: jest.fn()
  }
})
