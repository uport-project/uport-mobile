import * as React from 'react'
import { Image, TouchableOpacity, Linking } from 'react-native'
import { connect } from 'react-redux'
import { track } from 'uPortMobile/lib/actions/metricActions'
import { Container, Text, Card, Colors, Icon, Theme } from '@kancha'

export interface SignPostCardType {
  id: string
  title: string
  subtitle: string
  logo: string
  url: string
  headerColor: string
  content: {
    description?: string
    list?: string[]
    footNote?: string
  }
}

interface SignPostProps {
  card: SignPostCardType
  openURL: (request: any) => void
}

const SignPost: React.FC<SignPostProps> = props => {
  return (
    <Card marginBottom>
      <TouchableOpacity onPress={() => props.openURL(props.card)}>
        <Container
          padding
          backgroundColor={props.card.headerColor}
          flexDirection={'row'}
          alignItems={'flex-start'}
          justifyContent={'center'}>
          <Container marginRight>
            <Image source={{ uri: props.card.logo }} style={{ width: 40, height: 40, borderRadius: 5 }} />
          </Container>
          <Container flex={1}>
            <Text textColor={'#ffffff'} type={Text.Types.SubTitle}>
              {props.card.subtitle}
            </Text>
            <Text bold textColor={'#ffffff'} type={Text.Types.H3}>
              {props.card.title}
            </Text>
          </Container>
          <Icon name="externalLink" font="feather" color={'#ffffff'} />
        </Container>
      </TouchableOpacity>
      <Container flex={1} paddingTop paddingLeft paddingBottom paddingRight={30}>
        {props.card.content.description && (
          <Container>
            <Text>{props.card.content.description}</Text>
          </Container>
        )}
        {props.card.content.list && (
          <Container>
            {props.card.content.list.map((item: string) => {
              return (
                <Container key={item} marginBottom={10} flexDirection={'row'} alignItems={'center'}>
                  <Container marginRight>
                    <Icon size={20} name="checkbox_checked" color={Theme.colors.primary.accessories} />
                  </Container>
                  <Text textColor={Colors.DARK_GREY} type={Text.Types.ListItemNote}>
                    {item}
                  </Text>
                </Container>
              )
            })}
          </Container>
        )}
        {props.card.content.footNote && (
          <Container paddingTop>
            <Text type={Text.Types.ListItemNote}>{props.card.content.footNote}</Text>
          </Container>
        )}
      </Container>
    </Card>
  )
}


const mapStateToProps = (state: any, ownProps: any) => ownProps

const mapDispatchToProps = (dispatch: any) => ({
  openURL: (card: SignPostCardType) => {
    dispatch(track(`Opened linked ${card.id}`))
    Linking.openURL(card.url)
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignPost)
