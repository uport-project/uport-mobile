import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { Container, Text } from '@kancha'
import { Navigation } from 'react-native-navigation'

/**
 * Use existing Avatar until its rewritten
 */
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import { Theme } from '../../themes/default'

interface CredentialProps {
  claimType: string
  missing: boolean
  screen?: string
  componentId?: string
  verification?: any
  issuer?: any
  spec?: any
}

const Credential: React.FC<CredentialProps> = props => {
  return (
    <TouchableOpacity
      style={{
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        margin: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
      }}
      disabled={props.missing}
      onPress={() =>
        props.screen &&
        props.componentId &&
        Navigation.push(props.componentId, {
          component: {
            name: props.screen,
            passProps: { verification: props.verification, claimType: props.claimType },
          },
        })
      }
    >
      <Container>
        <Container flexDirection={'row'}>
          <Container
            alignItems={'center'}
            padding
            backgroundColor={Theme.colors.primary.brand}
            viewStyle={{ borderBottomLeftRadius: 5, borderTopLeftRadius: 5 }}
          >
            <Avatar size={40} source={props.issuer} />
          </Container>
          <Container paddingLeft justifyContent={'center'}>
            <Container paddingBottom={5}>
              <Text type={Text.Types.H4} bold>
                {capitalizeFirstLetter(props.claimType)}
              </Text>
            </Container>
            <Text type={Text.Types.SubTitle} warn={props.missing}>
              {props.missing
                ? (props.spec && props.spec.reason) || 'Missing Credential'
                : props.issuer && props.issuer.name}
            </Text>
          </Container>
        </Container>
      </Container>
    </TouchableOpacity>
  )
}

export default Credential
