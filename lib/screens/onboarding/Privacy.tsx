import * as React from 'react'
import { WebView } from 'react-native'
import { Screen } from '@kancha'

interface PrivacyProps extends Kancha.NavigationScreen {}

const overideStyle = `(function() {
  document.querySelector('.w-nav').style.display = 'none'
  document.querySelector('#home').style.marginTop = '-100px'
  document.querySelector('#home').style.height = '200px'
  document.querySelector('#about').style.paddingTop = '20px'
  document.querySelector('.footer-section').style.display = 'none'
  document.querySelector('.hide-mobile-app').style.display = 'none'
})()`

const Privacy: React.FC<PrivacyProps> = () => {
  return (
    <Screen statusBarHidden type={Screen.Types.Primary} config={Screen.Config.NoScroll}>
      <WebView
        source={{ uri: 'https://www.uport.me/privacy-policy' }}
        injectedJavaScript={overideStyle}
        scalesPageToFit={false}
        startInLoadingState={true}
      />
    </Screen>
  )
}

export default Privacy
