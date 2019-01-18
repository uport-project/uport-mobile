import * as React from 'react';
import { Text, TextStyle } from 'react-native';
import { TextThemeMap, TextTypes } from '@kancha';

 /**
  * Kancha Text Props
  */
interface KanchaTextProps {

  /**
   * The type of text to display. This will be styled accordinly to the theme
   */
  type: string;

  /**
   * Make the text bold
   */
  bold?: boolean;

  /**
   * The padding around the text
   */
  padding?: number;

  /**
   * The margin around the text
   */
  margin?: number;
}

const KanchaText: React.FC<KanchaTextProps> = (props) => {

  const styles: TextStyle = {
    ...TextThemeMap[props.type],
    fontWeight: props.bold && 'bold',
  }

  return <Text style={styles}>{props.children}</Text>
}

export default KanchaText;
