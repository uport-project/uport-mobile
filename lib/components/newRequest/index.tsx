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
import { ActivityIndicator } from 'react-native'
import { Container, Theme, Text } from '@kancha'
import DisclosureCard from 'uPortMobile/lib/screens/requests/disclosure/DisclosureCard'
import TransactionCard from './types/transaction/TransactionCard'
import AcceptCredential from 'uPortMobile/lib/screens/requests/credentials/AcceptCredentialContainer'
import { SafeAreaView } from 'react-native'

const REQUEST_TYPE = {
  DISCLOSURE: 'disclosure',
  SIGN: 'sign',
  CREDENTIAL: 'attestation',
}

interface RequestManagerProps {
  requestType: string
  componentId: string
}

const RequestScreenManager: React.FC<RequestManagerProps> = ({ requestType, componentId }) => {
  switch (requestType) {
    case REQUEST_TYPE.CREDENTIAL:
      return <AcceptCredential />
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
      return (
        <Container alignItems={'center'} justifyContent={'center'} flex={1}>
          <ActivityIndicator size="large" color={Theme.colors.primary.accessories} />
          <Container padding>
            <Text type={Text.Types.Body}>Loading request</Text>
          </Container>
        </Container>
      )
  }
}

export default RequestScreenManager
