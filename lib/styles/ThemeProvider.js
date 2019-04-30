// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//
import React, { Children } from 'react'
import PropTypes from 'prop-types'
import { connect, Provider } from 'react-redux'
import { darkColors, lightColors} from './colors'
import { darkStyles, lightStyles} from './styles'
import metrics from './metrics'

class ThemeProvider extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    dark: PropTypes.bool,
  }

  static defaultProps = {
    dark: true,
  }

  static childContextTypes = {
    theme: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      theme: this.createTheme(props),
    }
    this.setNavigatorStyle(props, this.state.theme)
  }

  getChildContext() {
    return {
      theme: this.state.theme,
    }
  }

  setNavigatorStyle(props, theme) {
    if (this.props.children.props.navigator) {
      this.props.children.props.navigator.setStyle({
        navBarNoBorder: true,
        navBarTextFontFamily: theme.metrics.font.name,
        statusBarTextColorSchemeSingleScreen: props.dark ? 'light' : 'dark',
        statusBarBlur: true,
        navBarTextColor: theme.colors.primary,
        navBarButtonColor: theme.colors.brand,
        navBarBackgroundColor: theme.colors.background,
      })
    }
}

  componentWillReceiveProps(nextProps) {
    if (nextProps.dark !== this.props.dark) {
      const theme = this.createTheme(nextProps)
      this.setNavigatorStyle(nextProps, theme)
      this.setState({ theme })      
    }
  }

  createTheme(props) {
    return {
      isDark: props.dark,
      colors: props.dark ? darkColors : lightColors,
      styles: props.dark ? darkStyles : lightStyles,
      metrics: metrics
    }
  }

  render() {
    const { children } = this.props

    return Children.only(children)
  }
}

const ConnectedThemeProvider =  connect((state) => ({
  dark: state.flags && state.flags.darkTheme === true,
}))(ThemeProvider)

export const connectTheme = (Component) => {
  Component.contextTypes = {
    theme: PropTypes.object
  }
  
  return class ConectedComponent extends React.Component {
    render() {
      return (
        <ConnectedThemeProvider>
          <Component {...this.props}/>
        </ConnectedThemeProvider>
      )
    }
  }

}