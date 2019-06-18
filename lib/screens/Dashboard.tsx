import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Screen, Container, Text, Card, Credential, Theme, Colors, Icon, SignPost, SignPostCardType } from '@kancha'
import SCREENS from './Screens'
import { parseClaimItem } from 'uPortMobile/lib/utilities/parseClaims'
import { onlyLatestAttestationsWithIssuer } from 'uPortMobile/lib/selectors/attestations'

interface DashboardProps {
  credentials: any[]
  componentId: string
}

const fetchSignPosts = async (updater: (response: any) => void) => {
  const response = await fetch(
    'https://uport-mobile-store.s3.us-east-2.amazonaws.com/dashboard-signposts/signposts.json',
  )
  const json = await response.json()

  updater(json)
}

const Dashboard: React.FC<DashboardProps> = props => {
  const [signPosts, updateSignPosts] = useState([])
  const showSignPosts =
    signPosts.length > 0 &&
    props.credentials.length === 0 &&
    signPosts.map((card: SignPostCardType) => {
      return <SignPost key={card.id} card={card} />
    })

  useEffect(() => {
    fetchSignPosts(updateSignPosts)
  }, [])

  const showCredentials = props.credentials.map(credential => {
    const { claimCardHeader } = parseClaimItem(credential)

    return (
      <Container key={credential.token} marginBottom>
        <Credential
          componentId={props.componentId}
          screen={SCREENS.Credential}
          verification={credential}
          claimType={claimCardHeader}
          issuer={credential.issuer}
          noMargin
        />
      </Container>
    )
  })
  return (
    <Screen>
      <Container padding>
        {showSignPosts}
        {showCredentials}
      </Container>
    </Screen>
  )
}

const mapStateToProps = (state: any) => {
  return {
    credentials: onlyLatestAttestationsWithIssuer(state),
  }
}

export default connect(mapStateToProps)(Dashboard)
