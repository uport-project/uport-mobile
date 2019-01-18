import * as React from 'react';
import { Image, TouchableHighlight, ViewStyle, Linking } from 'react-native';
import { Container, Text, Icon, TextTypes, Theme } from '@kancha'

interface ListItemProps {
  /**
   * Provide the uri to the avatar
   */
  avatar?: string;

  /**
   * Provide an avatar component to render
   */
  avatarComponent?: React.ReactNode;

  /**
   * Provide the onPress function
   */
  onPress?: () => void;

  /**
   * Provide an external link to navigate to
   */
  externalLink?: string;

  /**
   * Prevent the default forward arrow from showing when onPress is defined
   */
  hideForwardArrow?: boolean;

  /**
   * Text to be displayed on the right as a smaller note
   */
  infoNoteRight?: string;

  /**
   * Text to be displayed on the right as regular text
   */
  contentRight?: string;

  /**
   * This is the last item in a list
   */
  last?: boolean;
}

/** Move to kancha utils */
const shortenString = (item: string) => {
  return `${item.slice(0, 18)}...`
}

const ListItem: React.FunctionComponent<ListItemProps> = (props) => {

  const styles: ViewStyle = {
    backgroundColor: Theme.colors.primary.background,
  }

  const onPressAction = props.onPress
                          ? props.onPress
                          : props.externalLink
                          ? () => props.externalLink && Linking.openURL(props.externalLink)
                          : undefined;

  const actionIcon = props.onPress
                          && !props.hideForwardArrow
                          ? 'forward' : props.externalLink ? 'link'
                          : undefined;

  return (
    <TouchableHighlight style={styles} onPress={onPressAction} underlayColor={Theme.colors.primary.underlay}>
      <Container flex={1} flexDirection={'row'}>
        {
          props.avatarComponent
            && <Container alignItems={'center'} justifyContent={'center'} paddingLeft paddingTop={8} paddingBottom={8} >{props.avatarComponent}</Container>
        }
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
          <Container flex={1}>
            <Text type={TextTypes.ListItem}>{ props.children }</Text>
          </Container>
          <Container flexDirection={'row'} alignItems={'center'}>
            <Container marginRight marginLeft>
              { props.infoNoteRight && !props.contentRight && <Text type={TextTypes.ListItemNote}>{ props.infoNoteRight }</Text> }
              { props.contentRight && !props.infoNoteRight && <Text type={TextTypes.ListItemRight}>{ shortenString(props.contentRight) }</Text> }
            </Container>
            {
              actionIcon && <Icon name={actionIcon} size={24} color={Theme.colors.primary.accessories}/>
            }
          </Container>
        </Container>
      </Container>
    </TouchableHighlight>
  )
}

export default ListItem;
