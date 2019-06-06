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

import {
  Container,
  CredentialExplorer,
  Screen,
  Banner,
  Card,
  Text,
  IndicatorBar,
  Section,
  Theme,
  Button,
} from '@kancha'

interface AcceptCredentialProps {
  verification: any
  address: string
  title: string
  issuer: any
  request: any

  authorizeRequest: (request: any, claim: any) => void
  cancelRequest: (request: any) => void
}

export const AcceptCredential: React.FC<AcceptCredentialProps> = props => {
  return (
    <Screen
      statusBarHidden
      config={Screen.Config.Scroll}
      footerNavComponent={
        <Container backgroundColor={Theme.colors.primary.background}>
          <Container paddingHorizontal>
            <Text textAlign={'center'} type={Text.Types.SectionHeader}>
              {'You have received a credential'}
            </Text>
          </Container>
          <Container flexDirection={'row'} padding>
            <Container flex={1} paddingRight>
              <Button
                depth={1}
                buttonText={'Decline'}
                block={Button.Block.Clear}
                type={Button.Types.Warning}
                onPress={() => props.cancelRequest(props.request)}
              />
            </Container>
            <Container flex={2}>
              <Button
                buttonText={'Accept'}
                block={Button.Block.Filled}
                type={Button.Types.Primary}
                onPress={() => props.authorizeRequest(props.request, props.verification.claim)}
              />
            </Container>
          </Container>
        </Container>
      }>
      <Container paddingLeft paddingRight paddingTop={80}>
        {/* <Container marginTop={50} marginBottom={30} /> */}
        {/* <Container flexDirection={'row'} justifyContent={'flex-end'} marginBottom>
          <Button
            type={Button.Types.Secondary}
            block={Button.Block.Clear}
            onPress={() => props.cancelRequest(props.request)}
            navButton
            buttonText={'Decline'}
          />
          <Button
            type={Button.Types.Confirm}
            block={Button.Block.Clear}
            onPress={() => props.authorizeRequest(props.request, props.verification.claim)}
            navButton
            buttonText={'Accept'}
          />
        </Container> */}
        <Card>
          <Banner
            size="small"
            requestor={props.title}
            subTitle={`Issued by ` + props.issuer.name}
            avatar={props.issuer.avatar && props.issuer.avatar}
            httpsResolveStatus={'OKAY'}
            backgroundImage={props.issuer.bannerImage && props.issuer.bannerImage}
          />
          <Section noTopBorder noTopMargin>
            <CredentialExplorer claim={props.verification.claim} />
          </Section>
        </Card>
      </Container>
    </Screen>
  )
}

export default AcceptCredential
