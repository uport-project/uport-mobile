/**
 * Components
 */
import Container from './components/Container/Container';
import Icon from './components/Icon/Icon';
import Screen from './components/Screen/Screen';
import KanchaText from './components/Text/Text';
import ListItem from './components/ListItem/ListItem';
import Section from './components/Section/Section';

/**
 * Theme & Constants
 */
import { Theme, TextThemeMap, TextTypes } from './themes/default'

const Text = KanchaText;

export {
  /** Copmonents */
  Container,
  Icon,
  ListItem,
  Screen,
  Section,
  KanchaText as Text,
  TextTypes,

   /** Utilities */
   /** Constants */
   /** Theme */
   Theme,
   TextThemeMap,
}
