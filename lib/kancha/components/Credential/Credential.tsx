import * as React from 'react'
import { TouchableOpacity, TouchableHighlight, Linking, ViewStyle } from 'react-native'
import { Container, Text, Domain, Issuer, Icon } from '@kancha'
import { Navigation } from 'react-native-navigation'

/**
 * Use existing Avatar until its rewritten
 */
import Avatar from 'uPortMobile/lib/components/shared/Avatar'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import { Theme } from '../../themes/default'

interface CredentialProps {
  claimType: string
  missing?: boolean
  screen?: string
  componentId?: string
  verification?: any
  issuer?: any
  spec?: any
}

const Credential: React.FC<CredentialProps> = props => {
  // console.tron.log(props)

  const baseStyle = {
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  }

  const shadow = {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  }

  const border = {
    borderWidth: 1,
    borderColor: Theme.colors.primary.accessories,
  }

  const requiredBorder = {
    // @ts-ignore
    borderStyle: 'dotted',
    borderColor: Theme.colors.warning.accessories,
  }

  const style: ViewStyle = {
    ...baseStyle,
    ...(props.missing ? border : shadow),
    ...(props.spec && props.spec.essential ? requiredBorder : {}),
  }

  return (
    <TouchableOpacity
      style={style}
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
            backgroundColor={
              props.missing && props.spec && props.spec.essential
                ? Theme.colors.warning.background
                : props.missing
                ? Theme.colors.secondary.background
                : Theme.colors.primary.brand
            }
            viewStyle={{ borderBottomLeftRadius: 5, borderTopLeftRadius: 5 }}
          >
            {props.issuer ? (
              <Container padding={3} backgroundColor={Theme.colors.primary.background} br={4}>
                <Avatar size={40} source={props.issuer} />}
              </Container>
            ) : (
              <Container padding={3} w={40} />
            )}
          </Container>
          <Container flex={1}>
            <Container paddingLeft paddingTop paddingBottom>
              <Container paddingBottom={5}>
                <Text type={Text.Types.H4} bold>
                  {capitalizeFirstLetter(props.claimType)}
                </Text>
              </Container>
              {!props.missing && <Text type={Text.Types.SubTitle}>{props.issuer && props.issuer.name}</Text>}
              {props.missing && !props.spec.essential && (
                <Text type={Text.Types.SubTitle}>Optional / Missing credential?</Text>
              )}
              {props.missing && props.spec.essential && (
                <Text type={Text.Types.SubTitle} warn>
                  Required Credential
                </Text>
              )}
              {props.spec && props.spec.reason && (
                <Container paddingTop>
                  <Text type={Text.Types.Body}>{props.spec.reason}</Text>
                </Container>
              )}
            </Container>
            {props.spec && props.spec.iss && (
              <Container paddingTop>
                <Container paddingLeft paddingBottom={8}>
                  <Text type={Text.Types.SubTitle}>Apply for credential</Text>
                </Container>
                {props.spec.iss
                  .filter((iss: any) => iss.url)
                  .map((iss: any) => {
                    return (
                      <TouchableHighlight
                        key={iss.did}
                        onPress={() => Linking.openURL(iss.url)}
                        underlayColor={Theme.colors.primary.underlay}
                      >
                        <Container
                          flexDirection={'row'}
                          paddingLeft
                          dividerTop
                          justifyContent={'space-between'}
                          padding
                        >
                          <Text>{Domain(iss.url)}</Text>
                          <Icon name={'link'} color={Theme.colors.primary.accessories} size={18} />
                        </Container>
                      </TouchableHighlight>
                    )
                  })}
              </Container>
            )}
          </Container>
        </Container>
      </Container>
    </TouchableOpacity>
  )
}

Credential.defaultProps = {
  missing: false,
}

export default Credential
