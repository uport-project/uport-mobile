import React from 'react'
import {
  Platform,
  FlatList,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Text,
  TextInput,
  Share,
} from 'react-native'
import { toJs, count } from 'mori'
import moment from 'moment'
import { connect } from 'react-redux'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { currentAddress, ownClaims, myAccounts } from 'uPortMobile/lib/selectors/identities'
import { wei2eth } from 'uPortMobile/lib/helpers/conversions'
import { externalProfile } from 'uPortMobile/lib/selectors/requests'
import { parseClaimItem } from 'uPortMobile/lib/utilities/parseClaims'
import { editMyInfo, updateShareToken } from 'uPortMobile/lib/actions/myInfoActions'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FeatherIcon from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { addClaims, addImage } from 'uPortMobile/lib/actions/uportActions'
import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'
import { onlyPendingAndLatestAttestations } from 'uPortMobile/lib/selectors/attestations'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'

const USER_FIELDS = ['name', 'email', 'country', 'phone', 'avatar']
const { height, width } = Dimensions.get('window')
const isIos = Platform.OS === 'ios'
const SPACER_SIZE = 1000
const TOP_COLOR = colors.brand
const BOTTOM_COLOR = 'white'

class User extends React.Component {
  static navigatorStyle = {
    largeTitle: true,
    navBarNoBorder: true,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  constructor(props) {
    super(props)

    this.state = {
      editMode: false,
    }

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    this.photoSelection = this.photoSelection.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.renderListItem = this.renderListItem.bind(this)
  }

  componentDidMount() {
    this.setDefaultButtons()
    this.props.updateShareToken(this.props.address)
  }

  async setDefaultButtons() {
    const send = await Ionicons.getImageSource('ios-paper-plane', 26, '#FFFFFF')
    const edit = await FeatherIcon.getImageSource('edit', 26, '#FFFFFF')
    const share = await FeatherIcon.getImageSource('share', 26, '#FFFFFF')

    this.props.navigator.setButtons({
      rightButtons: [
        {
          id: 'edit',
          title: 'Edit',
        },
      ],
    })
  }

  render() {
    const personalClaims = this.getPersonlClaims()

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: BOTTOM_COLOR }}
          contentContainerStyle={{ backgroundColor: TOP_COLOR }}
          contentInset={{ top: -SPACER_SIZE }}
          contentOffset={{ y: SPACER_SIZE }}
        >
          {isIos && <View style={{ height: SPACER_SIZE }} />}

          <View
            style={{
              backgroundColor: colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
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
                <Text style={{ color: 'white' }}>Update avatar</Text>
              </TouchableOpacity>
            )}
            <Avatar source={this.props.avatar} size={100} />
            <Text style={styles.bannerTitle}>{this.props.name}</Text>
          </View>

