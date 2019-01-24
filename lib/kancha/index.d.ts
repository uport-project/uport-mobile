declare module "@kancha" {
  import * as React from "react";
  import * as ReactNative from "react-native";
  
  namespace Kancha {

    interface Screen extends ReactNative.ViewProperties {}

  }

  export class Screen extends React.Component<Kancha.Screen, any> { }

}