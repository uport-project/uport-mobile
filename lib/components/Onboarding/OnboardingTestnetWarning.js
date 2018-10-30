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
import { View, StyleSheet } from 'react-native'
import { OnboardingButton } from '../shared/Button'
import ProcessCard from '../shared/ProcessCard'
import YieldIcon from '../shared/YieldIcon'
import { onboardingStyles, textStyles } from 'uPortMobile/lib/styles/globalStyles'
import { Text } from '../shared'
import { connectTheme } from 'uPortMobile/lib/styles'

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
    alignItems: 'center', 
    margin: 45
  },
})

export const OnboardingTestnetWarning = (props) => {
  return (
    <ProcessCard
      actionText='Got it'
      onProcess={() => {
        props.navigator.push({
          screen: 'onboarding.optout',
          navigatorStyle: {
            navBarHidden: true
          }
        })
      }}
    >
      <Text title>
        We're On Testnet
      </Text>

      <YieldIcon width={90} height={82} style={styles.icon} />

      <Text p>
        Don't send Ether or tokens to your Uport. You will lose them.
      </Text>
      <Text p>
        You may be required to create a new Uport ID when we move to mainnet.
      </Text>
    </ProcessCard>

  )
}

export default connectTheme(OnboardingTestnetWarning)
