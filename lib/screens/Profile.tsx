import React from 'react'
import { connect } from 'react-redux'
import { TouchableOpacity, Alert } from 'react-native'
import { Navigator } from 'react-native-navigation'
import { Screen, Container, Text, Section, ListItem, Button, Theme, Icon } from '@kancha'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { currentAddress, ownClaims, myAccounts, otherIdentities } from 'uPortMobile/lib/selectors/identities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { editMyInfo, updateShareToken } from 'uPortMobile/lib/actions/myInfoActions'
import { addClaims, addImage, switchIdentity } from 'uPortMobile/lib/actions/uportActions'
import { onlyPendingAndLatestAttestations } from 'uPortMobile/lib/selectors/attestations'

import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'
import Mori from 'mori'

/**
 * User data fields (Self attested claims)
 */
const USER_FIELDS = ['name', 'email', 'country', 'phone', 'avatar']

interface SelfClaim {
  type: string
  value: string | undefined
}

interface UserProfileProps {
  [index: string]: any
  navigator: Navigator
  avatar: any
  name: string
  email: string
  country: string
  phone: string
  userData: any
  address: string
  shareToken: string
  verifications: any
  others: string
  accounts: any

  /**
   * Redux actions
   */
  updateShareToken: (address: string) => any
  accountProfileLookup: (clientId: string) => any
  storeOwnClaim: (address: string, claims: any) => void
  editMyInfo: (change: any) => void
  addImage: (address: string, claimType: string, image: any) => void
  switchIdentity: (address: string) => void
}

interface UserProfileState {
  editMode: boolean
}

class UserProfile extends React.Component<UserProfileProps, UserProfileState> {
  static navigatorStyle = {
    ...Theme.navigation,
    navBarNoBorder: true,
  }
  constructor(props: UserProfileProps) {
    super(props)

    this.state = {
      editMode: false,
    }

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    this.photoSelection = this.photoSelection.bind(this)
  }

  onNavigatorEvent(event: any) {
    // this is the onPress handler for the two buttons together
    if (event.type === 'NavBarButtonPress') {
      // this is the event type for button presses
      if (event.id === 'edit') {
        // this is the same id field from the static navigatorButtons definition
        this.setState({ editMode: true })
        this.setEditModeButtons()
      }
      if (event.id === 'save') {
        this.handleSubmit()
        this.setState({ editMode: false })
        this.setDefaultButtons()
      }
      if (event.id === 'cancel') {
        this.setState({ editMode: false })
        this.setDefaultButtons()
        this.handleCancel()
      }
      if (event.id === 'share') {
        // this.openShareModal()
      }
      if (event.id === 'send') {
        // this.showModal()
      }
    }
  }

