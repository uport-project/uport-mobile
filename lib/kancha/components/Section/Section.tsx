import * as React from 'react';
import { Container, Text, TextTypes, Theme } from '@kancha';

interface SectionProps {
  title?: string;
}

const Section: React.FunctionComponent<SectionProps> = (props) => {
  return (
    <Container marginTop={Theme.spacing.section}>
      <Container paddingLeft>
        <Text type={TextTypes.SectionHeader}>{ props.title }</Text>
      </Container>
      <Container dividerTop dividerBottom background={'primary'}>{props.children}</Container>
    </Container>
  )
}

export default Section;
