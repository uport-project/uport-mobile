/**
 * Namespace decalaration for Global Kancha Typs
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
  }

  export interface BlocksStatic {
    Outlined: 'outlined'
    Filled: 'filled'
    Clear: 'clear'
  }
}
