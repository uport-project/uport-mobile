import React from 'react'
import { Share } from 'react-native'
import { Screen, Container, Text, TextTypes, Theme, ListItem, Section, Strings } from '@kancha'

import Avatar from 'uPortMobile/lib/components/shared/Avatar'


class Contact extends React.Component {
  static navigatorStyle = {
    largeTitle: false,
    navBarNoBorder: true,
    navBarBackgroundColor: Theme.colors.tertiary.background,
    navBarButtonColor: Theme.colors.primary.text,
    navBarTextColor: Theme.colors.primary.text,
  }

  render() {

    return (
      <Screen
        type={'primary'}
        expandingHeaderType={'tertiary'}
        expandingHeaderContent={
          <Container 
            justifyContent={'center'} 
            alignItems={'center'}>
            { /** 
               * Avatar to be refactored to not need style prop
               */ }
              <Avatar
                source={this.props.user.avatar}
                size={100}
                style={{ borderWidth: 2, borderColor: 'white' }}
              />
              <Container padding>
                <Text bold type={TextTypes.H1}>{this.props.user.name}</Text>
              </Container>
          </Container>
        }>
        <Section
          title={'Personal'}
          sectionTitleType={TextTypes.H3}
        >
          <ListItem
            last
            accessoryRight={Strings.abbreviate(this.props.user.address, 20)}> 
            uPort ID
          </ListItem>
        </Section>
      </Screen>
    )
  }

  /**
   * Share functionality is deprecated
   */
  showQShareDialog() {
    const url = `https://id.uport.me/req/${this.props.user.shareToken}`

    Share.share(
      {
        url,
        message: `${this.props.user.name}`,
        title: `Share contact`,
      },
      {
        dialogTitle: `Share contact`,
      },
    )
  }

  showQRCode() {
    const url = `https://id.uport.me/req/${this.props.user.shareToken}`

    this.props.navigator.showModal({
      screen: 'uport.QRCodeModal',
      passProps: {
        title: this.props.user.name,
        url,
        onClose: this.props.navigator.dismissModal,
      },
      navigatorStyle: {
        navBarHidden: true,
        screenBackgroundColor: 'white',
      },
    })
  }

  
}

export default Contact
