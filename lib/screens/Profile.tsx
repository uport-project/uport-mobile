import React from 'react'
import { connect } from 'react-redux'
import { Navigator } from 'react-native-navigation'
import { Screen, Container, Text, Section, ListItem, Button, Theme } from '@kancha'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { currentAddress, ownClaims, myAccounts, otherIdentities } from 'uPortMobile/lib/selectors/identities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { editMyInfo, updateShareToken } from 'uPortMobile/lib/actions/myInfoActions'
import { addClaims, addImage, switchIdentity } from 'uPortMobile/lib/actions/uportActions'
import { onlyPendingAndLatestAttestations } from 'uPortMobile/lib/selectors/attestations'
import Mori from 'mori'

/**
 * Temp hardcoded user data fields
 */
const USER_FIELDS = ['name', 'email', 'country', 'phone', 'avatar']

interface UserProfileProps {
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
  updateShareToken: (address: string) => any
  accountProfileLookup: (clientId: string) => any
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
  }

  render() {
    return (
      <Screen
        config={Screen.Config.Scroll}
        type={'primary'}
        expandingHeaderType={'custom'}
        expandingHeaderContent={
          <Container justifyContent={'center'} alignItems={'center'} paddingTop>
            <Avatar source={this.props.avatar} size={150} style={{ borderWidth: 2, borderColor: 'white' }} />
            <Container padding>
              <Text bold type={Text.Types.H2} textColor={'#FFFFFF'}>
                {this.props.name}
              </Text>
            </Container>
          </Container>
        }
      >
        <Section title={'Personal'} sectionTitleType={Text.Types.H3}>
          <ListItem>uPort ID</ListItem>
          <ListItem>uPort ID</ListItem>
          <ListItem>uPort ID</ListItem>
          <ListItem>uPort ID</ListItem>
          <ListItem>uPort ID</ListItem>
          <ListItem last>uPort ID</ListItem>
        </Section>
      </Screen>
    )
  }

  /**
   * Update share token
   */
  componentDidMount() {
    this.props.updateShareToken(this.props.address)
  }

  /**
   * Seettig the edit buttons
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
