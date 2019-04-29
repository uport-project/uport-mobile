import * as React from 'react'
import { Container, Text, ListItem, Screen, Section } from '@kancha'
import SCREENS from 'uPortMobile/lib/screens/Screens'
import { Navigation } from 'react-native-navigation'

interface FakeAvatarProps {}

const FakeAvatar: React.FC<FakeAvatarProps> = props => {
  return <Container w={40} h={40} background={'secondary'} br={4} />
}

class DesignSystem extends React.Component<any> {
  render() {
    return (
      <Screen>
        <Container flex={1}>
          <Section>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                Navigation.showModal({
                  component: {
                    name: SCREENS.StaticRequest,
                    options: {
                      topBar: {
                        visible: false,
                      },
                    },
                  },
                })
              }}
              title={'First draft'}
            >
              Basic Request Card
            </ListItem>
          </Section>
          <Section title={'LIST ITEMS'}>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                1 === 1
              }}
              accessoryRight={'22 ETH'}
            >
              Advanced
            </ListItem>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                1 === 1
              }}
              accessoryRight={'Content'}
            >
              Privacy
            </ListItem>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                1 === 1
              }}
            >
              General
            </ListItem>
            <ListItem
              last
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                1 === 1
              }}
            >
              Back Up
            </ListItem>
          </Section>
          <Section title={'LIST ITEMS'}>
            <ListItem>Static list item</ListItem>
            <ListItem>Static list item</ListItem>
            <ListItem>Static list item</ListItem>
            <ListItem last>Static list item</ListItem>
          </Section>
          <Section title={'TYPEOGRAPHY'}>
            <Container padding>
              <Text type={Text.Types.H1}>Heading 1</Text>
            </Container>
            <Container padding>
              <Text type={Text.Types.H2}>Heading 2</Text>
            </Container>
            <Container padding>
              <Text type={Text.Types.H3}>Heading 3</Text>
            </Container>
            <Container padding>
              <Text type={Text.Types.H4}>Heading 4</Text>
            </Container>
            <Container padding>
              <Text type={Text.Types.H5}>Heading 5</Text>
            </Container>
            <Container padding>
              <Text type={Text.Types.Body}>Body Text</Text>
            </Container>

            <Container padding>
              <Text type={Text.Types.ListItem}>List Item</Text>
            </Container>
            <Container padding>
              <Text type={Text.Types.Summary}>Summary Text</Text>
            </Container>
            <Container padding>
              <Text type={Text.Types.SectionHeader}>Section Header</Text>
            </Container>
            <Container padding>
              <Text type={Text.Types.ListItemNote}>List Item Note</Text>
            </Container>
          </Section>
        </Container>
      </Screen>
    )
  }
}

export default DesignSystem
