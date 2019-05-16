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
import { DisclosureRequestModelType } from './DisclosureRequestModel'
import {
  Container,
  Text,
  Banner,
  Icon,
  Button,
  Screen,
  Section,
  ListItem,
  IndicatorBar,
  Credential,
  Theme,
} from '@kancha'

import withRequestModel from './DisclosureRequestContainer'
import SCREENS from 'uPortMobile/lib/screens/Screens'

/**
 * Dumb request component. Please DO NOT litter JSX template with conditional logic :D
 * All business logic should live in the RequestModel. This allows react to reuse more of the UI between renders
 */
export const DisclosureCard: React.FC<DisclosureRequestModelType> = requestModel => {
  return (
    <Screen
      config={Screen.Config.Scroll}
      type={Screen.Types.Secondary}
      statusBarHidden
      footerNavComponent={
        requestModel && (
          <Container backgroundColor={Theme.colors.primary.background}>
            <Container paddingHorizontal>
              <Text textAlign={'center'} type={Text.Types.SectionHeader} warn={!!requestModel.error}>
                {requestModel.error ? requestModel.error : requestModel.statsMessage}
              </Text>
            </Container>
            <Container flexDirection={'row'} padding>
              <Container flex={1} paddingRight>
                <Button
                  depth={1}
                  buttonText={requestModel.cancelButton.text}
                  block={Button.Block.Clear}
                  type={Button.Types.Warning}
                  onPress={() => requestModel.cancelButton.action(requestModel.requestId)}
                />
              </Container>
              <Container flex={2}>
                <Button
                  disabled={!!requestModel.error || requestModel.actionButton.disabled}
                  buttonText={requestModel.actionButton.text}
                  block={Button.Block.Filled}
                  type={Button.Types.Primary}
                  onPress={() =>
                    requestModel.actionButton.action(requestModel.requestId, requestModel.actionButton.actionType)
                  }
                />
              </Container>
            </Container>
          </Container>
        )
      }>
      {requestModel && (
        <Container>
          <Banner
            httpsResolveStatus={'OKAY'}
            backgroundImage={requestModel.appBranding.bannerImage}
            avatar={requestModel.appBranding.profileImage}
            requestor={requestModel.appBranding.requestor}
          />
          <IndicatorBar text={requestModel.title} />
          {requestModel.description && (
            <Container padding backgroundColor={Theme.colors.primary.background}>
              <Text type={Text.Types.Body}>{requestModel.description}</Text>
            </Container>
          )}
          {requestModel.requestItems.length > 0 && (
            <Section noTopBorder noTopMargin>
              {requestModel.requestItems.map((item: any, index: number) => {
                return (
                  <ListItem key={item.key} title={item.type} last={requestModel.requestItems.length - 1 === index}>
                    {item.value}
                  </ListItem>
                )
              })}
            </Section>
          )}
          {requestModel.verifiedCredentials.length > 0 && (
            <Section noTopBorder noTopMargin>
              {requestModel.verifiedCredentials.map((vc: any, index: number) => {
                return (
                  <Credential
                    key={vc.iss + '-' + index}
                    issuer={vc.issuer}
                    verification={vc}
                    claimType={vc.claimType}
                    screen={SCREENS.Credential}
                    componentId={requestModel.componentId}
                  />
                )
              })}
            </Section>
          )}
          {requestModel.missingCredentials.length > 0 && (
            <Section noTopBorder noTopMargin>
              {requestModel.missingCredentials.map((item: any, index: number) => {
                return (
                  item.essential && (
                    <Credential key={item.type + '-' + index} claimType={item.type} spec={item} missing />
                  )
                )
              })}
            </Section>
          )}
        </Container>
      )}
    </Screen>
  )
}

export default withRequestModel(DisclosureCard)
