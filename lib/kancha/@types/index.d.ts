/**
 * Namespace decalaration for Global Kancha Types
 */

declare namespace Kancha {
  export interface TextTypesStatic {
    H1: 'h1'
    H2: 'h2'
    H3: 'h3'
    H4: 'h4'
    H5: 'h5'
    ListItem: 'listItem'
    ListItemRight: 'listItemRight'
    ListItemNote: 'listItemNote'
    SubTitle: 'subTitle'
    Body: 'body'
    Button: 'button'
    NavButton: 'navButton'
    Summary: 'summary'
    SectionHeader: 'sectionHeader'
  }

  export interface BrandTypeStatic {
    Primary: 'primary'
    Secondary: 'secondary'
    Tertiary: 'tertiary'
    Accent: 'accent'
    Warning?: 'warning'
    Confirm?: 'confirm'
    Custom?: 'custom'
  }

  export type BrandPropOptions =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'accent'
    | 'warning'
    | 'confirm'
    | 'custom'
    | undefined
  export type BlockPropsOptions = 'outlined' | 'filled' | 'clear' | undefined

  export interface ScreenConfigsStatic {
    SafeScroll: 'safeScroll'
    SafeNoScroll: 'safeNoScroll'
    Scroll: 'scroll'
    NoScroll: 'noScroll'
    NoSafeNoScroll: 'noSafeNoScroll'
  }

  export interface BlocksStatic {
    Outlined: 'outlined'
    Filled: 'filled'
    Clear: 'clear'
  }

  export interface ThemeStatic {
    text: {
      lineHeights: {
        body: number
      }
      sizes: {
        h1: number
        h2: number
        h3: number
        h4: number
        h5: number
        h6: number
        subTitle: number
        listItem: number
        listItemRight: number
        listItemNote: number
        sectionHeader: number
        summary: number
        body: number
        button: number
        navButton: number
      }
    }
    colors: {
      [index: string]: {
        brand: string
        text: string
        background: string
        divider: string
        accessories: string
        underlay: string
        button: string
        buttonText: {
          filled: string
          outlined: string
          clear: string
        }
      }
    }
    spacing: {
      default: number
      section: number
    }
    roundedCorners: {
      buttons: number
      cards: number
      textInputs: number
    }
    navigation: any
  }
}
