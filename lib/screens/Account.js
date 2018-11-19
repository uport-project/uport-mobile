import React from 'react'
import { ScrollView, Platform, RefreshControl, Clipboard, Share, StyleSheet, View, SafeAreaView, Dimensions, Text, ActivityIndicator } from 'react-native'
import { debounce } from 'lodash'
import { toJs } from 'mori'
import { connect } from 'react-redux'
import { wei2eth } from 'uPortMobile/lib/helpers/conversions'
import { colors, font } from 'uPortMobile/lib/styles/globalStyles'
import { SharedElementTransition } from 'react-native-navigation'

import AccountTile from 'uPortMobile/lib/components/shared/AccountTile'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import FeatherIcon from 'react-native-vector-icons/Feather'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import { OnboardingButton } from 'uPortMobile/lib/components/shared/Button'

import { networksByName } from 'uPortMobile/lib/utilities/networks'
import { backIconGetter, shareIconGetter } from 'uPortMobile/lib/utilities/navButtonGetters'

import { networkSettingsForAddress } from 'uPortMobile/lib/selectors/chains'
import { working } from 'uPortMobile/lib/selectors/processStatus'
import { refreshBalance } from 'uPortMobile/lib/actions/uportActions'

const { height, width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios'
const SPACER_SIZE = 1000
const TOP_COLOR = colors.brand
const BOTTOM_COLOR = 'white';

class Account extends React.Component {

    static navigatorStyle = {
        largeTitle: false,
        navBarNoBorder: true,
        navBarBackgroundColor: colors.brand,
        navBarButtonColor: colors.white,
        navBarTextColor: colors.white,
    }

    componentDidMount() {

        MaterialIcon.getImageSource('qrcode-scan', 26, '#FFFFFF').then(scan => {
            FeatherIcon.getImageSource('share', 26, '#FFFFFF').then(share => {
                this.props.navigator.setButtons({
                    rightButtons: [
                        {
                            id: 'share',
                            icon: share
                        }
                    ]
                })
            })
        })
    }

    showModal () {
        this.props.navigator.showModal({
            screen: 'uport.accountFunding',
                passProps: {
                address: this.props.address,
                accountProfile: this.props.accountProfile
            },
            navigatorStyle: {
                navBarHidden: true
            }
        })
    }
    
    refreshBalance () {
        this.props.refreshBalance(this.props.address)
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView
                   style={{backgroundColor: BOTTOM_COLOR }}
                   contentContainerStyle={{backgroundColor: TOP_COLOR}}
                   contentInset={{top: -SPACER_SIZE}}
                   contentOffset={{y: 0}}
                   refreshControl={
                        <RefreshControl
                            refreshing={this.props.working}
                            onRefresh={this.refreshBalance.bind(this)}
                        />
                }>
                    {isIos && <View style={{height: SPACER_SIZE}} />}
                    {/* <SharedElementTransition
                        style={{backgroundColor: colors.brand}}
                        sharedElementId={this.props.address}
                        showDuration={600}
                        hideDuration={400}
                        showInterpolation={{
                                type: 'linear',
                                easing: 'FastOutSlowIn'
                            }}
                        hideInterpolation={{
                                type: 'linear',
                                easing:'FastOutSlowIn'
                            }}
                    > */}
                    <View style={styles.bannerTop}>
                        <Avatar size={50} style={{backgroundColor: '#50b2ca'}} source={this.props.accountProfile || {avatar: require('uPortMobile/assets/images/eth-symbol2-white.png')}} />
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            {
                                this.props.working && <ActivityIndicator size="large"/>
                            } 
                            <Text style={styles.ethBalance}>{ this.props.balance } ETH</Text>
                        </View>
                        <View>
                            <Text style={styles.fiatBalance}>$ {this.props.usdBalance } </Text>
                        </View>
                    </View>
                    {/* </SharedElementTransition> */}
                    <View style={{backgroundColor: BOTTOM_COLOR}}>
                        <View style={styles.buttonRow}>
                            <OnboardingButton 
                                onPress={() => this.showModal()} 
                                style={{borderColor: colors.brand}} >
                                <Text style={{fontFamily: 'Montserrat'}}>Fund Account</Text>
                            </OnboardingButton>
                        </View>
                        <View style={styles.content}>
                            
                            <Text style={styles.titleText}>{ this.props.accountProfile ? this.props.accountProfile.name : 'Ethereum Account'}</Text>
                            <Text style={styles.subtitleText}>{ this.props.network } network</Text>

                            <View style={[styles.infoRow, {marginTop: 10}]}>
                                <Text style={styles.infoTitle}>ETHEREUM ADDRESS</Text>
                                <Text style={styles.infoContent}>{ this.props.hexaddress }</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoTitle}>EXPLORER URL</Text>
                                <Text style={styles.infoContent}>{this.props.explorerUrl}</Text>
                            </View>
                        </View>
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
        paddingBottom: 5,
        color: '#333333'
    },
    subtitleText: {
        color: '#AAAAAA'
    },
    ethBalance: {
        marginLeft: 10,
        fontFamily: 'Montserrat',
        fontSize: 30,
        color: '#FFFFFF'
    },
    fiatBalance: {
        fontFamily: 'Montserrat',
        fontSize: 18,
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
        color: '#AAAAAA',
        paddingVertical: 5,
        fontSize: 12
    },
    infoContent: {
        color: '#333333',
        fontSize: 14
    },
})

const mapStateToProps = (state, ownProps) => {
    const settings = networkSettingsForAddress(state, ownProps.address)
    const networkName = settings.network ? settings.network.charAt(0).toUpperCase() + settings.network.slice(1).toLowerCase() : null
    const ethBalance = settings.balance && settings.balance.ethBalance ? wei2eth(settings.balance.ethBalance) : 0
    const usdBalance = settings.balance && settings.balance.usdBalance ? settings.balance.usdBalance : 0
    const explorerUrl = (networksByName[settings.network]||{}).explorerUrl
    // const activities = toJs(activitiesForAddress(state, ownProps.address))
    return {
      ...ownProps,
      hexaddress: settings.hexaddress,
      balance: ethBalance,
      usdBalance: usdBalance,
      network: networkName,
      working: working(state, 'balance'),
      explorerUrl
    }
  }
  
  export const mapDispatchToProps = (dispatch) => {
    return {
      refreshBalance: (address) => dispatch(refreshBalance(address))
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Account)