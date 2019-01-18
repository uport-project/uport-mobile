import * as React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Theme } from '@kancha';

interface ContainerProps {
  /** Test ID used for e2e tests */
  testID?: string;

  /** Width */
  w?: string | number | undefined;

  /** Height */
  h?: string | number | undefined;

  /** Flex */
  flex?: number | undefined;

  background?: ( 'primary' | 'secondary' | undefined);

  /** Flex direction */
  flexDirection?:
    | 'row'
    | 'column'
    | 'row-reverse'
    | 'column-reverse'
    | undefined;

  /** Align items */
  alignItems?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'baseline'
    | undefined;

  /** Justify Content */
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | undefined;

  /** Set the bottom divider */
  dividerBottom?: boolean;

   /** et the top divider */
  dividerTop?: boolean;

  /** Set the bottom margin */
  marginBottom?: number | boolean | undefined;

  /** Set the top margin */
  marginTop?: number | boolean | undefined;

  /** Set the bottom margin */
  marginLeft?: number | boolean | undefined;

  /** Set the top margin */
  marginRight?: number | boolean | undefined;

  /** Set the bottom padding */
  paddingBottom?: number | boolean | undefined;

  /** Set the top padding */
  paddingTop?: number | boolean | undefined;

  /** Set the left padding */
  paddingLeft?: number | boolean | undefined;

  /** Set the right padding */
  paddingRight?: number | boolean | undefined;

  /** Enable border for debugging layouts */
  debugBorder?: boolean;

  /** Change debug border color */
  debugBorderColor?: string | undefined;

}

const Container: React.FunctionComponent<ContainerProps> = (props) => {

  const DividerBottomStyles: ViewStyle = {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.primary.divider,
  }

  const DividerTopStyles: ViewStyle = {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.colors.primary.divider,
  }

  const BaseStyles: ViewStyle = {
    width: props.w,
    height: props.h,
    flex: props.flex,
    flexDirection: props.flexDirection,
    alignItems: props.alignItems,
    justifyContent: props.justifyContent,
    backgroundColor: props.background && Theme.colors[props.background].background,

    /** Margins */
    marginBottom: typeof props.marginBottom === 'boolean' ? Theme.spacing.default : props.marginBottom,
    marginTop: typeof props.marginTop === 'boolean' ? Theme.spacing.default : props.marginTop,
    marginLeft: typeof props.marginLeft === 'boolean' ? Theme.spacing.default : props.marginLeft,
    marginRight: typeof props.marginRight === 'boolean' ? Theme.spacing.default : props.marginRight,

    /** Paddings */
    paddingBottom: typeof props.paddingBottom === 'boolean' ? Theme.spacing.default : props.paddingBottom,
    paddingTop: typeof props.paddingTop === 'boolean' ? Theme.spacing.default : props.paddingTop,
    paddingLeft: typeof props.paddingLeft === 'boolean' ? Theme.spacing.default : props.paddingLeft,
    paddingRight: typeof props.paddingRight === 'boolean' ? Theme.spacing.default : props.paddingRight,
  };

  /** Conditionally spread styles down to the View */
  const styles: ViewStyle = {
   ...BaseStyles,
   ...(props.dividerBottom ? DividerBottomStyles : {}),
   ...(props.dividerTop ? DividerTopStyles : {}),
  }

  return <View testID={props.testID} style={styles}>{props.children}</View>;
};

export default Container;
