/***
 *  Copyright (C) 2018 ConsenSys AG
 *
 *  This file is part of uPort Mobile App
 *  uPort Mobile App is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  uPort Mobile App is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  ERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ***/

import * as React from 'react'
import { Container, Text, Theme } from '@kancha'

interface SectionProps {
  title?: string
  sectionTitleType?: string
}

const Section: React.FunctionComponent<SectionProps> = props => {
  return (
    <Container marginTop={Theme.spacing.section}>
      <Container paddingLeft>
        <Text
          paddingBottom
          bold={!!props.sectionTitleType}
          type={props.sectionTitleType ? props.sectionTitleType : Text.Types.SectionHeader}
        >
          {props.title}
        </Text>
      </Container>
      <Container dividerTop dividerBottom background={'primary'}>
        {props.children}
      </Container>
    </Container>
  )
}

export default Section
