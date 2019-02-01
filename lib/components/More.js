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
import { connect } from 'react-redux'
// Selectors
import { connections } from 'uPortMobile/lib/selectors/identities'
import { seedConfirmedSelector } from 'uPortMobile/lib/selectors/hdWallet'
import { isFullyHD } from 'uPortMobile/lib/selectors/chains'
import { pendingMigrations } from 'uPortMobile/lib/selectors/migrations'

// Components
import NavigatableScreen from 'uPortMobile/lib/components/shared/NavigatableScreen'
import Menu from 'uPortMobile/lib/components/shared/Menu'
import MenuItem from 'uPortMobile/lib/components/shared/MenuItem'

import RNFS from 'react-native-fs'
import { toJs } from 'mori'
import { Share } from 'react-native'

export class More extends NavigatableScreen {
  render () {
    return (
      <Menu>
        <MenuItem title='About' destination='settings.main' navigator={this.props.navigator} />
        <MenuItem title='Advanced' destination='uport.advanced' navigator={this.props.navigator} />
        {this.props.hasHDWallet && <MenuItem
          title='Account Recovery'
          danger={!this.props.seedConfirmed}
          value={this.props.seedConfirmed ? undefined : 'Account At Risk'}
          destination='backup.seedInstructions'
          navigator={this.props.navigator}
        />}
        {this.props.hasHDWallet && <MenuItem
          title='Account Back Up'
          destination='backup.dataInstructions'
          navigator={this.props.navigator}
        />}
        {this.props.pendingMigrations.map(target => (
          <MenuItem key={target} title={`Migrate ${target}`} destination={`migrations.${target}`} navigator={this.props.navigator} />
        ))}
        <MenuItem title='Try uPort' navigator={this.props.navigator} destination='advanced.try-uport'/>
        <MenuItem title='Dump State' onPress={async () => {
          console.log('dumping state:')
          const dumpData = this.props.dumpState()
          const json = JSON.stringify(dumpData)
          console.log(dumpData)
          
          const rootPath = RNFS.DocumentDirectoryPath
          const dumpFilePath = `${rootPath}/dump.json`

          try {
            await RNFS.writeFile(dumpFilePath, json, 'utf8')
            const fileUrl = `file://${dumpFilePath}`
            console.log(await RNFS.exists(dumpFilePath))
            console.log(fileUrl)

            const result = await Share.share({
              message: 'There should be a json file here',
              url: fileUrl,
              title: 'uPort Debug Data',
              subject: 'JSON Data'
            }, {
              // Android only
              dialogTitle: 'uPort Debug Data'
            })

            if (result.action === Share.sharedAction) {
              console.log('share complete') 
            } else if (result.action === Share.dismissedAction) {
              console.log('share dismissed')
            }

            const dumpFileExists = await RNFS.exists(dumpFilePath)
            if (dumpFileExists) {
              console.log('removing dump file')
              await RNFS.unlink(dumpFilePath)
            }
          } catch(e) {
            console.log('error sharing dump file:', e)
          }
        }} last/>
      </Menu>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    dumpState: () => {
      const tree = {}
      for (let reducer in state) {
        tree[reducer] = toJs(state[reducer])
      }
      return tree
    },
    connections: connections(state) || [],
    hasHDWallet: isFullyHD(state),
    seedConfirmed: seedConfirmedSelector(state),
    pendingMigrations: pendingMigrations(state)
  }
}

export default connect(mapStateToProps)(More)
