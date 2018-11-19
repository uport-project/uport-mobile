import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, TouchableHighlight } from 'react-native'
import { connect } from 'react-redux'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import { connections } from 'uPortMobile/lib/selectors/identities'
import { hdRootAddress, seedConfirmedSelector } from 'uPortMobile/lib/selectors/hdWallet'
const isIOS = Platform.OS === 'ios' ? true : false

const Chevron = () => <Icon name={Platform.OS === 'ios' ? 'ios-arrow-forward-outline' : 'md-arrow-forward'} color={colors.grey216} style={{marginLeft: 16}} size={20} />

class Settings extends React.Component {

    static navigatorStyle = {
        largeTitle: true,
        navBarNoBorder: false,
        navBarTransparent: false,
        navBarTranslucent: false,
        navBarBackgroundColor: colors.brand,
        navBarButtonColor: colors.white,
        navBarTextColor: colors.white,
    }

    constructor(props){
        super(props)

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }


    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id == 'scan') { // this is the same id field from the static navigatorButtons definition
                this.props.navigator.showModal({
                    screen: 'uport.scanner',
                    animated: true,
                    navigatorStyle: {
                        navBarHidden: true
                    }
                })
            }
        }
    }

    componentDidMount() {
        if(!isIOS) {
            MaterialIcons.getImageSource('qrcode-scan', 26, '#FFFFFF').then(icon => {
                this.props.navigator.setButtons(
                    {
                        fab: {
                            collapsedId: 'scan',
                            collapsedIcon: icon,
                            collapsedIconColor: colors.white,
                            backgroundColor: colors.brand
                        },
                    }
                )
            })
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Menu>  
                    <MenuItem title='About' destination='settings.main' navigator={this.props.navigator} topBorder />
                    <MenuItem title='Advanced' destination='uport.advanced' navigator={this.props.navigator} />
                        {
                            this.props.hasHDWallet && 
                            <MenuItem title='Account Recovery'
                                danger={!this.props.seedConfirmed}
                                value={this.props.seedConfirmed ? undefined : 'Account At Risk'}
                                destination='backup.seedInstructions'
                                navigator={this.props.navigator}
                            />
                        }
                        {   
                            this.props.hasHDWallet && 
                            <MenuItem
                                title='Account Back Up'
                                destination='backup.dataInstructions'
                                navigator={this.props.navigator}
                            />
                        }
                    <MenuItem title='Try uPort' navigator={this.props.navigator} destination='advanced.try-uport' last />
                </Menu>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAEAEA'
    }
})

const mapStateToProps = (state) => {
    return {
      connections: connections(state) || [],
      hasHDWallet: !!hdRootAddress(state),
      seedConfirmed: seedConfirmedSelector(state)
    }
  }
  export default connect(mapStateToProps)(Settings)