interface IndexSignature {
  [index: string]: any
}

interface TextDefaultThemeMapTypes extends IndexSignature {}

const COLORS = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  CHARCOAL: '#333333',
  LIGHTEST_GREY: '#EFEEF3',
  LIGHT_GREY: '#BBBBBB',
  MEDIUM_GREY: '#CCCCCC',
  DARK_GREY: '',
  ROYAL_PURPLE: '#6A54D1',
  CRIMSON_RED: '#D63A59',
  WASHED_GREEN: '#3DCF8A',
  SUNNY_ORANGE: '#E89835',
}

/**
 * Not implemented yet. A funtion so we can provide a theme color dictionary and generate the object
 */
const ThemeColor = (key: string) => {
  return {
    [key]: {
      brand: 'green',
      text: '#AAAAAA',
      background: '#efeef3',
      divider: '#CCCCCC',
      accessories: '#BBBBBB',
      underlay: '#CCCCCC',
      button: 'green',
      buttonText: {
        filled: '#FFFFFF',
        outlined: 'green',
        clear: 'green',
      },
    },
  }
}

/**
 * Base DefaultTheme file
 */
const DefaultTheme = {
  text: {
    lineHeights: {
      body: 22,
    },
    sizes: {
      h1: 32,
      h2: 24,
      h3: 20,
      h4: 18,
      h5: 16,
      h6: 14,
      subTitle: 14,
      listItem: 18,
      listItemRight: 18,
      listItemNote: 15,
      sectionHeader: 14,
      summary: 18,
      body: 16,
    },
  },
  colors: {
    primary: {
      brand: COLORS.ROYAL_PURPLE,
      text: COLORS.CHARCOAL,
      background: COLORS.WHITE,
      divider: COLORS.MEDIUM_GREY,
      accessories: COLORS.LIGHT_GREY,
      underlay: COLORS.MEDIUM_GREY,
      button: COLORS.ROYAL_PURPLE,
      buttonText: {
        filled: COLORS.WHITE,
        outlined: COLORS.ROYAL_PURPLE,
        clear: COLORS.ROYAL_PURPLE,
      },
    },
    secondary: {
      brand: COLORS.LIGHT_GREY,
      text: COLORS.LIGHT_GREY,
      background: COLORS.LIGHTEST_GREY,
      divider: COLORS.MEDIUM_GREY,
      accessories: COLORS.MEDIUM_GREY,
      underlay: COLORS.MEDIUM_GREY,
      button: COLORS.MEDIUM_GREY,
      buttonText: {
        filled: COLORS.WHITE,
        outlined: COLORS.MEDIUM_GREY,
        clear: COLORS.MEDIUM_GREY,
      },
    },
    tertiary: {
      brand: COLORS.LIGHT_GREY,
      text: COLORS.LIGHT_GREY,
      background: COLORS.LIGHT_GREY,
      divider: COLORS.LIGHT_GREY,
      accessories: COLORS.LIGHT_GREY,
      underlay: COLORS.LIGHT_GREY,
      button: COLORS.LIGHT_GREY,
      buttonText: {
        filled: COLORS.LIGHT_GREY,
        outlined: COLORS.LIGHT_GREY,
        clear: COLORS.LIGHT_GREY,
      },
    },
    accent: {
      text: COLORS.SUNNY_ORANGE,
      background: COLORS.SUNNY_ORANGE,
      divider: COLORS.SUNNY_ORANGE,
      accessories: COLORS.SUNNY_ORANGE,
      underlay: COLORS.SUNNY_ORANGE,
      button: COLORS.SUNNY_ORANGE,
      buttonText: {
        filled: COLORS.WHITE,
        outlined: COLORS.SUNNY_ORANGE,
        clear: COLORS.SUNNY_ORANGE,
      },
    },
    warning: {
      text: COLORS.CRIMSON_RED,
      background: COLORS.CRIMSON_RED,
      divider: COLORS.CRIMSON_RED,
      accessories: COLORS.CRIMSON_RED,
      underlay: COLORS.CRIMSON_RED,
      button: COLORS.CRIMSON_RED,
      buttonText: {
        filled: COLORS.WHITE,
        outlined: COLORS.CRIMSON_RED,
        clear: COLORS.CRIMSON_RED,
      },
    },
    confirm: {
      text: COLORS.WASHED_GREEN,
      background: COLORS.WASHED_GREEN,
      divider: COLORS.WASHED_GREEN,
      accessories: COLORS.WASHED_GREEN,
      underlay: COLORS.WASHED_GREEN,
      button: COLORS.WASHED_GREEN,
      buttonText: {
        filled: COLORS.WHITE,
        outlined: COLORS.WASHED_GREEN,
        clear: COLORS.WASHED_GREEN,
      },
    },
  },
  spacing: {
    default: 15,
    section: 20,
  },
  roundedCorners: {
    buttons: 5,
    cards: 5,
  },
  navigation: {},
}

/**
 * For RNN
 */
const NavigationThemeDefault = {
  largeTitle: false,
  navBarBackgroundColor: DefaultTheme.colors.primary.brand,
  navBarButtonColor: DefaultTheme.colors.primary.background,
  navBarTextColor: DefaultTheme.colors.primary.background,
}

/**
 * Append nav theming
 */
const Theme = DefaultTheme
Theme.navigation = NavigationThemeDefault

/**
 * Temporary implementaion.
 * Refactor later to make more succint.
 */
const TextTypes = {
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
  Summary: 'summary',
  SectionHeader: 'sectionHeader',
}

/**
 * Temportary implementaion. Refactor later to make more succint.
 * Just here to initially define each font style.
 * Padding size todo
 */
const TextThemeMap: TextDefaultThemeMapTypes = {
  h1: {
    fontSize: DefaultTheme.text.sizes.h1,
    color: DefaultTheme.colors.primary.text,
  },
  h2: {
    fontSize: DefaultTheme.text.sizes.h2,
    color: DefaultTheme.colors.primary.text,
  },
  h3: {
    fontSize: DefaultTheme.text.sizes.h3,
    color: DefaultTheme.colors.primary.text,
  },
  h4: {
    fontSize: DefaultTheme.text.sizes.h4,
    color: DefaultTheme.colors.primary.text,
  },
  h5: {
    fontSize: DefaultTheme.text.sizes.h5,
    color: DefaultTheme.colors.primary.text,
  },
  subTitle: {
    fontSize: DefaultTheme.text.sizes.subTitle,
    color: DefaultTheme.colors.secondary.text,
  },
  listItem: {
    fontSize: DefaultTheme.text.sizes.listItem,
    color: DefaultTheme.colors.primary.text,
  },
  listItemNote: {
    fontSize: DefaultTheme.text.sizes.listItemNote,
    color: DefaultTheme.colors.secondary.text,
  },
  listItemRight: {
    fontSize: DefaultTheme.text.sizes.listItemRight,
    color: DefaultTheme.colors.secondary.text,
  },
  summary: {
    fontSize: DefaultTheme.text.sizes.summary,
    color: DefaultTheme.colors.secondary.text,
  },
  body: {
    fontSize: DefaultTheme.text.sizes.body,
    color: DefaultTheme.colors.primary.text,
    lineHeight: DefaultTheme.text.lineHeights.body,
  },
  sectionHeader: {
    fontSize: DefaultTheme.text.sizes.sectionHeader,
    color: DefaultTheme.colors.secondary.text,
  },
}

export { TextThemeMap, Theme, TextTypes }
