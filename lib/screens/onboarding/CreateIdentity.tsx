import * as React from 'react'
import { Image, Modal, KeyboardAvoidingView } from 'react-native'
import { ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import { Screen, Container, Input, Text, Button, Theme, Icon, Images, Checkbox, Section, ListItem } from '@kancha'
import { Navigation } from 'react-native-navigation'
import SCREENS from '../Screens'
import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'
import { currentAddress } from '../../selectors/identities'
import { activationEvent } from 'uPortMobile/lib/actions/userActivationActions'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { startMain } from 'uPortMobile/lib/start'
import { createIdentity, addClaims, addImage } from 'uPortMobile/lib/actions/uportActions'
import { registerDeviceForNotifications } from 'uPortMobile/lib/actions/snsRegistrationActions'

import TESTID from 'uPortMobile/lib/e2e/testIDs'

interface ImageObj {
  fileSize: number
  uri: string
}

interface CreateIdentityProps {
  componentId: string
  navigator: Navigator
  address: string

  //**Redux Actions */
  createIdentity: () => void
  finishOnboarding: () => void
  addImage: (address: string, claimType: string, image: ImageObj) => void
  storeOwnClaim: (address: string, claims: any) => void
  trackSegment: (event: any) => any
  registerDeviceForNotifications: () => void
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

const navOptions = {
  topBar: {
    background: {
      color: Theme.colors.primary.background,
    },
    backButton: { color: Theme.colors.primary.brand },
  },
}

const Avatar: React.FC<AvatarProps> = ({ image, text }) => {
  const avatar = image ? { uri: image } : Images.profile.avatar
  return <Image source={avatar} style={{ width: 150, height: 150, borderRadius: 75 }} resizeMode={'cover'} />
}

class CreateIdentity extends React.Component<CreateIdentityProps, CreateIdentityState> {
  static options(passProps: any) {
    return {
      ...navOptions,
    }
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

  componentDidMount() {
    this.props.trackSegment('Open')
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
          <Container alignItems={'center'}>
            <Container w={300}>
              <Button
                testID={TESTID.ONBOARDING_CREATE_IDENTITY}
                icon={
                  this.state.userCreatingidentity && <ActivityIndicator color={'white'} style={{ marginRight: 10 }} />
                }
                fullWidth
                disabled={!this.isValid() || this.state.userCreatingidentity || this.state.identityCreationSuccess}
                buttonText={this.state.userCreatingidentity ? 'Generating keys....' : 'Create Identity'}
                type={Button.Types.Primary}
                block={Button.Block.Filled}
                onPress={() => this.createIdentity()}
              />
            </Container>
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
      <Container disabled={this.state.userCreatingidentity || this.state.identityCreationSuccess}>
        <Container flex={1} justifyContent={'center'} alignItems={'center'}>
          <Modal
            onRequestClose={() => ''}
            animationType={'slide'}
            transparent={true}
            visible={this.state.identityCreationSuccess}
          >
            {this.renderIdentityCreationSuccess()}
          </Modal>

          <Container alignItems={'center'} paddingBottom paddingTop>
            <Text type={Text.Types.H2} bold>
              Personalize uPort
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
              testID={TESTID.ONBOARDING_NAME_INPUT}
              placeholder={'Enter name or username'}
              textType={Text.Types.H4}
              value={this.state.name}
              onChangeText={this.onChangeText}
              valid={!!this.state.name}
            />
          </Container>
          <Container padding>
            <Text type={Text.Types.SubTitle} textAlign={'center'}>
              You can always change this information later
            </Text>
          </Container>
        </Container>
        <Container>
          <Section>
            <ListItem
              avatarComponent={
                <Checkbox
                  testID={TESTID.ONBOARDING_TERMS_RADIO}
                  selected={this.state.termsAccepted}
                  toggleSelect={checked => this.setState({ termsAccepted: checked })}
                />
              }
              onPress={() =>
                Navigation.push(this.props.componentId, {
                  component: {
                    name: SCREENS.Terms,
                    options: navOptions,
                  },
                })
              }
            >
              Accept terms and conditions
            </ListItem>
            <ListItem
              last
              avatarComponent={
                <Checkbox
                  testID={TESTID.ONBOARDING_PRIVACY_RADIO}
                  selected={this.state.privacyAccepted}
                  toggleSelect={checked => this.setState({ privacyAccepted: checked })}
                />
              }
              onPress={() =>
                Navigation.push(this.props.componentId, {
                  component: {
                    name: SCREENS.Privacy,
                    options: navOptions,
                  },
                })
              }
            >
              Accept privacy policy
            </ListItem>
          </Section>
        </Container>
      </Container>
    )
  }

  /**
   * Todo - Create Modal component used below...
   */
  renderIdentityCreationSuccess() {
    return (
      <Container flex={1} justifyContent={'center'} alignItems={'center'} testID={TESTID.ONBOARDING_SUCCESS_MODAL}>
        <Container
          padding
          marginLeft
          marginRight
          background={'primary'}
          viewStyle={{ shadowRadius: 30, elevation: 4, shadowColor: 'black', shadowOpacity: 0.2, borderRadius: 5 }}
        >
          <Container alignItems={'center'} paddingBottom paddingTop>
            <Text type={Text.Types.H2} bold>
              You are all set!
            </Text>
            <Container paddingTop={5}>
              <Text type={Text.Types.SubTitle}>Identity created</Text>
            </Container>
          </Container>
          <Container justifyContent={'center'} alignItems={'center'}>
            <Icon name={'rocket'} size={150} color={Theme.colors.confirm.accessories} />
          </Container>
          <Container flexDirection={'row'} justifyContent={'center'}>
            <ActivityIndicator style={{ marginRight: 10 }} />
            <Text type={Text.Types.ListItem}>Preparing dashboard...</Text>
          </Container>

          <Container padding>
            <Text type={Text.Types.SubTitle} textAlign={'center'}>
              You have successfully created a uPort DID identity. Your private keys have been saved securely to your
              device
            </Text>
          </Container>
        </Container>
      </Container>
    )
  }

  /**
   * Class methods
   */
  addImage(response: any) {
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
         * Fire get started event
         */
        this.props.trackSegment('Get Started')

        /**
         * Onboarding complete
         */
        this.props.finishOnboarding()
      }, 2000)
    }, 2600)
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
      dispatch(activationEvent('ONBOARDED'))
      dispatch(track('Onboarding Complete Finished'))
      //**Start app after tracking events fire */
      startMain()
    },
    trackSegment: (event: any) => {
      dispatch(track(`Onboarding Complete ${event}`))
    },
    addImage: (address: string, claimType: string, image: any) => {
      dispatch(addImage(address, claimType, image))
    },
    storeOwnClaim: (address: string, claims: any) => {
      dispatch(addClaims(address, claims))
    },
    registerDeviceForNotifications: () => {
      dispatch(registerDeviceForNotifications())
    },
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateIdentity)
