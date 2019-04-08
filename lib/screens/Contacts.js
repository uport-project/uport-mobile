import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableHighlight, Platform } from 'react-native'
import { Navigator, Navigation } from 'react-native-navigation'
import { connect } from 'react-redux'
import { count } from 'mori'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { colors } from 'uPortMobile/lib/styles/globalStyles'
import { contacts, currentAvatar, currentName } from 'uPortMobile/lib/selectors/identities'
import FeatherIcon from 'react-native-vector-icons/Feather'
import SCREENS from '../screens/Screens'

const Chevron = () => (
  <Icon
    name={Platform.OS === 'ios' ? 'ios-arrow-forward' : 'md-arrow-forward'}
    color={colors.grey216}
    style={{ marginLeft: 16 }}
    size={20}
  />
)

class Contacts extends React.Component {
  constructor(props) {
    super(props)
  }

  renderListItem({ item }) {
    return (
      <TouchableHighlight
        style={styles.contactItem}
        underlayColor={colors.grey216}
        onPress={() =>
          Navigation.push(this.props.componentId, {
            component: {
              name: SCREENS.Contact,
              passProps: {
                user: item,
              },
            },
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
    backgroundColor: '#FFFFFF',
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
