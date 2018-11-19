import React from "react"
import { View, Text, TouchableHighlight, Picker, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { Button } from 'uPortMobile/lib/components/shared/Button'

class ShareContactModal extends React.Component {

  static navigatorStyle = {
    largeTitle: true,
    navBarBackgroundColor: 'rgba(92,80,202,1)',
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
}

  constructor(props) {
    super(props)

    this.state = {
      claims: []
    }

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
    this.toggleClaim = this.toggleClaim.bind(this)
  }

  componentDidMount() {
    const selectedClaims = this.props.userData.filter((claim) => claim.value).concat(this.props.verifications).map((claim) => {
      return {
        ...claim,
        isSelected: true
      }
    })
    
    this.setState({
      claims: selectedClaims
    })

    this.props.navigator.setButtons({
      rightButtons: [
          {
              title: 'Done',
              id: 'done',
          }
      ]
    })
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'done') {
        
        this.props.navigator.dismissModal()
      }
    }
  }

  toggleClaim(id) {
    /** 
     * Async set state
     **/
    this.setState((prevState) => {
      return {
        ...prevState,
        claims: prevState.claims.map((claim) => {
          return {
            ...claim,
            isSelected: id === claim.id ? !claim.isSelected : claim.isSelected,
          }
        })
      }
    })
  }

  renderPersonalClaim(claim) {
    const iconName = claim.isSelected ? "ios-checkmark-circle" : "ios-radio-button-off"
    return (
        <View key={claim.type} style={styles.infoRowContainer}>
            <View style={styles.infoRow}>
                <TouchableOpacity style={{paddingHorizontal: 10}} onPress={() => this.toggleClaim(claim.id)}>
                  <Icon name={iconName} size={35} color={colors.brand}/>
                </TouchableOpacity>
                <View style={{flex: 1}}>
                    <Text style={styles.infoTitle}>{ claim.type.toUpperCase() }</Text>
                    <Text style={styles.infoContent}>{ claim.value || 'Multiple items' }</Text>
                </View>
            </View>
        </View>
    )
}

  render(){
    return (
      <View style={{flex: 1, backgroundColor: colors.white}}>
        <ScrollView style={{flex: 1}}>
          {
            this.state.claims.map((claim) => {
              return this.renderPersonalClaim(claim)
            })
          }
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={{fontSize: 22, color: colors.brand}}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export default ShareContactModal

const styles = StyleSheet.create({
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
footer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 50,
  backgroundColor: colors.white216
}
})
