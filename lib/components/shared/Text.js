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
import React from 'react'
import PropTypes from 'prop-types'
import { Text, View } from 'react-native'
import { defaultTheme } from 'uPortMobile/lib/styles'

const CustomText = (props, context) => {
  const { styles } = context.theme ? context.theme : defaultTheme
  const style = [
    styles.default,
    props.h1 && styles.h1,
    props.title && styles.title,
    props.subTitle && styles.subTitle,
    props.p && styles.p,
    props.legal && styles.legal,
    props.infoButtonLabel && styles.infoButtonLabel,
    props.checkBoxLabel && styles.checkBoxLabel,
    props.tabBarLabel  && styles.tabBarLabel,

    props.seedPhraseTitle && styles.seedPhraseTitle,
    props.seedPhraseWord && styles.seedPhraseWord,
    props.seedPhraseNumber && styles.seedPhraseNumber,
    props.seedConfirmButtonLabel && styles.seedConfirmButtonLabel,
    props.invert && styles.invert,
    props.secondary && styles.secondary,
    props.bold && styles.bold,
    props.noMargin && styles.noMargin,
    props.statusBar && styles.statusBar,
    props.sectionTitle && styles.sectionTitle,
    
    props.style,
  ]

  if (props.li) {
    return (
      <View style={styles.li}>
        <Text style={style}>{'\u2022'}</Text>
        <Text style={[...style, styles.liText]}>
          {props.children}
        </Text>
      </View>
    )
  }

  return (
    <Text style={style}>
      {props.children}
    </Text>
  )
}

CustomText.propTypes = {
  title: PropTypes.bool,
  p: PropTypes.bool,
  legal: PropTypes.bool,
  infoButtonLabel: PropTypes.bool,
  checkBoxLabel: PropTypes.bool,
}

CustomText.contextTypes = {
  theme: PropTypes.object
}


export default CustomText