  showSwitchModal() {
    Alert.alert(
      'Switch Identity',
      'Switching identities will allow you to view your old testnet identity and the data associated with it.',
      [
        { text: 'Switch', onPress: () => this.props.switchIdentity('') },
        {
          text: 'Cancel',
          // tslint:disable-next-line:no-console
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
    )
  }

  render() {
    return (
      <Screen
        config={Screen.Config.Scroll}
        type={'primary'}
        expandingHeaderType={'custom'}
        expandingHeaderContent={
          <Container justifyContent={'center'} alignItems={'center'} paddingTop>
            {this.state.editMode && (
              <TouchableOpacity
                onPress={this.photoSelection}
                style={{
                  position: 'absolute',
                  top: 20,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  zIndex: 1,
                  borderRadius: 8,
                  padding: 5,
                }}
              >
                <Text textColor={'#FFFFFF'}>Update avatar</Text>
              </TouchableOpacity>
            )}
            <Avatar source={this.props.avatar} size={150} style={{ borderWidth: 2, borderColor: 'white' }} />

            <Container padding flexDirection={'row'}>
              <Container alignItems={'center'} flex={1}>
                <TouchableOpacity onPress={!this.state.editMode ? this.showSwitchModal : () => null}>
                  <Container flexDirection={'row'} alignItems={'center'}>
                    <Text bold type={Text.Types.H2} textColor={'#FFFFFF'}>
                      {this.props.name}
                    </Text>
                  </Container>
                </TouchableOpacity>
                <Text textColor={'#FFFFFF'}>Legacy testnet identity</Text>
              </Container>
            </Container>
          </Container>
        }
      >
        <Section title={'Personal'} sectionTitleType={Text.Types.H3}>
          {this.selfAttestedClaims().map((item: SelfClaim, index: number) => {
            return (
              item.type !== 'avatar' && (
                <ListItem
                  title={item.type.toUpperCase()}
                  last={index === 3}
                  key={item.type}
                  editMode={this.state.editMode}
                  updateItem={(value: string) => this.handleChange({ [item.type]: value })}
                >
                  {item.value}
                </ListItem>
              )
            )
          })}
        </Section>
      </Screen>
    )
  }

  selfAttestedClaims() {
    return USER_FIELDS.map(
      (item: string): SelfClaim => {
        return {
          type: item,
          value: this.props[item],
        }
      },
    )
  }

  /**
   * Update share token
   */
  componentDidMount() {
    this.setDefaultButtons()

    this.props.updateShareToken(this.props.address)
  }

  /**
   * Setttig the edit buttons
   */
  setEditModeButtons() {
    this.props.navigator.setButtons({
      rightButtons: [
        {
          title: 'Save',
          id: 'save',
        },
        {
          title: 'Cancel',
          id: 'cancel',
        },
      ],
    })
  }

  setDefaultButtons() {
    this.props.navigator.setButtons({
      rightButtons: [
        {
          title: 'Edit',
          id: 'edit',
        },
      ],
    })
  }

  /**
   * Using the old methods here. These will be cleaned up next
   */
  photoSelection() {
    photoSelectionHandler({
      cameraStatus: null,
      photoStatus: null,
      segmentId: '',
      addFn: this.props.editMyInfo,
    })
  }

  handleChange(change: any) {
    this.props.editMyInfo(change)
  }

  handleCancel() {
    const change: { [index: string]: any } = {}
    USER_FIELDS.map(attr => {
      change[attr] = this.props.userData[attr]
    })
    this.props.editMyInfo(change)
    this.setState({ editMode: false })
  }

  changed() {
    const change: { [index: string]: any } = {}
    USER_FIELDS.map(attr => {
      if (this.props[attr] !== this.props.userData[attr]) {
        change[attr] = this.props[attr]
      }
    })
    return change
  }

  handleSubmit() {
    const change = this.changed()
    // tslint:disable-next-line:no-string-literal
    delete change['avatar']
    if (Object.keys(change).length > 0) {
      this.props.storeOwnClaim(this.props.address, change)
    }
    if (this.props.avatar && this.props.avatar.data) {
      this.props.addImage(this.props.address, 'avatar', this.props.avatar)
    }
    this.props.updateShareToken(this.props.address)
  }
}

const mapStateToProps = (state: any, ownProps: any) => {
  const userData = Mori.toJs(ownClaims(state)) || {}
  return {
    ...ownProps,
    avatar: typeof state.myInfo.changed.avatar !== 'undefined' ? state.myInfo.changed.avatar : userData.avatar,
    name: typeof state.myInfo.changed.name !== 'undefined' ? state.myInfo.changed.name : userData.name,
    email: typeof state.myInfo.changed.email !== 'undefined' ? state.myInfo.changed.email : userData.email,
    country: typeof state.myInfo.changed.country !== 'undefined' ? state.myInfo.changed.country : userData.country,
    phone: typeof state.myInfo.changed.phone !== 'undefined' ? state.myInfo.changed.phone : userData.phone,
    userData,
    address: currentAddress(state),
    shareToken: state.myInfo.shareToken,
    verifications: onlyPendingAndLatestAttestations(state),
    others: otherIdentities(state),
    accounts: myAccounts(state),
    accountProfileLookup: (clientId: string) => Mori.toJs(externalProfile(state, clientId)),
  }
}
export const mapDispatchToProps = (dispatch: any) => {
  return {
    storeOwnClaim: (address: string, claims: any) => {
      dispatch(addClaims(address, claims))
    },
    editMyInfo: (change: any) => {
      dispatch(editMyInfo(change))
    },
    addImage: (address: string, claimType: string, image: any) => {
      dispatch(addImage(address, claimType, image))
    },
    updateShareToken: (address: string) => {
      dispatch(updateShareToken(address))
    },
    switchIdentity: (address: string) => {
      dispatch(switchIdentity(address))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserProfile)
