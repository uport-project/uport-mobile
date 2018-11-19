import React from 'react'
import { FlatList, Platform, ScrollView, TouchableHighlight, TouchableOpacity, StyleSheet, View, SafeAreaView, Dimensions, Text, ImageBackground, TextInput, Share} from 'react-native'
import { toJs, get } from 'mori'
import moment from 'moment'
import { connect } from 'react-redux'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { externalIdentities, currentAddress , ownClaims} from 'uPortMobile/lib/selectors/identities'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import { OnboardingButton } from 'uPortMobile/lib/components/shared/Button'
import { editMyInfo, updateShareToken } from 'uPortMobile/lib/actions/myInfoActions'
import FeatherIcon from 'react-native-vector-icons/Feather'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { debounce } from 'lodash'
import { addClaims,addImage } from 'uPortMobile/lib/actions/uportActions'
import photoSelectionHandler from 'uPortMobile/lib/utilities/photoSelection'
import { onlyPendingAndLatestAttestations } from 'uPortMobile/lib/selectors/attestations'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'

const USER_FIELDS = ['name', 'email', 'country', 'phone', 'avatar']
const { height, width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios'
const SPACER_SIZE = 1000
const TOP_COLOR = colors.brand
const BOTTOM_COLOR = 'white';

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
    }

    setDefaultButtons() {
        FeatherIcon.getImageSource('share', 26, '#FFFFFF').then(share => { 
            FeatherIcon.getImageSource('edit', 26, '#FFFFFF').then(edit => {
                this.props.navigator.setButtons({
                    rightButtons: [
                        {
                            id: 'edit',
                            icon: edit
                        },
                        {
                            id: 'share',
                            icon: share
                        }
                    ]
                })
            })
        })
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
                }
            ]
        })
    }

    photoSelection() {
        photoSelectionHandler({
            cameraStatus: this.props.cameraStatus,
            photoStatus: this.props.photoStatus,
            segmentId: this.props.segmentId,
            addFn: this.props.editMyInfo
        })
    }

    showQRCode() {
        const url = `https://id.uport.me/req/${this.props.shareToken}`

        this.props.navigator.showModal({
            screen: 'uport.QRCodeModal',
            passProps: {
              title: this.props.name,
              url,
              onClose: this.props.navigator.dismissModal
            },
            navigatorStyle: {
              navBarHidden: true,
              screenBackgroundColor: 'white'
            }
        })
    }

    showQShareDialog() {
        const url = `https://id.uport.me/req/${this.props.shareToken}`

        Share.share({
            url,
            message: `${this.props.name}\n\n${url}`,
            title: `Share contact`
          }, {
            dialogTitle: `Share contact`
        })
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
          if (event.id === 'edit') { // this is the same id field from the static navigatorButtons definition
            this.setState({editMode: true})
            this.setEditModeButtons()
          }
          if (event.id === 'save') {
            this.handleSubmit()
            this.setState({editMode: false})
            this.setDefaultButtons()
          }
          if (event.id === 'cancel') {
            this.setState({editMode: false})
            this.setDefaultButtons()
            this.handleCancel()
          }
          if (event.id === 'share') {
            this.openShareModal()
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
                verifications: this.props.verifications.map((item) => {
                    const { claimTypeHeader, claimSubject, claimTypeTitle } = this.parseClaimItem(item)
                    return {
                        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                        type: claimTypeTitle,
                        value: claimSubject
                    }
                }),
                userData: this.getPersonlClaims().map((claim) => {
                    return {
                        ...claim,
                        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    }
                })
            }
        })
    }

    photoSelection() {
        photoSelectionHandler({
            cameraStatus: this.props.cameraStatus,
            photoStatus: this.props.photoStatus,
            segmentId: this.props.segmentId,
            addFn: this.props.editMyInfo
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
        this.setState({editing: false})
    }

    changed() {
        const change = {}
        USER_FIELDS.map((attr) => {
          if (this.props[attr] !== this.props.userData[attr]) {
            change[attr] = this.props[attr]
          }
        })
        return change
    }

    parseClaimItem(item) {
        const claimTypes = this.extractClaimType(item)
        const claimType = claimTypes[0]
        const claimTypeHeader = claimType.toUpperCase()
        const more = `+ ${claimTypes.length - 1} more`
        const claimTypeTitle = claimTypes.length > 1 ? `${claimTypeHeader} ${more}` : claimTypeHeader
        const claimSubject = claimTypes.length === 1 && item.claim[claimTypes[0]]

        return {
            claimTypeHeader,
            claimTypeTitle,
            claimSubject
        }
    }

    renderListItem({item, index}) {
        const { claimTypeHeader, claimTypeTitle, claimSubject } = this.parseClaimItem(item)
 
        return (
            <TouchableHighlight
                underlayColor="#EAEAEA"
                key={`${item.token}-${index}`}
                onPress={() =>
                    this.state.editMode
                        ? {}
                        : this.props.navigator.push({
                            screen: 'screen.VerificationScreen', 
                            passProps: { verification: item, claimType: claimTypeHeader }
                        })
                } 
                style={{}}>
                <View style={styles.infoRowContainer}>
                    <View style={styles.infoRow}>
                        {
                            this.state.editMode &&
                            <TouchableOpacity style={{paddingLeft: 10, paddingRight: 20}}>
                                <FeatherIcon size={20} name="minus-circle" color="red"/>
                            </TouchableOpacity>
                        }
                        <View style={{flex: 1}}>
                            <Text style={styles.infoTitle}>{ claimTypeTitle }</Text>
                            <Text style={styles.infoContent}>{ claimSubject || 'Multiple items...'}</Text>
                        </View>
                    {
                        !this.state.editMode &&
                            <FeatherIcon size={20} name="chevron-right" />
                    }
                    </View>
                </View>
            </TouchableHighlight>
        )
    }

    renderPersonalClaim(claim) {
        return (
            <View key={claim.type} style={styles.infoRowContainer}>
                <View style={styles.infoRow}>
                    {
                        this.state.editMode &&
                        <TouchableOpacity style={{paddingLeft: 10, paddingRight: 20}}>
                            <FeatherIcon size={20} name="minus-circle" color="red"/>
                        </TouchableOpacity>
                    }
                    <View style={{flex: 1}}>
                        <Text style={styles.infoTitle}>{ claim.type.toUpperCase() }</Text>
                        {
                            this.state.editMode
                                ? <TextInput placeholder={`Enter ${claim.type}`} style={styles.infoContent} value={claim.value} onChangeText={(value) => this.handleChange({[claim.type]: value})} />
                                : claim.value ? <Text style={styles.infoContent}>{ claim.value }</Text>
                                : <Text style={[styles.infoContent, {color: '#999'}]}>{ `None provided` }</Text>
                        }
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

        return expirationDate.isValid()
            ? moment(expirationDate).format('LLL')
            : 'No Expiration'
    }

    extractClaimType (verification) {
        if (verification.claimType) {
            return verification.claimType
        }
        return Object.keys(verification.claim).map(claim => capitalizeFirstLetter(claim))
    }

    render() {
        const personalClaims = this.getPersonlClaims()

        return (
            <SafeAreaView style={{flex: 1}}>
                <ScrollView
                    style={{backgroundColor: BOTTOM_COLOR }}
                    contentContainerStyle={{backgroundColor: TOP_COLOR}}
                    contentInset={{top: -SPACER_SIZE}}
                    contentOffset={{y: SPACER_SIZE}}>

                    {isIos && <View style={{height: SPACER_SIZE}} />}

                    <View style={{paddingTop: 30, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'}}>
                        {
                            this.state.editMode && <TouchableOpacity onPress={this.photoSelection} style={{position: 'absolute', top: 20, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1, borderRadius: 8, padding: 5}}><Text style={{color: 'white'}}>Update avatar</Text></TouchableOpacity>
                        }
                        <Avatar source={this.props.avatar} size={100}/>
                        <Text style={styles.bannerTitle}>{ this.props.name }</Text>
                    </View>

                    <View style={{backgroundColor: BOTTOM_COLOR}}>

                        <View style={{paddingLeft: 15, paddingVertical: 10, backgroundColor: '#EAEAEA', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#CCCCCC'}}>
                           <Text style={{fontSize: 11, color: '#333333'}}>PERSONAL</Text>
                        </View>

                        {
                           personalClaims.map((claim) => {
                               return this.renderPersonalClaim(claim)
                           })
                        }
                        {
                            this.props.verifications.length > 0
                                && <View style={{paddingLeft: 15, paddingVertical: 10, backgroundColor: '#EAEAEA', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#CCCCCC'}}>
                                        <Text style={{fontSize: 11, }}>OTHERS</Text>
                                    </View>
                        }
                        {
                            // Using simple map for now...
                            this.props.verifications.map((item, index) => {
                                return this.renderListItem({item, index})
                            })
                        }

                    </View>

                </ScrollView>
            </SafeAreaView>
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
        height: height / 3
    },
    editButton: {
        position: 'absolute', 
        alignSelf: 'center', 
        bottom: 150, 
        padding: 10, 
        borderRadius: 5, 
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 15
    },
    titleText: {
        fontFamily: 'Montserrat',
        fontSize: 25,
        color: '#333333',
        paddingBottom: 5
    },
    subtitleText: {
        color: '#AAAAAA',
        paddingBottom: 5,
    },
    bannerTitle: {
        padding: 15,
        fontFamily: 'Montserrat',
        fontSize: 30,
        color: '#FFFFFF',
        width: '100%',
        textAlign: 'center'
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
        color: '#FFFFFF'
    },
    buttonRow: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#AAAAAA',
        flexDirection: 'row',
    },
    buttonContainer: {
        flex: 1
    },
    infoRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    infoRow: {
        flex: 1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#AAAAAA',
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
        fontSize: 11
    },
    infoContent: {
        color: '#333333',
        fontSize: 16,
        paddingVertical: 10
    },
    infoContentEdit: {
        backgroundColor: '#FFFAEC',
    }
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
      verifications: onlyPendingAndLatestAttestations(state)
    }
  }
  export const mapDispatchToProps = (dispatch) => {
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
      updateShareToken: (address) => {
        dispatch(updateShareToken(address))
      },
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(User)