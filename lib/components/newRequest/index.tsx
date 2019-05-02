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
import { Container } from '@kancha'
import DisclosureCard from './types/DisclosureCard'
import TransactionCard from './types/TransactionCard'
import { SafeAreaView } from 'react-native'

const REQUEST_TYPE = {
  DISCLOSURE: 'disclosure',
  SIGN: 'sign',
}

interface RequestManagerProps {
  requestType: string
  componentId: string
}

const RequestScreenManager: React.FC<RequestManagerProps> = ({ requestType, componentId }) => {
  switch (requestType) {
    case REQUEST_TYPE.DISCLOSURE:
      return <DisclosureCard componentId={componentId} />
    case REQUEST_TYPE.SIGN:
      return (
        <Container flex={1}>
          <SafeAreaView style={{ backgroundColor: '#000000' }} />
          <Container flex={1} justifyContent={'flex-end'} backgroundColor={'#000000'}>
            <TransactionCard componentId={componentId} />
          </Container>
          <SafeAreaView style={{ backgroundColor: '#F6F5FE' }} />
        </Container>
      )
    default:
      return <Container />
  }
}

export default RequestScreenManager
