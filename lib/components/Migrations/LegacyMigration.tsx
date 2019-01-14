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
import MigrationScreen, { Step, Navigator } from './MigrationScreen'
import { connect } from 'react-redux'
import {
  View,
  ActivityIndicator
} from 'react-native'
import { Text } from 'uPortMobile/lib/components/shared'
import { MigrationTarget, MigrationStep, MigrationStatus, targetRecipes } from 'uPortMobile/lib/constants/MigrationActionTypes'
import { colors } from 'uPortMobile/lib/styles/globalStyles'

const S = require('string')

interface RootProps {
  navigator: Navigator
}

const Migrate: React.SFC<RootProps> = ({navigator}) => {
  return <MigrationScreen
    target={MigrationTarget.Legacy}
    title='Replace Legacy Identity'
    navigator={navigator}
    >
    <View>
      <Text title>Replace Legacy Identity</Text>
      <Text p>You have an old Identity that can not be safely backed up.</Text>
      <Step step={MigrationStep.MigrateLegacy} />
    </View>
  </MigrationScreen>
}
export default Migrate
