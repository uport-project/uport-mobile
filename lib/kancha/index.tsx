/**
 * Components
 */
import Container from './components/Container/Container'
import Icon from './components/Icon/Icon'
import Screen from './components/Screen/Screen'
import KanchaText from './components/Text/Text'
import ListItem from './components/ListItem/ListItem'
import Section from './components/Section/Section'

/**
 * Utilities
 */
import Device from './utilities/device'
import Strings from './utilities/strings'

/**
 * Theme & Constants
 */
import { Theme, TextThemeMap, TextTypes } from './themes/default'

const Text = KanchaText

export {
  /** Copmonents */
  Container,
  Icon,
  ListItem,
  Screen,
  Section,
  Text,
  TextTypes,
  /** Utilities */
  Device,
  Strings,
  /** Constants */
  /** Theme */
  Theme,
  TextThemeMap,
}
