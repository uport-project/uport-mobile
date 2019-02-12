import * as React from 'react'
import { Image, LayoutAnimation, Modal } from 'react-native'
import { connect } from 'react-redux'
import { Screen, Container, Input, Text, Button, Theme, Icon, Images, Checkbox } from '@kancha'
import { Navigator } from 'react-native-navigation'

import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'
import { currentAddress } from '../../selectors/identities'
import { activationEvent } from 'uPortMobile/lib/actions/userActivationActions'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { startMain } from 'uPortMobile/lib/start'
import { createIdentity, addClaims, addImage } from 'uPortMobile/lib/actions/uportActions'

interface ImageObj {
  fileSize: number
  uri: string
}

interface CreateIdentityProps {
  navigator: Navigator
  createIdentity: () => void
  finishOnboarding: () => void
  addImage: (address: string, claimType: string, image: ImageObj) => void
  storeOwnClaim: (address: string, claims: any) => void
  address: string
}

interface CreateIdentityState {
  valid: boolean
  name: string
  termsAccepted: boolean
  privacyAccepted: boolean
  userAddingInfo: boolean
  userCreatingidentity: boolean
  identityCreationSuccess: boolean
  image: ImageObj | undefined
}

/**
 * This will be extracted to a new Avatar component
 */
interface AvatarProps {
  image: string | undefined
  text: string
}

const Avatar: React.FC<AvatarProps> = ({ image, text }) => {
  const avatar = image ? { uri: image } : Images.profile.avatar
  return <Image source={avatar} style={{ width: 150, height: 150, borderRadius: 75 }} resizeMode={'cover'} />
}

class CreateIdentity extends React.Component<CreateIdentityProps, CreateIdentityState> {
  static navigatorStyle = {
    navBarBackgroundColor: Theme.colors.primary.background,
    navBarButtonColor: Theme.colors.primary.brand,
  }

  constructor(props: CreateIdentityProps) {
    super(props)

    this.state = {
      valid: false,
      name: '',
      termsAccepted: false,
      privacyAccepted: false,
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
      name: text,
    })
  }

  isValid() {
    const { name, termsAccepted, privacyAccepted } = this.state
    return name && termsAccepted && privacyAccepted
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
              disabled={!this.isValid()}
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
      <Container>
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
            <Avatar image={this.state.image && this.state.image.uri} text={this.state.name} />
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
        <Container>
          <Container flexDirection={'row'} alignItems={'center'} justifyContent={'flex-start'}>
            <Checkbox
              selected={this.state.termsAccepted}
              toggleSelect={checked => this.setState({ termsAccepted: checked })}
            />
            <Button
              noPadding
              block={Button.Block.Clear}
              buttonText={'I accept the terms and conditions'}
              onPress={() => this.props.navigator.push({ screen: 'onboarding2.Terms' })}
            />
          </Container>
          <Container flexDirection={'row'} alignItems={'center'} justifyContent={'flex-start'}>
            <Checkbox
              selected={this.state.privacyAccepted}
              toggleSelect={checked => this.setState({ privacyAccepted: checked })}
            />
            <Button
              noPadding
              block={Button.Block.Clear}
              buttonText={'I accept the privacy policy'}
              onPress={() => this.props.navigator.push({ screen: 'onboarding2.Privacy' })}
            />
          </Container>
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
      </Container>
    )
  }

  /**
   * Class methods
   */
  addImage(response: any) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    this.setState({
      image: response.avatar,
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
    this.setState({ ...this.state, userAddingInfo: false, userCreatingidentity: true })

    /**
     * Create identity
     */
    this.props.createIdentity()

    setTimeout(() => {
      this.showIdentityCreationStatus(this.props.address)

      setTimeout(() => {
        /**
         * Update the user profile with onboarding user data
         */
        if (this.props.address) {
          this.state.image && this.props.addImage(this.props.address, 'avatar', this.state.image)
          this.state.name && this.props.storeOwnClaim(this.props.address, { name: this.state.name })
        }

        /**
         * Onboarding complete
         */
        this.props.finishOnboarding()
      }, 1600)
    }, 2000)
  }

  showIdentityCreationStatus(address: string) {
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
    addImage: (address: string, claimType: string, image: any) => {
      dispatch(addImage(address, claimType, image))
    },
    storeOwnClaim: (address: string, claims: any) => {
      dispatch(addClaims(address, claims))
    },
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateIdentity)
