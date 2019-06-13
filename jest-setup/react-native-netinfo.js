import { NativeModules } from 'react-native';

NativeModules.RNCNetInfo = {
  getCurrentState: jest.fn(),
  addListener: jest.fn(),
  removeListeners: jest.fn()
}
