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
import { View, Clipboard } from 'react-native'
import { Text, TextInput } from '../shared'
import { connectTheme, defaultTheme } from 'uPortMobile/lib/styles'
import { Button, Centered } from '../shared/Button'
import { dataCustomUrlBackup, dataBackup } from 'uPortMobile/lib/selectors/settings'
import { startSwitchingDataBackup } from 'uPortMobile/lib/actions/settingsActions'
import { setDataCustomUrl } from 'uPortMobile/lib/actions/settingsActions'
import Status from '../shared/Status'
import { completed } from 'uPortMobile/lib/selectors/processStatus'

export class DataBackupCustom extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            copied: false,
         //   dataCustomUrlBackup: "" // https://this.is.only.a.test/event/v1
        }
        this.handleOnContinuePress = this.handleOnContinuePress.bind(this)
    }

    componentDidUpdate(prevProps) {
        if(this.props.dataBackup !== prevProps.dataBackup) {
            // COMPLETE_PROCESS
            if(this.props.dataBackup === 'customUrl') {
                this.props.navigator.push({
                    screen: 'backup.dataSuccess',
                    navigatorStyle: {
                      navBarHidden: true,
                    },
                  })
            }        
        }
    }

    handleOnContinuePress() {
        this.props.setDataCustomUrl(this.state.dataCustomUrlBackup)
        this.props.startSwitchingDataBackup('customUrl')
    }

    render() {
        const { styles, colors } = this.context.theme ? this.context.theme : defaultTheme
        return (
          <View style={[styles.container, styles.brandContainer]}>
            <View style={[styles.column, styles.infoBox]}>
              <Text title invert>Custom Url</Text>
              <Text p invert>Please provide the custom url you wish to use for your backup.</Text>

                 <TextInput
                label="Custom URL"
                placeholder="https://api.uport.space/caleuche/v1/event"
                returnKeyType="next"
                onChangeText={(dataCustomUrlBackup) => this.setState({dataCustomUrlBackup})}
                />
                 
                 <Status process='sync' />

            </View>
            <Centered>
                <Button
                onPress={this.handleOnContinuePress}
                >
                Backup Account
                </Button>
            </Centered>
          </View>
        )
    }
}

DataBackupCustom.contextTypes = {
    theme: PropTypes.object
  }
  
  const mapStateToProps = (state) => {
    return {
        dataBackup: dataBackup(state),
        dataCustomUrlBackup: dataCustomUrlBackup(state),
        completedSync: completed(state, 'sync'),
    }
  }
  
  export const mapDispatchToProps = (dispatch) => {
    return {
        setDataCustomUrl: (value) => dispatch(setDataCustomUrl(value)),
        startSwitchingDataBackup: (value) => dispatch(startSwitchingDataBackup(value))
    }
  }
  export default connect(mapStateToProps, mapDispatchToProps)(connectTheme(DataBackupCustom))
  