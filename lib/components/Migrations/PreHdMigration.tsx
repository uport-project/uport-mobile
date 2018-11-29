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
  View,
  ActivityIndicator
} from 'react-native'
import ProcessCard from 'uPortMobile/lib/components/shared/ProcessCard'
import { Text } from 'uPortMobile/lib/components/shared'
// Selectors
import {
  currentAddress
} from 'uPortMobile/lib/selectors/identities'
import {
  working,
  statusMessage,
  errorMessage
} from 'uPortMobile/lib/selectors/processStatus'
import {
  migrationStepStatus,
  migrationCompleted
} from 'uPortMobile/lib/selectors/migrations'
import { MigrationTarget, MigrationStep, MigrationStatus, targetRecipes } from 'uPortMobile/lib/constants/MigrationActionTypes'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { runMigrations } from 'uPortMobile/lib/actions/migrationActions'

const S = require('string')

interface Navigator {
  dismissModal: Function
}

interface StepProps {
  step: MigrationStep,
  working: boolean,
  status: MigrationStatus,
  message: string,
  error: string
}

const StepView: React.SFC<StepProps> = ({step, working, status, message, error}) => {
  const title = S(step).humanize().s
  return <View style={{marginBottom: 16}}>
    <Text bold style={{fontSize: 18}}>{title} 
    {working ? <View style={{width: 18, height: 18, marginRight: 9}}><ActivityIndicator /></View> : null}
    </Text>
    <Text small secondary style={error ? {color: 'red'} : {}}>{error || message || (status ? MigrationStatus[status] : '...')}</Text>
  </View>
}

interface withStep {
  step: MigrationStep
}

const Step = connect((state: any, ownProps: withStep) : StepProps => {
  const step = ownProps.step
  return {
    ...ownProps,
    working: working(state, step),
    status: migrationStepStatus(state, step),
    message: statusMessage(state, step),
    error: errorMessage(state, step)
  }
})(StepView)

interface MigrateProps {
  navigator: Navigator,
  migrate: Function,
  working: boolean,
  completed: boolean
}

const Migrate: React.SFC<MigrateProps> = (props) => {
  return <ProcessCard
    process={MigrationTarget.PreHD}
    actionText='Migrate Identity'
    onlyOnline
    onProcess={props.migrate}
    onContinue={false}
    skipTitle='Cancel'
    skippable={!props.working && !props.completed}
    onSkip={props.navigator.dismissModal}
    >
    <View>
      <Text title>Migrate old Pre HD Identity</Text>
      <Text p>You have an old Identity that can not be safely backed up.</Text>
      <Step step={MigrationStep.CleanUpAfterMissingSeed} />
      <Step step={MigrationStep.IdentityManagerChangeOwner} />
      <Step step={MigrationStep.UpdatePreHDRootToHD} />
      <Step step={MigrationStep.UportRegistryDDORefresh} />
    </View>
  </ProcessCard>
}


const mapStateToProps = (state: any, ownProps: object) => {
  return {
    ...ownProps,
    address: currentAddress(state),
    working: working(state, MigrationTarget.PreHD),
    completed: migrationCompleted(state, MigrationTarget.PreHD)
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
