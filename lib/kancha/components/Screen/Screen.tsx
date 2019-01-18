import * as React from 'react';
import { SafeAreaView, ScrollView } from 'react-native'
import { Container, Theme } from '@kancha';

interface ScreenProps {
  safeAreaView?: boolean;
  type?: 'primary' | 'secondary' | undefined;
}

const Screen: React.FunctionComponent<ScreenProps> = (props) => {
  return props.safeAreaView ? (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ backgroundColor: props.type && Theme.colors[props.type].background }}>
        <Container flex={1} background={props.type}>{props.children}</Container>
      </ScrollView>
    </SafeAreaView>
  ) : <Container flex={1}>{props.children}</Container>
}

Screen.defaultProps = {
  safeAreaView: true,
  type: 'secondary',
}

export default Screen;
