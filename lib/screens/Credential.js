import React from 'react'
import { ScrollView, RefreshControl, Clipboard, Share, StyleSheet, View, SafeAreaView, Dimensions, Text, Alert } from 'react-native'
import { toJs, get } from 'mori'
import { connect } from 'react-redux'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { externalIdentities, currentAddress } from 'uPortMobile/lib/selectors/identities'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import moment from 'moment'
import NestedInfo from 'uPortMobile/lib/components/shared/NestedInfo'
import { sha3_256 } from 'js-sha3'
import { removeAttestation } from 'uPortMobile/lib/actions/uportActions'

import FeatherIcon from 'react-native-vector-icons/Feather'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import { OnboardingButton } from 'uPortMobile/lib/components/shared/Button'

const { height, width } = Dimensions.get('window');

class Verification extends React.Component {

    static navigatorStyle = {
        largeTitle: false,
        navBarNoBorder: true,
        navBarButtonColor: colors.white,
        navBarTextColor: colors.white,
        navBarBackgroundColor: colors.brand,
    }

    constructor(props) {
        super(props)

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
        this.deleteVerification = this.deleteVerification.bind(this)
    }

    componentDidMount() {

        FeatherIcon.getImageSource('trash', 26, '#FFFFFF').then(trash => {
            this.props.navigator.setButtons({
                rightButtons: [
                    {
                        id: 'trash',
                        icon: trash
                    }
                ]
            })
        })
    }

    onNavigatorEvent (event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
          if (event.id === 'trash') { // this is the same id field from the static navigatorButtons definition
            Alert.alert(
                'Delete verification',
                'Are you sure you want to delete this verification? This cannot be undone.',
                [
                 {text: 'Delete', onPress: () => this.deleteVerification()},
                 {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                ],
                { cancelable: true }
              )
          }
        }
      }
    
    deleteVerification () {
        const tokenHash = sha3_256(this.props.verification.token)
        this.props.removeAttestation(this.props.address, tokenHash)
        this.props.navigator.pop()
    }
    expirationItem(exp) {
        let expirationDate = exp && exp >= 1000000000000 ? moment.unix(Math.floor(exp / 1000)) : moment.unix(exp)

        return expirationDate.isValid()
            ? moment(expirationDate).format('LLL')
            : 'No Expiration'
      }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {/* <View style={styles.bannerTop}>
                    <Text style={styles.bannerSubTitle}>{ this.props.claimType } claim</Text>
                    <Text style={styles.bannerMeta}> { 'Expires ' + this.expirationItem(this.props.verification.exp) }</Text>
                </View> */}
                <NestedInfo 
                    navigator={this.props.navigator}
                    data={this.props.verification.claim}
                    verification={this.props.verification}
                    />
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bannerTop: {
        backgroundColor: '#3A8BC6',
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 4
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
        paddingTop: 10,
        fontFamily: 'Montserrat',
        fontSize: 30,
        color: '#FFFFFF'
    },
    bannerSubTitle: {
        fontFamily: 'Montserrat',
        fontSize: 18,
        color: '#FFFFFF'
    },
    bannerMeta: {
        fontFamily: 'Montserrat',
        fontSize: 14,
        color: '#FFFFFF'
    },
    buttonRow: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#AAAAAA'
    },
    infoRow: {
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#AAAAAA'
    },
    infoTitle: {
        color: '#3A8BC6',
        fontSize: 12,
        paddingBottom: 5
    },
    infoContent: {
        color: '#333333',
        fontSize: 14
    }
})

const mapStateToProps = (state, ownProps) => {
    return {
        address: ownProps.verification.sub,
        issuer: toJs(get(externalIdentities(state), ownProps.verification.iss)) || {}
    }
}
  
const mapDispatchToProps = (dispatch) => {
    return {
        removeAttestation: (address, token) => dispatch(removeAttestation(address, token)),
        authorizeRequest: (activity) => dispatch(authorizeRequest(activity.id)),
        cancelRequest: (activity) => dispatch(cancelRequest(activity.id))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Verification)