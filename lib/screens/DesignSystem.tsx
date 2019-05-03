import * as React from 'react'
import { Container, Text, ListItem, Screen, Section, Button, Credential } from '@kancha'
import SCREENS from 'uPortMobile/lib/screens/Screens'
import { Navigation } from 'react-native-navigation'

interface FakeAvatarProps {}

const FakeAvatar: React.FC<FakeAvatarProps> = props => {
  return <Container w={40} h={40} background={'secondary'} br={4} />
}

class DesignSystem extends React.Component<any> {
  onPress = () => {
    return null
  }

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
              title={'First draft'}>
              Basic Request Card
            </ListItem>
          </Section>
          <Section title={'LIST ITEMS'}>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                1 === 1
              }}
              accessoryRight={'22 ETH'}>
              Advanced
            </ListItem>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                1 === 1
              }}
              accessoryRight={'Content'}>
              Privacy
            </ListItem>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                1 === 1
              }}>
              General
            </ListItem>
            <ListItem
              last
              avatarComponent={<FakeAvatar />}
              onPress={() => {
                1 === 1
              }}>
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
          <Section title={'BUTTONS FILLED'}>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Filled}
                type={Button.Types.Primary}
                buttonText={'Primary Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Filled}
                type={Button.Types.Secondary}
                buttonText={'Secondary Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Filled}
                type={Button.Types.Confirm}
                buttonText={'Confirm Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Filled}
                type={Button.Types.Warning}
                buttonText={'Warn Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Filled}
                type={Button.Types.Accent}
                buttonText={'Accent Button'}
                onPress={this.onPress}
              />
            </Container>
          </Section>
          <Section title={'BUTTONS OUTLINED'}>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Outlined}
                type={Button.Types.Primary}
                buttonText={'Primary Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Outlined}
                type={Button.Types.Secondary}
                buttonText={'Secondary Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Outlined}
                type={Button.Types.Confirm}
                buttonText={'Confirm Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Outlined}
                type={Button.Types.Warning}
                buttonText={'Warn Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Outlined}
                type={Button.Types.Accent}
                buttonText={'Accent Button'}
                onPress={this.onPress}
              />
            </Container>
          </Section>
          <Section title={'BUTTONS CLEAR'}>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Clear}
                type={Button.Types.Primary}
                buttonText={'Primary Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Clear}
                type={Button.Types.Secondary}
                buttonText={'Secondary Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Clear}
                type={Button.Types.Confirm}
                buttonText={'Confirm Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Clear}
                type={Button.Types.Warning}
                buttonText={'Warn Button'}
                onPress={this.onPress}
              />
            </Container>
            <Container alignItems={'center'} padding>
              <Button
                fullWidth
                block={Button.Block.Clear}
                type={Button.Types.Accent}
                buttonText={'Accent Button'}
                onPress={this.onPress}
              />
            </Container>
          </Section>
          <Section title={'CREDENTIALS'}>
            <Container marginBottom>
              <Credential
                claimType={'Standard Credential'}
                issuer={{
                  name: 'Uport Apps Team',
                  avatar: { uri: 'https://cloudflare-ipfs.com/ipfs/QmdxTrTSiQGY8GzY2wLJzWcuRcV3jKfLjFGWnc3fsUk1bK' },
                }}
              />
            </Container>
            <Container marginBottom>
              <Credential claimType={'Missing Credential'} issuer={{ name: 'Uport Apps Team' }} missing spec={{}} />
            </Container>
            <Container marginBottom>
              <Credential
                claimType={'Missing Credential'}
                issuer={{ name: 'Uport Apps Team' }}
                missing
                spec={{ essential: false, reason: 'Not required but we can still give a reason' }}
              />
            </Container>
            <Container marginBottom>
              <Credential
                claimType={'Required Credential'}
                issuer={{ name: 'Uport Apps Team' }}
                missing
                spec={{ essential: true }}
              />
            </Container>
            <Container marginBottom>
              <Credential
                claimType={'Required Credential'}
                issuer={{ name: 'Uport Apps Team' }}
                missing
                spec={{
                  essential: true,
                  reason: "I'll tell you why. We can put a reason down here.",
                  iss: [{ did: 'did:web:uport.claims', url: 'https://uport.claims/email' }],
                }}
              />
            </Container>
          </Section>
        </Container>
      </Screen>
    )
  }
}

export default DesignSystem
