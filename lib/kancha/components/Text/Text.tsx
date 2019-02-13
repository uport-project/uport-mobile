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
import { Text, TextStyle } from 'react-native'
import { TextThemeMap, Theme } from '@kancha'

/**
 *  Implemenation details: Will move static types to theor own file or namespace later
 */

const TextTypes: Kancha.TextTypesStatic = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  ListItem: 'listItem',
  ListItemRight: 'listItemRight',
  ListItemNote: 'listItemNote',
  SubTitle: 'subTitle',
  Body: 'body',
  Button: 'button',
  NavButton: 'navButton',
  Summary: 'summary',
  SectionHeader: 'sectionHeader',
}

/**
 * Kancha Text Props
 */
interface KanchaTextProps {
  /**
   * The type of text to display. This will be styled accordinly to the theme
   */
  type?: string

  /**
   * Overide the color with a warning color
   */
  warn?: boolean

  /**
   * Color prop is used to configure button text colors
   */
  buttonTextColor?: Kancha.BrandPropOptions

  /**
   * Overide the brand color
   */
  textColor?: string

  /**
   * Overide the color with a warning color
   */
  block?: Kancha.BlockPropsOptions

  /**
   * Make the text bold
   */
  bold?: boolean

  /**
   * The padding around the text
   */
  padding?: number

  /**
   * A bottom padding for the text. Useful for headings
   */
  paddingBottom?: number | boolean | undefined

  /**
   * The margin around the text
   */
  margin?: number

  /**
   * The margin around the text
   */
  textAlign?: string

  /**
   * Decoration for button text
   */
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through' | undefined
}

const KanchaText: React.FC<KanchaTextProps> & { Types: Kancha.TextTypesStatic } = props => {
  const styles: TextStyle = {
    ...(props.type ? { ...TextThemeMap[props.type] } : {}),
    ...(props.textColor ? { color: props.textColor } : {}),
    ...(props.bold ? { fontWeight: 'bold' } : {}),
    ...(props.warn ? { color: Theme.colors.warning.text } : {}),
    ...(props.textAlign ? { textAlign: props.textAlign } : {}),
    ...(props.buttonTextColor
      ? {
          color: props.block
            ? Theme.colors[props.buttonTextColor].buttonText[props.block]
            : Theme.colors[props.buttonTextColor].buttonText.filled,
        }
      : {}),
    ...(props.paddingBottom ? { paddingBottom: props.paddingBottom } : {}),
    ...(props.paddingBottom && typeof props.paddingBottom === 'boolean'
      ? { paddingBottom: Theme.spacing.default }
      : {}),
  }

  return (
    <Text textDecorationLine={props.textDecorationLine} style={styles}>
      {props.children}
    </Text>
  )
}
KanchaText.defaultProps = {
  type: TextTypes.Body,
}
KanchaText.Types = TextTypes

export default KanchaText
