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
import { Text } from 'react-native'
import Notification from '../partials/Notification'
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { textStyles, colors } from 'uPortMobile/lib/styles/globalStyles'
import dateChecker from 'uPortMobile/lib/utilities/dateChecker'

const AttestationNotification = props => {
  const handleAuthorize = () => {
    props.authorize(props.activity)
  }
  const handleCancel = () => {
    props.cancel(props.activity)
  }
  if (!props.activity.attestations) return null
  const verification = props.activity.attestations[0]
  const claimType = Object.keys(verification.claim)[0]
  const issuer = props.issuer(verification.iss)
  const exp = verification.exp
  // console.log(props.issuer(props.activity.attestations[0].iss))
  return (
    <Notification
      title='Verification Received'
      cardPress={() => props.selectRequest(props.activity)}
      cancelText='Dismiss'
      acceptText='View'
      completed={props.activity.authorizedAt}
      canceled={props.activity.canceledAt}
      cancel={handleCancel}
      accept={handleAuthorize}
      noButtons={false}
    >
      <Avatar source={issuer} size={72} borderWidth={4} borderColor={colors.white} />
      <Text style={[textStyles.h2, { margin: 10 }]}>{claimType}</Text>
      {exp ? <Text style={[textStyles.p, { margin: 10 }]}>Expires: {dateChecker(exp)}</Text> : null}
    </Notification>
  )
}

export default AttestationNotification
