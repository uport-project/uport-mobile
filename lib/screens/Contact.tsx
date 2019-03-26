import React from 'react'
import { Share } from 'react-native'
import { Navigator } from 'react-native-navigation'
import { Screen, Container, Text, Theme, ListItem, Section, Strings } from '@kancha'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'

interface User {
  name: string
  avatar: any
  address: string
  shareToken: string
}

interface ContactProps {
  navigator: Navigator
  user: User
}

class Contact extends React.Component<ContactProps> {
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
        headerBackgroundColor={Theme.colors.tertiary.background}
        expandingHeaderContent={
          <Container justifyContent={'center'} alignItems={'center'}>
            <Avatar source={this.props.user.avatar} size={100} style={{ borderWidth: 2, borderColor: 'white' }} />
            <Container padding>
              <Text bold type={Text.Types.H1}>
                {this.props.user.name}
              </Text>
            </Container>
          </Container>
        }
      >
        <Section title={'Personal'} sectionTitleType={Text.Types.H3}>
          <ListItem last accessoryRight={Strings.abbreviate(this.props.user.address, 20)}>
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
