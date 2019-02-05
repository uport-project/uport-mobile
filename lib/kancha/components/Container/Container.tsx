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
import { View, ViewStyle, StyleSheet } from 'react-native'
import { Theme } from '@kancha'

/**
 * Container is the most basic building block of Kancha. It is an abstraction of View with a basic implementaion
 * of flexbox and box modelling via props. The intention is for Container to be a declarative easy to use primitive to construct
 * complex views without worrying about the mess of styles. A custom style prop may need to be added to override styles for ege cases and or temporary implementaions.
 */
interface ContainerProps {
  /** Test ID used for e2e tests */
  testID?: string

  /** Width */
  w?: string | number | undefined

  /** Height */
  h?: string | number | undefined

  /** Bottom */
  b?: string | number | undefined

  /** Bottom */
  r?: string | number | undefined

  /** Border radius */
  br?: number | undefined

  /** Flex */
  flex?: number | undefined

  /** Pre-defined backgrounds accordign to the theme. use these where possible. */
  background?: Kancha.BrandPropOptions

  /** Temporary option to create custom color. Avoid is possible and deprecate if you can by modifying the theme */
  backgroundColor?: string

  /** Flex direction */
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | undefined

  /** Align items */
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | undefined

  /** Justify Content */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined

  /** Set the bottom divider */
  dividerBottom?: boolean

  /** et the top divider */
  dividerTop?: boolean

  /** Set the bottom margin */
  marginBottom?: number | boolean | undefined

  /** Set the top margin */
  marginTop?: number | boolean | undefined

  /** Set the bottom margin */
  marginLeft?: number | boolean | undefined

  /** Set the top margin */
  marginRight?: number | boolean | undefined

  /** Set the default padding */
  padding?: number | boolean | undefined

  /** Set the default paddingHorizontal */
  paddingHorizontal?: number | boolean | undefined

  /** Set the bottom padding */
  paddingBottom?: number | boolean | undefined

  /** Set the top padding */
  paddingTop?: number | boolean | undefined

  /** Set the left padding */
  paddingLeft?: number | boolean | undefined

  /** Set the right padding */
  paddingRight?: number | boolean | undefined

  /** Enable border for debugging layouts */
  debugBorder?: boolean

  /** Enable border for debugging layouts */
  borderColor?: string

  /** Enable border for debugging layouts */
  borderWidth?: number

  /** Change debug border color */
  debugBorderColor?: string | undefined

  /** Add addionaly custom styles for a container. Use sparingly!! */
  viewStyle?: ViewStyle
}

const Container: React.FunctionComponent<ContainerProps> = props => {
  const DividerBottomStyles: ViewStyle = {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.primary.divider,
  }

  const DividerTopStyles: ViewStyle = {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.colors.primary.divider,
  }

  const BaseStyles: ViewStyle = {
    /** Basic view styles */
    width: props.w,
    height: props.h,
    flex: props.flex,
    flexDirection: props.flexDirection,
    alignItems: props.alignItems,
    justifyContent: props.justifyContent,
    backgroundColor: props.background && Theme.colors[props.background].background,
    borderRadius: props.br,
  }

  /** Conditionally spread props down to the View as styles */
  const styles: ViewStyle = {
    ...BaseStyles,
    ...(props.dividerBottom ? DividerBottomStyles : {}),
    ...(props.dividerTop ? DividerTopStyles : {}),
    ...(props.borderColor ? { borderColor: props.borderColor } : {}),
    ...(props.borderWidth ? { borderWidth: props.borderWidth } : {}),
    ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
    ...(props.debugBorder ? { borderWidth: 1, borderColor: 'red' } : {}),
    ...(props.b !== undefined ? { position: 'absolute', bottom: props.b, width: '100%' } : {}),
    ...(props.r !== undefined ? { position: 'absolute', bottom: props.r, width: '100%' } : {}),

    /** Margins */
    marginBottom: typeof props.marginBottom === 'boolean' ? Theme.spacing.default : props.marginBottom,
    marginTop: typeof props.marginTop === 'boolean' ? Theme.spacing.default : props.marginTop,
    marginLeft: typeof props.marginLeft === 'boolean' ? Theme.spacing.default : props.marginLeft,
    marginRight: typeof props.marginRight === 'boolean' ? Theme.spacing.default : props.marginRight,

    /** Paddings */
    padding: typeof props.padding === 'boolean' ? Theme.spacing.default : props.padding,
    paddingHorizontal: typeof props.paddingHorizontal === 'boolean' ? Theme.spacing.default : props.paddingHorizontal,

    paddingBottom: typeof props.paddingBottom === 'boolean' ? Theme.spacing.default : props.paddingBottom,
    paddingTop: typeof props.paddingTop === 'boolean' ? Theme.spacing.default : props.paddingTop,
    paddingLeft: typeof props.paddingLeft === 'boolean' ? Theme.spacing.default : props.paddingLeft,
    paddingRight: typeof props.paddingRight === 'boolean' ? Theme.spacing.default : props.paddingRight,

    /** Viewstyle props will overide all options */
    ...(props.viewStyle ? { ...props.viewStyle } : {}),
  }

  return (
    <View testID={props.testID} style={styles}>
      {props.children}
    </View>
  )
}

export default Container
