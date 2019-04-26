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
import { View, Text } from 'react-native'
// Utilities
import { formatWeiAsEth } from 'uPortMobile/lib/helpers/conversions'
import Notification from '../Notification'
import DataFlowHeader from 'uPortMobile/lib/components/Request/partials/DataFlowHeader'
import { textStyles } from 'uPortMobile/lib/styles/globalStyles'

var S = require('string')
const humanize = s => S(s).humanize().s

// Constants
const setAttributesSig = '6737c877'

const TransactionNotification = props => {
  // if (!props.activity.to) return (<View />)
  const me = props.issuer(props.activity.target)
  const client = props.issuer(props.activity.client_id)
  const contract = props.issuer(props.activity.to)
  const counterparty = client || contract || {}
  const handleAuthorize = () => {
    props.authorize(props.activity)
  }
  const handleCancel = () => {
    props.cancel(props.activity)
  }
  return (
    <Notification
      title='Confirm Transaction'
      cardPress={() => props.selectRequest(props.activity)}
      cancelText='Reject'
      acceptText='Approve'
      completed={!!props.activity.authorizedAt}
      canceled={!!props.activity.canceledAt}
      cancel={handleCancel}
      accept={handleAuthorize}
      noButtons={false}
    >
      <DataFlowHeader sender={me} recipient={counterparty} />
      <Text style={[textStyles.h2, { margin: 10 }]}>
        {props.activity.canceledAt
          ? `Transaction Canceled`
          : props.activity.fnSig === setAttributesSig
          ? props.activity.authorizedAt
            ? 'You updated your public uPort profile'
            : 'Updating your public uPort profile'
          : props.activity.txhash
          ? 'You signed a transaction'
          : `${counterparty.name} requested that you...`}
      </Text>
      <Text style={textStyles.p}>
        {props.activity.canceledAt
          ? ``
          : props.activity.abi
          ? humanize(props.activity.abi.name)
          : props.activity.value
          ? `Sent ${formatWeiAsEth(props.activity.value)} ETH`
          : `Sent transaction`}
      </Text>
    </Notification>
  )
}

export default TransactionNotification
