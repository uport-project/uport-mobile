import React from 'react'
import { FlatList, Platform, ScrollView, TouchableHighlight, TouchableOpacity, StyleSheet, View, SafeAreaView, Dimensions, Text, ImageBackground, TextInput, Share} from 'react-native'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'

const { height, width } = Dimensions.get('window');
const isIos = Platform.OS === 'ios'
const SPACER_SIZE = 1000
const TOP_COLOR = colors.brand
const BOTTOM_COLOR = 'white';

class Contact extends React.Component {

    static navigatorStyle = {
        largeTitle: true,
        navBarNoBorder: true,
        navBarBackgroundColor: colors.brand,
        navBarButtonColor: colors.white,
        navBarTextColor: colors.white,
    }

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <ScrollView
                    style={{backgroundColor: BOTTOM_COLOR }}
                    contentContainerStyle={{backgroundColor: TOP_COLOR}}
                    contentInset={{top: -SPACER_SIZE}}
                    contentOffset={{y: SPACER_SIZE}}>

                    {isIos && <View style={{height: SPACER_SIZE}} />}

                    <View style={{paddingTop: 30, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'}}>
                        <Avatar source={this.props.user.avatar} size={100} style={{borderWidth: 2, borderColor: 'white'}}/>
                        <Text style={styles.bannerTitle}>{ this.props.user.name }</Text>
                    </View>

                    <View style={{backgroundColor: BOTTOM_COLOR}}>
                        <View style={{paddingLeft: 15, paddingVertical: 10, backgroundColor: '#EAEAEA', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#CCCCCC'}}>
                           <Text style={{fontSize: 11, color: '#333333'}}>PERSONAL</Text>
                        </View>
                        <View>
                          <View style={styles.infoRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.infoTitle}>NAME</Text>
                                <Text style={styles.infoContent} >{this.props.user.name}</Text>
                            </View>
                          </View>
                          <View style={styles.infoRow}>
                          <View style={{flex: 1}}>
                                <Text style={styles.infoTitle}>EMAIL</Text>
                                <Text style={styles.infoContent} >{this.props.user.email}</Text>
                            </View>
                          </View>
                          <View style={styles.infoRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.infoTitle}>PHONE</Text>
                                <Text style={styles.infoContent} >{this.props.user.phone}</Text>
                            </View>
                          </View>
                          <View style={styles.infoRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.infoTitle}>LOCATION</Text>
                                <Text style={styles.infoContent} >{this.props.user.country}</Text>
                            </View>
                          </View>
                          <View style={styles.infoRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.infoTitle}>ADDRESS</Text>
                                <Text style={styles.infoContent} >{this.props.user.address}</Text>
                            </View>
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
    infoRow: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#AAAAAA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 15,
        paddingRight: 10
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
  
export default Contact