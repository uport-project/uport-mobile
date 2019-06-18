import * as React from 'react'
import { Image } from 'react-native'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import { Screen, Container, Text, Card, Credential, Theme, Colors, Icon, SignPost } from '@kancha'

import { ownClaims } from 'uPortMobile/lib/selectors/identities'
import { parseClaimItem, extractClaimType } from 'uPortMobile/lib/utilities/parseClaims'
import { onlyLatestAttestationsWithIssuer } from 'uPortMobile/lib/selectors/attestations'

import SCREENS from './Screens'

interface SignPostCard {
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

const SIGN_POSTS = [
  {
    id: 'uportlandia',
    title: 'Visit uPortlandia',
    subtitle: 'Get your first credential',
    logo: 'https://uport-mobile-store.s3.us-east-2.amazonaws.com/static-assets/uportlandia-logo.png',
    url: 'https://',
    headerColor: '#6A54D1',
    content: {
      list: [
        'Discover how to manage your data with uPort',
        'Connect with services and build network that you fully control',
        'Request, recieve and share information about yourself',
      ],
    },
  },
  {
    id: 'onfido',
    title: 'Get OnFido ID',
    subtitle: 'Get verified in 5 minutes',
    url: 'https://',
    logo: 'https://uport-mobile-store.s3.us-east-2.amazonaws.com/static-assets/onfido-logo.png',
    headerColor: '#3640f5',
    content: {
      description: 'Verify yourself to to get one-click access to financial services',
      footNote: 'Did you know????',
    },
  },
]

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = props => {
  const signPosts = SIGN_POSTS.map((card: SignPostCard) => {
    return <SignPost key={card.id} card={card} />
  })

  return (
    <Screen>
      <Container padding>{signPosts}</Container>
    </Screen>
  )
}

const mapStateToProps = (state: any) => {
  return {
    credentials: onlyLatestAttestationsWithIssuer(state),
  }
}

export const mapDispatchToProps = (dispatch: any) => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Dashboard)
