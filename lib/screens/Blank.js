import React from "react"
import { View, Text } from 'react-native'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

class Blank extends React.Component {

  static navigatorStyle = {
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
    navBarHidden: true,
}

  constructor(props) {
    super(props)
  }

  render(){
    return (
      <View style={{flex: 1}}>
        
      </View>
    )
  }
}

export default Blank