          <View
            style={{
              backgroundColor: '#EAEAEA',
              flexDirection: 'row',
              flex: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => this.props.navigator.switchToTab({ tabIndex: 0 })}
              style={{ alignItems: 'center', flex: 1, paddingVertical: 15 }}
            >
              <Text style={{ fontSize: 28, color: colors.grey74 }}>{count(this.props.verifications)}</Text>
              <Text style={{ color: colors.grey155 }}>Credentials</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.showQRCode()}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                paddingVertical: 15,
                flexDirection: 'row',
              }}
            >
              <AntDesign size={30} name='qrcode' color={colors.brand} />
              {/* <Text style={{fontSize: 20, paddingLeft: 10, color: colors.brand}}>Share QR</Text> */}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.showQShareDialog()}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                paddingVertical: 15,
                flexDirection: 'row',
              }}
            >
              <FeatherIcon size={30} name='share' color={colors.brand} />
              {/* <Text style={{fontSize: 20, paddingLeft: 10, color: colors.brand}}>Share Link</Text> */}
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: BOTTOM_COLOR }}>
            <View style={{ marginHorizontal: 10 }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: '#CCCCCC',
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333333' }}>Personal</Text>
              </View>

              {personalClaims.map(claim => {
                return this.renderPersonalClaim(claim)
              })}
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: '#CCCCCC',
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333333' }}>Accounts</Text>
              </View>
              {this.renderAccountsList()}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

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

  photoSelection() {
    photoSelectionHandler({
      cameraStatus: this.props.cameraStatus,
      photoStatus: this.props.photoStatus,
      segmentId: this.props.segmentId,
      addFn: this.props.editMyInfo,
    })
  }

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

  onNavigatorEvent(event) {
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
        this.openShareModal()
      }
      if (event.id === 'send') {
        this.showModal()
      }
    }
  }

  getPersonlClaims() {
    /**
     * Stubbing out this so it still has some functionlity
     *
     * */
    return [
      {
        type: 'name',
        value: this.props.name,
      },
      {
        type: 'email',
        value: this.props.email,
      },
      {
        type: 'phone',
        value: this.props.phone,
      },
      {
        type: 'country',
        value: this.props.country,
      },
    ]
  }

  openShareModal() {
    this.props.navigator.showModal({
      screen: 'screen.ShareContact',
      title: 'Share',
      passProps: {
        /**
         * Just hack these to have a random ID so we can toggle them on and off.
         **/
        verifications: this.props.verifications.map(item => {
          const { claimTypeHeader, claimSubject, claimTypeTitle } = parseClaimItem(item)
          return {
            id:
              Math.random()
                .toString(36)
                .substring(2, 15) +
              Math.random()
                .toString(36)
                .substring(2, 15),
            type: claimTypeTitle,
            value: claimSubject,
          }
        }),
        userData: this.getPersonlClaims().map(claim => {
          return {
            ...claim,
            id:
              Math.random()
                .toString(36)
                .substring(2, 15) +
              Math.random()
                .toString(36)
                .substring(2, 15),
          }
        }),
      },
    })
  }

  handleChange(change) {
    this.props.editMyInfo(change)
  }

  handleCancel() {
    const change = {}
    USER_FIELDS.map(attr => {
      change[attr] = this.props.userData[attr]
    })
    this.props.editMyInfo(change)
    this.setState({ editing: false })
  }

  changed() {
    const change = {}
    USER_FIELDS.map(attr => {
      if (this.props[attr] !== this.props.userData[attr]) {
        change[attr] = this.props[attr]
      }
    })
    return change
  }

  renderListItem({ item, index }) {
    const { claimTypeHeader, claimTypeTitle, claimSubject } = parseClaimItem(item)

    return (
      <TouchableHighlight
        underlayColor='#EAEAEA'
        key={`${item.token}-${index}`}
        onPress={() =>
          this.state.editMode
            ? {}
            : this.props.navigator.push({
                screen: 'screen.Credential',
                passProps: { verification: item, claimType: claimTypeHeader },
              })
        }
        style={{}}
      >
        <View style={styles.infoRowContainer}>
          <View style={styles.infoRow}>
            {this.state.editMode && (
              <TouchableOpacity style={{ paddingLeft: 10, paddingRight: 20 }}>
                <FeatherIcon size={20} name='minus-circle' color='red' />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>{claimTypeTitle}</Text>
              <Text style={styles.infoContent}>{claimSubject || 'Multiple items...'}</Text>
            </View>
            {!this.state.editMode && <FeatherIcon size={20} name='chevron-right' />}
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  renderPersonalClaim(claim) {
    return (
      <View key={claim.type} style={styles.infoRowContainer}>
        <View style={styles.infoRow}>
          {this.state.editMode && (
            <TouchableOpacity style={{ paddingLeft: 10, paddingRight: 20 }}>
              <FeatherIcon size={20} name='minus-circle' color='red' />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>{claim.type.toUpperCase()}</Text>
            {this.state.editMode ? (
              <TextInput
                placeholder={`Enter ${claim.type}`}
                style={styles.infoContent}
                value={claim.value}
                onChangeText={value => this.handleChange({ [claim.type]: value })}
              />
            ) : claim.value ? (
              <Text style={styles.infoContent}>{claim.value}</Text>
            ) : (
              <Text style={[styles.infoContent, { color: '#999' }]}>{`None provided`}</Text>
            )}
          </View>
        </View>
      </View>
    )
  }

  handleSubmit() {
    const change = this.changed()
    delete change['avatar']
    if (Object.keys(change).length > 0) {
      this.props.storeOwnClaim(this.props.address, change)
    }
    if (this.props.avatar && this.props.avatar.data) {
      this.props.addImage(this.props.address, 'avatar', this.props.avatar)
    }
    this.props.updateShareToken(this.props.address)
  }

  expirationItem(exp) {
    let expirationDate = exp && exp >= 1000000000000 ? moment.unix(Math.floor(exp / 1000)) : moment.unix(exp)

    return expirationDate.isValid() ? moment(expirationDate).format('LLL') : 'No Expiration'
  }

  renderAccountItem({ item }) {
    const accountProfile = item.clientId ? this.props.accountProfileLookup(item.clientId) : null
    const networkName = item.network.charAt(0).toUpperCase() + item.network.slice(1).toLowerCase()
    return (
      <TouchableHighlight
        underlayColor='#EAEAEA'
        onPress={() =>
          this.props.navigator.push({
            screen: 'screen.Account',
            largeTitle: false,
            title: accountProfile ? accountProfile.name : 'Ethereum',
            subTitle: networkName,
            passProps: {
              address: item.address,
              network: networkName,
              accountProfile: accountProfile,
            },
          })
        }
        style={{}}
      >
        <View style={styles.infoRowContainer}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoContent, { color: colors.grey74 }]}>
                {accountProfile ? accountProfile.name : 'Ethereum Account'}
              </Text>
              <Text style={styles.infoDecoration}>{networkName} network</Text>
            </View>
            <Text style={styles.infoDecoration}>{item.balance && `${wei2eth(item.balance.ethBalance)} ETH`}</Text>
            <FeatherIcon size={26} name='chevron-right' color={colors.grey130} />
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  renderAccountsList() {
    return (
      <FlatList
        contentContainerStyle={styles.container}
        data={this.props.accounts}
        renderItem={this.renderAccountItem.bind(this)}
        keyExtractor={item => item.address}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerTop: {
    backgroundColor: colors.brand,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    height: height / 3,
  },
  editButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 150,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  titleText: {
    // fontFamily: 'Montserrat',
    fontSize: 25,
    color: '#333333',
    paddingBottom: 5,
  },
  subtitleText: {
    color: '#AAAAAA',
    paddingBottom: 5,
  },
  bannerTitle: {
    padding: 15,
    // fontFamily: 'Montserrat',
    fontSize: 30,
    color: '#FFFFFF',
    width: '100%',
    textAlign: 'center',
  },
  bannerTitleEdit: {
    color: '#333333',
  },
  titleWrapper: {
    width: '100%',
    marginBottom: 5,
  },
  titleWrapperEdit: {
    backgroundColor: 'rgba(255, 250, 236, 0.7)',
  },
  bannerSubTitle: {
    paddingLeft: 15,
    paddingBottom: 15,
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#FFFFFF',
  },
  buttonRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#AAAAAA',
    flexDirection: 'row',
  },
  buttonContainer: {
    flex: 1,
  },
  infoRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flex: 1,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#AAAAAA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 10,
    paddingLeft: 10,
  },
  infoTitle: {
    color: '#AAAAAA',
    fontSize: 11,
  },
  infoContent: {
    color: colors.brand,
    fontSize: 16,
    paddingVertical: 5,
  },
  infoContentEdit: {
    backgroundColor: '#FFFAEC',
  },
  infoDecoration: {
    color: colors.grey170,
  },
})

const mapStateToProps = (state, ownProps) => {
  const userData = toJs(ownClaims(state)) || {}
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
    accounts: myAccounts(state),
    accountProfileLookup: clientId => toJs(externalProfile(state, clientId)),
  }
}
export const mapDispatchToProps = dispatch => {
  return {
    storeOwnClaim: (address, claims) => {
      dispatch(addClaims(address, claims))
    },
    editMyInfo: change => {
      dispatch(editMyInfo(change))
    },
    addImage: (address, claimType, image) => {
      dispatch(addImage(address, claimType, image))
    },
    updateShareToken: address => {
      dispatch(updateShareToken(address))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(User)
