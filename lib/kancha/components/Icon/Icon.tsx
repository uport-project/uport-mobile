import * as React from 'react';
import { Platform } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const IconSets: { [index: string]: any } = {
  ionicons: Ionicons,
  feather: Feather,
};

interface IconProps {
  /** Name of the icon font eg. ionicons, fontawesome */
  font?: string;

  /** Name of the icon from the set */
  name: string;

  /** The size of the icon */
  size?: number;

  /** The color of the icon */
  color?: string;
}

/**
 * A definitive list of Icons to be listed here
 */
const Icons: { [index: string]: any } = {
  forward: Platform.OS === 'ios' ? 'ios-arrow-forward' : 'md-arrow-forward',
  link: Platform.OS === 'ios' ? 'ios-link' : 'md-link',
}

const Icon: React.FunctionComponent<IconProps> = ({
  font,
  name,
  size,
  color,
}: IconProps) => {
  const IconFont = font ? IconSets[font] : Ionicons;
  return <IconFont name={Icons[name]} size={size} color={color} />;
};

Icon.defaultProps = {
  size: 26,
  color: 'black',
  name: 'ionicons',
};

export default Icon;
