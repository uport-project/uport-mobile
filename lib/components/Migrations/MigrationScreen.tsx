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
import { View, ActivityIndicator } from 'react-native'
import ProcessCard from 'uPortMobile/lib/components/shared/ProcessCard'
import { Text } from 'uPortMobile/lib/components/shared'
// Selectors
import { currentAddress } from 'uPortMobile/lib/selectors/identities'
import { working, statusMessage, errorMessage } from 'uPortMobile/lib/selectors/processStatus'
import { migrationStepStatus, migrationCompleted } from 'uPortMobile/lib/selectors/migrations'
import {
  MigrationTarget,
  MigrationStep,
  MigrationStatus,
  targetRecipes,
} from 'uPortMobile/lib/constants/MigrationActionTypes'
import { runMigrations } from 'uPortMobile/lib/actions/migrationActions'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

const S = require('string')

export interface Navigator {
  dismissModal: Function
  push: Function
  popToRoot: Function
}

interface StepProps {
  step: MigrationStep
  working: boolean
  status: MigrationStatus
  message: string
  error: string
}

interface StatusIcon {
  [index: number]: string
}

const icons: StatusIcon = {
  2: 'ios-checkmark',
  3: 'ios-alert',
}

interface StatusProps {
  status: MigrationStatus
  working: boolean
}

const Status: React.SFC<StatusProps> = ({ status, working }) => {
  if (working) {
    return (
      <View style={{ width: 18, height: 18, marginRight: 9 }}>
        <ActivityIndicator />
      </View>
    )
  }
  const icon = icons[status]
  if (icon) {
    return (
      <View style={{ paddingLeft: 20 }}>
        <Icon name={icon} color={status === MigrationStatus.Completed ? colors.green : colors.red} size={20} />
      </View>
    )
  }
  return null
}

const StepView: React.SFC<StepProps> = ({ step, working, status, message, error }) => {
  const title = S(step).humanize().s
  return (
    <View style={{ marginBottom: 16 }}>
      <Text bold style={{ fontSize: 18 }}>
        {title}
      </Text>
      <Status working={working} status={status} />
      <Text small secondary style={error ? { color: 'red' } : {}}>
        {error || message || (status ? MigrationStatus[status] : '...')}
      </Text>
    </View>
  )
}

interface withStep {
  step: MigrationStep
}

export const Step = connect(
  (state: any, ownProps: withStep): StepProps => {
    const step = ownProps.step
    return {
      ...ownProps,
      working: working(state, step),
      status: migrationStepStatus(state, step),
      message: statusMessage(state, step),
      error: errorMessage(state, step),
    }
  },
)(StepView)

interface MigrateProps {
  navigator: Navigator
  migrate: Function
  working: boolean
  completed: boolean
  target: MigrationTarget
  title: string
  children: any
}

const Migrate: React.SFC<MigrateProps> = props => {
  return (
    <ProcessCard
      process={props.target}
      actionText={props.title}
      onlyOnline
      onProcess={() => props.migrate(props.target)}
      onContinue={() =>
        props.navigator.push({
          screen: 'migrations.complete',
          navigatorStyle: {
            navBarHidden: true,
          },
        })
      }
      skipTitle='Cancel'
      skippable={!props.working && !props.completed}
      onSkip={() => props.navigator.popToRoot({ animated: true })}
    >
      {props.children}
    </ProcessCard>
  )
}

const mapStateToProps = (state: any, ownProps: object) => {
  return {
    ...ownProps,
    address: currentAddress(state),
    working: working(state, ownProps.target),
    completed: migrationCompleted(state, ownProps.target),
  }
}

export const mapDispatchToProps = (dispatch: Function) => {
  return {
    migrate: (target: MigrationTarget) => {
      dispatch(runMigrations(target))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Migrate)
