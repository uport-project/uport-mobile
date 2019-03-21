import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableHighlight, Platform } from 'react-native'
import { connect } from 'react-redux'
import { count, toJs, get } from 'mori'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { contacts, currentAvatar, currentName } from 'uPortMobile/lib/selectors/identities'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import FeatherIcon from 'react-native-vector-icons/Feather'
const isIOS = Platform.OS === 'ios' ? true : false

const Chevron = () => (
  <Icon
    name={Platform.OS === 'ios' ? 'ios-arrow-forward' : 'md-arrow-forward'}
    color={colors.grey216}
    style={{ marginLeft: 16 }}
    size={20}
  />
)

class Contacts extends React.Component {
  static navigatorStyle = {
    largeTitle: true,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  constructor(props) {
    super(props)

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this))
  }

  onNavigatorEvent(event) {
    // this is the onPress handler for the two buttons together
    if (event.type == 'NavBarButtonPress') {
      // this is the event type for button presses
      if (event.id == 'scan') {
        // this is the same id field from the static navigatorButtons definition
        this.props.navigator.showModal({
          screen: 'uport.scanner',
          navigatorStyle: {
            navBarHidden: true,
          },
        })
      }
    }
  }

  componentDidMount() {
    if (!isIOS) {
      MaterialIcons.getImageSource('qrcode-scan', 26, '#FFFFFF').then(icon => {
        this.props.navigator.setButtons({
          fab: {
            collapsedId: 'scan',
            collapsedIcon: icon,
            collapsedIconColor: colors.white,
            backgroundColor: colors.brand,
          },
        })
      })
    }
  }

  renderListItem({ item }) {
    return (
      <TouchableHighlight
        style={styles.contactItem}
        underlayColor={colors.grey216}
        onPress={() =>
          this.props.navigator.push({
            screen: 'screen.Contact',
            passProps: { user: item },
          })
        }
      >
        <View style={styles.contactItemContainer}>
          <View style={{ paddingHorizontal: 10 }}>
            <Avatar source={item} size={45} />
          </View>
          <View style={styles.contactItemContent}>
            <View style={{ flex: 1, paddingVertical: 15 }}>
              <Text style={{ fontSize: 18, color: colors.grey74 }}>
                {item.name ? item.name : `${item.address.slice(0, 30)}...`}
              </Text>
            </View>
            <Chevron />
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  renderProfileLink() {
    return (
      <TouchableHighlight
        style={styles.profileButton}
        underlayColor={colors.grey216}
        onPress={() => this.props.navigator.push({ screen: 'screen.User' })}
      >
        <View style={styles.profileButtonContent}>
          <View style={{ padding: 15 }}>
            <Avatar source={this.props.user.avatar} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontFamily: 'Montserrat' }}>{this.props.user.name}</Text>
          </View>
          <Chevron />
        </View>
      </TouchableHighlight>
    )
  }

  renderNoContacts() {
    return (
      <View style={styles.emptyStateContainer}>
        <FeatherIcon size={100} color={colors.white226} name='users' />
        <Text style={{ fontSize: 22, color: colors.grey91, paddingTop: 20 }}>You don't have any contacts yet</Text>
      </View>
    )
  }

  renderContactsList() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          style={{ flex: 1 }}
          // ListHeaderComponent={this.renderProfileLink.bind(this)}
          data={this.props.contacts}
          renderItem={this.renderListItem.bind(this)}
          keyExtractor={item => item.address}
        />
      </SafeAreaView>
    )
  }

  render() {
    return count(this.props.contacts) ? this.renderContactsList() : this.renderNoContacts()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEAEA',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    paddingRight: 15,
    marginVertical: 50,
    borderBottomColor: colors.white216,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.white216,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.white,
  },
  profileButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactItem: {
    backgroundColor: colors.white,
  },
  contactItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactItemContent: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 15,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: colors.white216,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.white216,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
})

const mapStateToProps = state => {
  return {
    user: {
      avatar: currentAvatar(state),
      name: currentName(state),
    },
    contacts: contacts(state) || [],
  }
}

export default connect(mapStateToProps)(Contacts)
