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
import * as React from 'react'
import { connect } from 'react-redux'

import { Container, CredentialExplorer, Screen, Banner, Card, Text, IndicatorBar, Section, Theme } from '@kancha'

interface AcceptCredentialProps {
  verification: any
  address: string
  title: string
  issuer: any
  request: any
}

export const AcceptCredential: React.FC<AcceptCredentialProps> = props => {
  return (
    <Screen statusBarHidden config={Screen.Config.Scroll}>
      <Container padding>
        <Container marginTop={50} marginBottom={30} />
        <Container flexDirection={'row'} justifyContent={'flex-end'} marginBottom>
          <Text>Decline Save</Text>
        </Container>
        <Card>
          <Banner
            size="small"
            requestor={props.title}
            subTitle={props.issuer.name}
            avatar={''}
            httpsResolveStatus={'OKAY'}
            backgroundImage={''}
          />
          <IndicatorBar text={'You have received a credential'} />
          <Section noTopBorder noTopMargin>
            <CredentialExplorer claim={props.verification.claim} />
          </Section>
        </Card>
      </Container>
    </Screen>
  )
}

export default AcceptCredential
