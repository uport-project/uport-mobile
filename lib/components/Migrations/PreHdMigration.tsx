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
// Frameworks
import React from 'react'
import { connect } from 'react-redux'
import {
  StyleSheet,
  View,
  Image
} from 'react-native'
import {Base as ProcessCard} from 'uPortMobile/lib/components/shared/ProcessCard'
import { Text } from 'uPortMobile/lib/components/shared'
import { ConnectedStatusList } from 'uPortMobile/lib/components/Advanced/StatusMessages'
// Selectors
import {
  currentAddress
} from 'uPortMobile/lib/selectors/identities'

import { MigrationTarget } from 'uPortMobile/lib/constants/MigrationActionTypes'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { runMigrations } from 'uPortMobile/lib/actions/migrationActions'

interface Navigator {
  dismissModal: Function
}

interface MigrateProps {
  navigator: Navigator,
  migrate: Function
}

const Migrate: React.SFC<MigrateProps> = (props) => {
  return <ProcessCard
    actionText='Migrate Identity'
    onContinue={props.migrate}
    skipTitle='Cancel'
    skippable
    onSkip={props.navigator.dismissModal}
    >
    <Text title>Migrate old Pre HD Identity</Text>
    <Text p>You have an old Identity that can not be safely backed up.</Text>
    <ConnectedStatusList />
  </ProcessCard>
}


const mapStateToProps = (state: any, ownProps: object) => {
  return {
    ...ownProps,
    address: currentAddress(state)
  }
}

export const mapDispatchToProps = (dispatch: Function) => {
  return {
    migrate: () => {
      dispatch(runMigrations(MigrationTarget.PreHD))
    },
    trackSegment: (event: any) => {
      dispatch(track(`Onboarding ${event}`))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Migrate)
