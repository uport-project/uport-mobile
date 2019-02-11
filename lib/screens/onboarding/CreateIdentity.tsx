import * as React from 'react'
import { Image, LayoutAnimation, Modal } from 'react-native'
import { connect } from 'react-redux'
import { Screen, Container, Input, NavBar, Text, Button, Theme, Icon, Images } from '@kancha'
import { Navigator } from 'react-native-navigation'

import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'
import { currentAddress } from '../../selectors/identities'
import { createIdentity } from 'uPortMobile/lib/actions/uportActions'
import { activationEvent } from 'uPortMobile/lib/actions/userActivationActions'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { startMain } from 'uPortMobile/lib/start'

interface CreateIdentityProps {
  navigator: Navigator
  createIdentity: () => void
  finishOnboarding: () => void
}

interface CreateIdentityState {
  valid: boolean
  name: string
  userAddingInfo: boolean
  userCreatingidentity: boolean
  identityCreationSuccess: boolean
  image: string | undefined
}

/**
 * This will be extracted to a new Avatar component
 */
interface AvatarProps {
  image: string | undefined
  text: string
}

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

class CreateIdentity extends React.Component<CreateIdentityProps, CreateIdentityState> {
  static navigatorStyle = {
    drawUnderNavBar: true,
    navBarTranslucent: true,
    navBarTransparent: true,
    navBarBackgroundColor: 'transparent',
    navBarButtonColor: Theme.colors.primary.brand,
  }

  constructor(props: CreateIdentityProps) {
    super(props)

    this.state = {
      valid: false,
      name: '',
      image: undefined,
      userAddingInfo: true,
      userCreatingidentity: false,
      identityCreationSuccess: false,
    }

    this.addImage = this.addImage.bind(this)
  }

  onChangeText = (text: string) => {
    this.setState({
      ...this.state,
      valid: !!text,
      name: text,
    })
  }

  /**
   * UI Render main Screen
   */
  render() {
    return (
      <Screen
        type={Screen.Types.Primary}
        config={Screen.Config.SafeScroll}
        statusBarHidden
        footerNavComponent={
          <Container paddingLeft paddingRight>
            <Button
              fullWidth
              buttonText={'Create Identity'}
              type={Button.Types.Primary}
              block={Button.Block.Filled}
              onPress={() => this.createIdentity()}
            />
          </Container>
        }
      >
        {this.renderUserAddingInfo()}
      </Screen>
    )
  }

  /**
   * UI Render states
   */
  renderUserAddingInfo() {
    return (
      <Container flex={1} justifyContent={'center'} alignItems={'center'}>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.userCreatingidentity || this.state.identityCreationSuccess}
        >
          {this.state.userCreatingidentity
            ? this.renderIdentityCreationLoading()
            : this.state.identityCreationSuccess
            ? this.renderIdentityCreationSuccess()
            : null}
        </Modal>
        <Container alignItems={'center'} paddingBottom paddingTop>
          <Text type={Text.Types.H2} bold>
            Personalise uport
          </Text>
          <Container paddingTop={5} paddingBottom>
            <Text type={Text.Types.SubTitle}>Add your name and optional photo</Text>
          </Container>
        </Container>
        <Container justifyContent={'center'} alignItems={'center'} paddingBottom>
          <Avatar image={this.state.image} text={this.state.name} />
          <Button
            buttonText={'Upload photo'}
            block={Button.Block.Clear}
            type={Button.Types.Primary}
            onPress={this.chooseProfileImage}
          />
        </Container>
        <Container flexDirection={'row'} w={280}>
          <Input
            placeholder={'Enter name or username'}
            textType={Text.Types.H4}
            value={this.state.name}
            onChangeText={this.onChangeText}
            valid={this.state.valid}
          />
        </Container>
        <Container padding>
          <Text type={Text.Types.SubTitle} textAlign={'center'}>
            You can always change this information later
          </Text>
        </Container>
      </Container>
    )
  }

  renderIdentityCreationLoading() {
    return (
      <Container flex={1} justifyContent={'center'} alignItems={'center'}>
        <Container alignItems={'center'} paddingBottom paddingTop>
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
        <Container alignItems={'center'} paddingBottom paddingTop>
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
            You have successfully created a uPort identity
          </Text>
        </Container>
        {/* <Container paddingTop w={320}>
          <Button
            fullWidth
            buttonText={'Continue'}
            type={Button.Types.Primary}
            block={Button.Block.Outlined}
            onPress={() => }
          />
        </Container> */}
      </Container>
    )
  }

  /**
   * Class methods
   */
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
    this.props.createIdentity()
    this.setState({ ...this.state, userAddingInfo: false, userCreatingidentity: true })

    setTimeout(() => {
      this.identityCreated()
      setTimeout(() => {
        this.props.finishOnboarding()
      }, 1600)
    }, 2000)
  }

  identityCreated() {
    this.setState({ ...this.state, userCreatingidentity: false, identityCreationSuccess: true })
  }
}

const mapStateToProps = (state: any) => {
  return {
    address: currentAddress(state),
  }
}

export const mapDispatchToProps = (dispatch: any) => {
  return {
    createIdentity: () => dispatch(createIdentity()),
    finishOnboarding: () => {
      startMain()
      dispatch(activationEvent('ONBOARDED'))
      dispatch(track('Onboarding Complete Finished'))
    },
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateIdentity)
