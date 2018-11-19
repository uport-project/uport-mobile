import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, Dimensions, Image, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Feather'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'

import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { onlyPendingAndLatestAttestations } from 'uPortMobile/lib/selectors/attestations'

const { height, width } = Dimensions.get('window');

class Verifications extends React.Component {

    static navigatorStyle = {
        largeTitle: false,
        navBarBackgroundColor: 'rgba(92,80,202,1)',
        navBarButtonColor: '#FFFFFF',
        navBarTextColor: '#FFFFFF',
    }

    constructor(props) {
        super(props)

        this.renderListItem = this.renderListItem.bind(this)
    }

    extractClaimType (verification) {
        if (verification.claimType) {
            return verification.claimType
        }
        return Object.keys(verification.claim).map(claim => capitalizeFirstLetter(claim))
    }

    renderListItem({item}) {
        return (
            <TouchableOpacity 
                onPress={() => 
                    this.props.navigator.push({
                        screen: 'screen.VerificationScreen', 
                        passProps: { verification: item, claimType: this.extractClaimType(item) }
                    })
                } 
                style={styles.listItem}>
                <Avatar size={50} source={item.issuer} />
                <View style={{alignItems: 'flex-start', flex: 1, marginLeft: 20}}>
                    <Text style={{fontSize: 16, paddingBottom: 5, fontFamily: 'Montserrat'}}>{ this.extractClaimType(item) }</Text>
                    <Text style={{fontSize: 14, color: '#AAAAAA'}}>{item.issuer ? item.issuer.name : `${item.iss.slice(0, 10)}...`}</Text>
                </View>
                <Icon size={20} name="chevron-right" />
            </TouchableOpacity>
        )
    }

    

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={this.props.verifications}
                    renderItem={this.renderListItem}
                    keyExtractor={(item, index) => `${item.iat}-${index}`}
                />
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listItem: {
        height: 70, 
        borderBottomColor: '#EAEAEA', 
        borderBottomWidth: 1, 
        padding: 10, 
        alignItems: 'center', 
        flexDirection: 'row', 
        justifyContent: 'space-between'
    }
})

const mapStateToProps = (state) => {
    return {
      verifications: onlyPendingAndLatestAttestations(state)
    }
  }
  

  export default connect(mapStateToProps)(Verifications)