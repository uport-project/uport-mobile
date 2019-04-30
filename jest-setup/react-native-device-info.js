
jest.mock('react-native-device-info', () => {
  const DI = {}
  DI.getBuildNumber = () => {
    return '256'
  }
  return DI
})