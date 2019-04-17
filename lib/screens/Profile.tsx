import React from 'react'
import { connect } from 'react-redux'
import { TouchableOpacity, Share } from 'react-native'
import { Screen, Container, Text, Section, ListItem, Button, Theme, Icon } from '@kancha'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'

import { Navigator } from 'react-native-navigation'
import { wei2eth } from 'uPortMobile/lib/helpers/conversions'
import { currentAddress, ownClaims, myAccounts, allIdentities } from 'uPortMobile/lib/selectors/identities'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { editMyInfo, updateShareToken } from 'uPortMobile/lib/actions/myInfoActions'
import { addClaims, addImage, switchIdentity } from 'uPortMobile/lib/actions/uportActions'
import { onlyLatestAttestationsWithIssuer } from 'uPortMobile/lib/selectors/attestations'

import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'
import Mori from 'mori'

/**
 * User data fields (Self attested claims)
 */
const USER_FIELDS = ['name', 'email', 'country', 'phone', 'avatar']

interface EthereumAccountListItem {
  name: string
  network: string
  balance: string
  address: string
  accountProfile: any
  isLast: boolean
}

interface Identity {
  name: string
  address: string
  network: string
  isCurrent: boolean
}

interface SelfClaim {
  type: string
  name: string
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
  allIdentities: any[]
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

  render() {
    return (
      <Screen
        config={Screen.Config.Scroll}
        headerBackgroundColor={Theme.colors.primary.brand}
        expandingHeaderContent={this.renderHeader()}
      >
        {this.renderInfoBar()}
        {this.renderIdentitySwitcher()}
        {this.renderPersonalInformation()}
        {this.renderEthereumAccounts()}
      </Screen>
    )
  }

