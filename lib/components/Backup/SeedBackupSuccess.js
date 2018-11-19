// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, Platform, ScrollView } from 'react-native'
import { Text, KeyboardAwareScrollView, Checkbox } from '../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { Button, Centered } from '../shared/Button'
import SuccessIcon from 'uPortMobile/lib/components/shared/SuccessIcon'
import { dataBackup } from 'uPortMobile/lib/selectors/settings'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

export class SeedBackupSuccess extends React.Component {

  static navigatorStyle = {
    largeTitle: false,
    navBarBackgroundColor: colors.brand,
    navBarButtonColor: colors.white,
    navBarTextColor: colors.white,
  }

  render () {
    const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
    return (
      <View style={[styles.container, styles.brandContainer]}>
        <View style={[styles.column, styles.infoBox]}>
          <Text title invert>Success</Text>
          <View style={{paddingBottom: 30, alignItems: 'center'}}>
            <SuccessIcon width={100} height={100} />
          </View>
          <Text p invert>You have successfully backed up your seed phrase.</Text>
          {!this.props.dataBackup && <Text p invert noMargin>
            We recommend you also turn on
          </Text>}
          {!this.props.dataBackup && <Text p invert bold noMargin>
            Account Backup
          </Text>}
          {!this.props.dataBackup && <Text p invert>
            to ensure that your claims and attestations can be restored when you recover your identity. All backup data is encrypted and this service can be turned off at any time.
          </Text>}
        </View>
        <Centered>
          <Button
            style={styles.invertedButton}
            textStyle={styles.invert}
            onPress={() => this.props.navigator.popToRoot({
              animated: true,
            })}
            >
            {this.props.dataBackup ? 'Done' : 'Later'}
          </Button>
          {!this.props.dataBackup && <Button
            style={styles.invertedMainButton}
            textStyle={styles.brand}
            onPress={() => this.props.navigator.push({
              screen: 'backup.dataInstructions',
              backButtonTitle: '',
              navigatorStyle: {
                navBarHidden: false,
              },
            })}
            >
            {'Backup Now'}
          </Button>}
        </Centered>
      </View>
    )
  }
}

SeedBackupSuccess.contextTypes = {
  theme: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    dataBackup: dataBackup(state),
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(SeedBackupSuccess))
