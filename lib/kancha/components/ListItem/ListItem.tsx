/***
 *  Copyright (C) 2018 ConsenSys AG
 *
 *  This file is part of uPort Mobile App
 *  uPort Mobile App is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  uPort Mobile App is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  ERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ***/

import * as React from 'react'
import { Image, TouchableHighlight, ViewStyle, Linking } from 'react-native'
import { Container, Text, Icon, Theme } from '@kancha'

interface ListItemProps {
  /**
   * Provide the uri to the avatar
   */
  avatar?: string

  /**
   * Provide an avatar component to render
   */
  avatarComponent?: React.ReactNode

  /**
   * Provide the onPress function
   */
  onPress?: () => void

  /**
   * Provide an external link to navigate to
   */
  externalLink?: string

  /**
   * Prevent the default forward arrow from showing when onPress is defined
   */
  hideForwardArrow?: boolean

  /**
   * Text to be displayed on the right as a smaller accessory
   */
  accessoryRight?: string | number | undefined

  /**
   * Show the accessoryRight text in the theme warn color
   */
  warn?: boolean

  /**
   * Text to be displayed on the right as regular text. Not sure if needed yet.
   */
  contentRight?: string

  /**
   * This is the last item in a list
   */
  last?: boolean
}

/** Move to kancha utils */
const shortenString = (item: string) => {
  return `${item.slice(0, 12)}...`
}

const ListItem: React.FunctionComponent<ListItemProps> = props => {
  const styles: ViewStyle = {
    backgroundColor: Theme.colors.primary.background,
  }

  const onPressAction = props.onPress
    ? props.onPress
    : props.externalLink
    ? () => props.externalLink && Linking.openURL(props.externalLink)
    : undefined

  const actionIcon = props.onPress && !props.hideForwardArrow ? 'forward' : props.externalLink ? 'link' : undefined

  return (
    <TouchableHighlight style={styles} onPress={onPressAction} underlayColor={Theme.colors.primary.underlay}>
      <Container flex={1} flexDirection={'row'}>
        {props.avatarComponent && (
          <Container alignItems={'center'} justifyContent={'center'} paddingLeft paddingTop={8} paddingBottom={8}>
            {props.avatarComponent}
          </Container>
        )}
        <Container
          flex={1}
          flexDirection={'row'}
          alignItems={'center'}
          dividerBottom={!props.last}
          marginLeft
          paddingTop={10}
          paddingBottom={10}
          paddingRight
        >
          <Container flexDirection={'row'} flex={1} viewStyle={{ overflow: 'hidden' }}>
            <Text type={Text.Types.ListItem}>{props.children}</Text>
          </Container>
          <Container flexDirection={'row'} alignItems={'center'}>
            <Container marginRight marginLeft paddingTop={5} paddingBottom={5}>
              {props.accessoryRight && !props.contentRight && (
                <Text type={Text.Types.ListItemNote} warn={props.warn}>
                  {props.accessoryRight}
                </Text>
              )}
              {props.contentRight && !props.accessoryRight && (
                <Text type={Text.Types.ListItemRight}>{shortenString(props.contentRight)}</Text>
              )}
            </Container>
            {actionIcon && <Icon name={actionIcon} size={24} color={Theme.colors.primary.accessories} />}
          </Container>
        </Container>
      </Container>
    </TouchableHighlight>
  )
}

export default ListItem
