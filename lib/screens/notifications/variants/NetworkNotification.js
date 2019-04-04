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
import Moment from 'moment'
// Components
import Notification from '../Notification'

Moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s',
    ss: 's',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: 'a day',
    dd: '%dd',
    M: '1M',
    MM: '%dM',
    y: '1Y',
    yy: '%dY',
  },
})

const NetworkNotification = props => {
  let issuer = props.issuer(props.activity.clientId)
  issuer = Object.assign({}, issuer)
  const handleAuthorize = () => {
    props.authorize(props.activity)
  }
  const handleCancel = () => {
    props.cancel(props.activity)
  }
  // const type = '' + issuer['@type']

  return (
    <Notification
      title='New Account Created'
      cancelText='Decline'
      acceptText='Accept'
      cardPress={() => props.selectRequest(props.activity)}
      name={issuer && issuer.name}
      avatar={issuer && issuer.avatar}
      type='Network'
      date={typeof props.activity.authorizedAt === 'undefined' ? 0 : props.activity.authorizedAt}
      line1={
        props.activity.canceledAt
          ? `Transaction Canceled`
          : props.activity.authorizedAt
          ? `${issuer.name} was added as a network`
          : `Add ${issuer.name} as a network`
      }
      completed={props.activity.authorizedAt}
      canceled={props.activity.canceledAt}
      cancel={handleCancel}
      accept={handleAuthorize}
      noButtons={props.noButtons || false}
    />
  )
}

export default NetworkNotification