  renderHeader() {
    return (
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
            <Text textColor={Theme.colors.inverted.text}>Update avatar</Text>
          </TouchableOpacity>
        )}
        <Avatar
          source={this.props.avatar}
          size={150}
          style={{ borderWidth: 2, borderColor: Theme.colors.inverted.accessories }}
        />
        <Container padding flexDirection={'row'} alignItems={'center'}>
          <Text bold type={Text.Types.H2} textColor={Theme.colors.inverted.text}>
            {this.props.name}
          </Text>
        </Container>
      </Container>
    )
  }

  renderInfoBar() {
    return (
      <Container
        padding
        flexDirection={'row'}
        alignItems={'center'}
        flex={1}
        backgroundColor={Theme.colors.primary.background}
        dividerBottom
      >
        <Container flex={3} alignItems={'center'}>
          <Button
            block={Button.Block.Clear}
            onPress={() => this.props.navigator.switchToTab({ tabIndex: 0 })}
            buttonText={Mori.count(this.props.verifications)}
          />
          <Container paddingTop={5}>
            <Text type={Text.Types.ListItemNote}>Credentials</Text>
          </Container>
        </Container>
        <Container flex={3} alignItems={'center'}>
          <Button
            block={Button.Block.Clear}
            icon={<Icon name={'qrcode'} font={'fontawesome'} color={Theme.colors.primary.accessories} />}
            onPress={() => this.showQRCode()}
          />
          <Text type={Text.Types.ListItemNote}>QR Code</Text>
        </Container>
        <Container flex={3} alignItems={'center'}>
          <Button
            block={Button.Block.Clear}
            icon={<Icon name={'share'} color={Theme.colors.primary.accessories} />}
            onPress={() => this.showQShareDialog()}
          />
          <Text type={Text.Types.ListItemNote}>Share</Text>
        </Container>
      </Container>
    )
  }

  renderIdentitySwitcher() {
    return (
      this.props.allIdentities.length > 1 && (
        <Section title={'Identities'} sectionTitleType={Text.Types.SectionHeader}>
          {this.formattedIdentityList().map(({ name, address, network, isCurrent }: Identity, index: number) => {
            return (
              <ListItem
                disabled={this.state.editMode}
                hideForwardArrow
                selected={isCurrent}
                title={network}
                contentRight={address}
                key={address}
                onPress={() => this.switchIdentity(address)}
                last={index === 1}
              >
                {name}
              </ListItem>
            )
          })}
        </Section>
      )
    )
  }

  renderPersonalInformation() {
    return (
      <Section title={'Personal'} sectionTitleType={Text.Types.SectionHeader}>
        {this.selfAttestedClaims().map((item: SelfClaim, index: number) => {
          return (
            item.type !== 'avatar' && (
              <ListItem
                title={item.name}
                last={true} /** Remove divider */
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
    )
  }

  renderEthereumAccounts() {
    return (
      this.props.accounts.length > 0 && (
        <Section title={'Ethereum Accounts'} sectionTitleType={Text.Types.SectionHeader}>
          {this.formattedAccountList().map((account: EthereumAccountListItem, index: number) => {
            return (
              <ListItem
                title={account.network}
                key={account.address}
                contentRight={account.balance}
                last={account.isLast}
                onPress={() =>
                  this.props.navigator.push({
                    screen: 'screen.Account',
                    title: account.name,
                    passProps: {
                      address: account.address,
                      network: account.network,
                      accountProfile: account.accountProfile,
                    },
                    navigatorStyle: {
                      largeTitle: false,
                    },
                  })
                }
              >
                {account.name}
              </ListItem>
            )
          })}
        </Section>
      )
    )
  }

  /**
   * Check if identity matches /did:ethr/ (mainnet)
   */
  isMainIdentity(address: string) {
    return address.match(/did:ethr/)
  }

  /**
   * Update UI when user switches awy from a mainnet identity
   */
  switchIdentity(address: string) {
    if (!this.isMainIdentity(address)) {
      this.setLegacyModeButtons()
    } else {
      this.setDefaultButtons()
    }

    this.props.switchIdentity(address)
  }

  /**
   * Show QRCode of users profile for sharing
   */
  showQRCode() {
    const url = `https://id.uport.me/req/${this.props.shareToken}`

    this.props.navigator.showModal({
      screen: 'uport.QRCodeModal',
      passProps: {
        title: this.props.name,
        url,
        onClose: this.props.navigator.dismissModal,
      },
      navigatorStyle: {
        navBarHidden: true,
        screenBackgroundColor: 'white',
      },
    })
  }

  /**
   * Show share dialog
   */
  showQShareDialog() {
    this.props.updateShareToken(this.props.address)
    const url = `https://id.uport.me/req/${this.props.shareToken}`

    Share.share(
      {
        url,
        title: `Share contact`,
        message: `${this.props.name} would like you to add them as a contact`,
      },
      {
        dialogTitle: `Share contact`,
      },
    )
  }

  /**
   * Formatting account list
   */
  formattedAccountList(): EthereumAccountListItem[] {
    return this.props.accounts.map(
      (account: any, index: number): EthereumAccountListItem => {
        const accountProfile = account.clientId ? this.props.accountProfileLookup(account.clientId) : null
        const networkName = account.network.charAt(0).toUpperCase() + account.network.slice(1).toLowerCase()
        return {
          name: accountProfile ? accountProfile.name : 'Ethereum Account',
          network: networkName,
          balance: account.balance && account.balance.ethBalance && `${wei2eth(account.balance.ethBalance)} ETH`,
          address: account.address,
          accountProfile,
          isLast: this.props.accounts.length === index + 1,
        }
      },
    )
  }

  /**
   * Formatting list of identities
   */
  formattedIdentityList(): Identity[] {
    return this.props.allIdentities
      .map(
        ({ address, network }): Identity => {
          return {
            name: `${address.match(/did:ethr:/) ? 'Primary' : 'Legacy'}`,
            address,
            network: `${network.charAt(0).toUpperCase() + network.slice(1)}`,
            isCurrent: address === this.props.address,
          }
        },
      )
      .reverse()
  }

  /**
   * Formatting personal info
   */
  selfAttestedClaims(): SelfClaim[] {
    return USER_FIELDS.map(
      (item: string): SelfClaim => {
        return {
          type: item,
          name: item.charAt(0).toUpperCase() + item.slice(1),
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
    this.setDefaultNavigationBar()

    this.props.updateShareToken(this.props.address)
  }

  /**
   * Set default navigation
   */
  setDefaultNavigationBar() {
    this.props.navigator.setStyle({
      ...Theme.navigation,
      navBarNoBorder: true,
      navBarTextColor: Theme.colors.inverted.text,
      navBarButtonColor: Theme.colors.inverted.text,
    })
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

  setLegacyModeButtons() {
    this.props.navigator.setButtons({
      rightButtons: [],
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
    verifications: onlyLatestAttestationsWithIssuer(state),
    allIdentities: Mori.toJs(allIdentities(state)),
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
