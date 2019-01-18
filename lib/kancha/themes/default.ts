interface IndexSignature {
  [index: string]: any;
}

interface TextThemeMapTypes extends IndexSignature {}

/**
 * Base theme file
 */
const Theme: IndexSignature = {
  text: {
    sizes: {
      h1: 28,
      h2: 24,
      h3: 20,
      h4: 18,
      h5: 16,
      h6: 14,
      listItem: 18,
      listItemRight: 18,
      listItemNote: 15,
      sectionHeader: 14,
      summary: 18,
      body: 16,
    },
  },
  colors: {
    warning: 'red',
    confirm: 'green',
    primary: {
      brand: '#5C50CA',
      text: '#333333',
      background: '#FFFFFF',
      divider: '#CCCCCC',
      accessories: '#BBBBBB',
      underlay: '#CCCCCC',
    },
    secondary: {
      brand: 'green',
      text: '#AAAAAA',
      background: '#F6F7F8',
      divider: '#CCCCCC',
      accessories: '#BBBBBB',
      underlay: '#CCCCCC',
    },
    accent: {
      text: '#AAAAAA',
      background: '#F6F7F8',
      divider: '#CCCCCC',
      accessories: '#BBBBBB',
    },
  },
  spacing: {
    default: 15,
    section: 20,
  },
}

/**
 * Temportary implementaion. Refactor later to make more succint.
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
  Body: 'body',
  Summary: 'summary',
  SectionHeader: 'sectionHeader',
}

/**
 * Temportary implementaion. Refactor later to make more succint. Just here to initially define each font style.
 */
const TextThemeMap: TextThemeMapTypes = {
  h1: {
    fontSize: Theme.text.sizes.h1,
    color: Theme.colors.primary.text,
    paddingBottom: Theme.text.sizes.h1 * 0.20,
  },
  h2: {
    fontSize: Theme.text.sizes.h2,
    color: Theme.colors.primary.text,
    paddingBottom: Theme.text.sizes.h2 * 0.20,
  },
  h3: {
    fontSize: Theme.text.sizes.h3,
    color: Theme.colors.primary.text,
    paddingBottom: Theme.text.sizes.h3 * 0.20,
  },
  h4: {
    fontSize: Theme.text.sizes.h4,
    color: Theme.colors.primary.text,
    paddingBottom: Theme.text.sizes.h4 * 0.20,
  },
  h5: {
    fontSize: Theme.text.sizes.h5,
    color: Theme.colors.primary.text,
    paddingBottom: Theme.text.sizes.h5 * 0.20,
  },
  listItem: {
    fontSize: Theme.text.sizes.listItem,
    color: Theme.colors.primary.text,
    paddingBottom: Theme.text.sizes.listItem * 0.20,
  },
  listItemNote: {
    fontSize: Theme.text.sizes.listItemNote,
    color: Theme.colors.secondary.text,
  },
  listItemRight: {
    fontSize: Theme.text.sizes.listItemRight,
    color: Theme.colors.secondary.text,
  },
  summary: {
    fontSize: Theme.text.sizes.summary,
    color: Theme.colors.secondary.text,
    paddingBottom: Theme.text.sizes.summary * 0.20,
  },
  body: {
    fontSize: Theme.text.sizes.body,
    color: Theme.colors.primary.text,
    paddingBottom: Theme.text.sizes.body * 0.20,
  },
  sectionHeader: {
    fontSize: Theme.text.sizes.sectionHeader,
    color: Theme.colors.secondary.text,
    paddingBottom: Theme.text.sizes.sectionHeader * 0.20,
  },
}

export {
  TextThemeMap, Theme, TextTypes,
}
