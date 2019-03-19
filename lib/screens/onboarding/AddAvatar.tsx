import * as React from 'react'
import { Image, LayoutAnimation } from 'react-native'
import { Screen, Container, NavBar, Text, Theme, Icon, Images, Button } from '@kancha'
import { Navigator } from 'react-native-navigation'
import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'

interface AddAvatarProps {
  navigator: Navigator
  name: string
}

interface AddAvatarState {
  addAvatar: boolean
  creatingidentity: boolean
  identityCreationSuccess: boolean
  image: string | undefined
}

interface AvatarProps {
  image: string | undefined
  text: string
}

/**
 * This will be extracted to a new Avatar component
 */
const Avatar: React.FC<AvatarProps> = ({ image, text }) => {
  return image ? (
    <Image source={{ uri: image }} style={{ width: 150, height: 150, borderRadius: 75 }} resizeMode={'cover'} />
  ) : (
    <Container
      backgroundColor={Theme.colors.primary.brand}
      br={75}
      h={150}
      w={150}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Text type={Text.Types.H1} bold textColor={Theme.colors.custom.text}>
        {text.slice(0, 1).toUpperCase() + text.slice(1, 2).toLowerCase()}
      </Text>
    </Container>
  )
}

class AddAvatar extends React.Component<AddAvatarProps, AddAvatarState> {
  static navigatorStyle = {
    navBarHidden: true,
  }

  constructor(props: AddAvatarProps) {
    super(props)

    this.state = {
      addAvatar: true,
      creatingidentity: false,
      identityCreationSuccess: false,
      image: undefined,
    }

    this.addImage = this.addImage.bind(this)
  }

  render() {
    return (
      <Screen
        type={Screen.Types.Primary}
        config={Screen.Config.SafeNoScroll}
        statusBarHidden
        footerNavComponent={
          this.state.addAvatar && (
            <NavBar
              leftButtonAction={() => this.props.navigator.pop()}
              rightButtonAction={() => this.createIdentity()}
              rightButttonText={'Create'}
            />
          )
        }
      >
        {this.state.addAvatar
          ? this.renderAddAvatar()
          : this.state.creatingidentity
          ? this.renderIdentityCreationLoading()
          : this.renderIdentityCreationSuccess()}
      </Screen>
    )
  }

  addImage(response: any) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    this.setState({
      image: response.avatar.uri,
    })
  }

  chooseProfileImage = () => {
    photoSelectionHandler({
      cameraStatus: '',
      photoStatus: '',
      segmentId: '',
      addFn: this.addImage,
    })
  }

  createIdentity() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    this.setState({ ...this.state, addAvatar: false, creatingidentity: true })

    setTimeout(() => {
      this.identityCreated()
    }, 3000)
  }

  identityCreated() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    this.setState({ ...this.state, creatingidentity: false, identityCreationSuccess: true })
  }

  renderIdentityCreationLoading() {
    return (
      <Container flex={1} justifyContent={'center'} alignItems={'center'}>
        <Container alignItems={'center'} paddingBottom>
          <Text type={Text.Types.H2} bold>
            Creating identity
          </Text>
          <Container paddingTop={5}>
            <Text type={Text.Types.SubTitle}>Generating private keys...</Text>
          </Container>
        </Container>
        <Container justifyContent={'center'} alignItems={'center'}>
          <Icon name={'loading'} animated size={150} image={Images.icons.loading} />
        </Container>
        <Container padding>
          <Text type={Text.Types.SubTitle} textAlign={'center'}>
            Your keys are being generated. One moment...
          </Text>
        </Container>
      </Container>
    )
  }
  renderIdentityCreationSuccess() {
    return (
      <Container flex={1} justifyContent={'center'} alignItems={'center'}>
        <Container alignItems={'center'} paddingBottom>
          <Text type={Text.Types.H2} bold>
            Identity Created!
          </Text>
          <Container paddingTop={5}>
            <Text type={Text.Types.SubTitle}>Succesfully created identity</Text>
          </Container>
        </Container>
        <Container justifyContent={'center'} alignItems={'center'}>
          <Icon name={'success'} size={150} color={Theme.colors.confirm.accessories} />
        </Container>
        <Container padding>
          <Text type={Text.Types.SubTitle} textAlign={'center'}>
            Congrats! You have successfully created a uPort identity. --- Here we can delay for 1600ms before
            redirecting to main app ----
          </Text>
        </Container>
      </Container>
    )
  }

  renderAddAvatar() {
    return (
      <Container flex={1} justifyContent={'center'} alignItems={'center'}>
        <Container alignItems={'center'} paddingBottom>
          <Text type={Text.Types.H2} bold>
            Choose profile photo
          </Text>
          <Container paddingTop={5}>
            <Text type={Text.Types.SubTitle}>Optional</Text>
          </Container>
        </Container>
        <Container justifyContent={'center'} alignItems={'center'}>
          <Avatar image={this.state.image} text={this.props.name} />
          <Button
            buttonText={'Upload photo'}
            block={Button.Block.Clear}
            type={Button.Types.Primary}
            onPress={this.chooseProfileImage}
          />
        </Container>
        <Container padding>
          <Text type={Text.Types.SubTitle} textAlign={'center'}>
            Your profile image will not be shared with us or any other party until you choose to do so. You can change
            this image at anytime.
          </Text>
        </Container>
      </Container>
    )
  }
}

export default AddAvatar
