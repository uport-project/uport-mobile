import { ScreenVisibilityListener as RNNScreenVisibilityListener } from 'react-native-navigation';

export class ScreenVisibilityListener {

  constructor() {
    this.listener = new RNNScreenVisibilityListener({
      didAppear: ({screen, startTime, endTime, commandType}) => {
        console.log('screenVisibility', `Screen ${screen} displayed in ${endTime - startTime} millis after [${commandType}]`);
      }
    });
  }

  register() {
    this.listener.register();
  }

  unregister() {
    if (this.listener) {
      this.listener.unregister();
      this.listener = null;
    }
  }
}