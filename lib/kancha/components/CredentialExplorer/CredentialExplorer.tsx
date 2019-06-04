import React from 'react'
import String from 'string'
import { Container, ListItem } from '@kancha'

const parseClaim = (claimObject: any, level: number = 0): any[] => {
  return Object.keys(claimObject).map((k: string, i: number) => {
    const parsedKeyName = String(k)
      .humanize()
      .titleCase().s

    if (typeof claimObject[k] === 'object') {
      return {
        level,
        key: level + i + k.toLowerCase(),
        title: parsedKeyName,
        hasChildren: true,
        value: parseClaim(claimObject[k], level + 1),
      }
    }
    return {
      level,
      key: level + i + k.toLowerCase(),
      title: parsedKeyName,
      hasChildren: false,
      value: claimObject[k],
    }
  })
}

interface CredentialExplorerProps {
  claim: any
}

interface CredentialExplorerState {
  [index: string]: boolean
}

class CredentialExplorer extends React.Component<CredentialExplorerProps, CredentialExplorerState> {
  constructor(props: CredentialExplorerProps) {
    super(props)

    this.state = {}
  }

  revealChildren(stateKey: string) {
    this.setState((state: any) => {
      return {
        ...this.state,
        [stateKey]: !state[stateKey],
      }
    })
  }

  render() {
    const parsedClaim = parseClaim(this.props.claim)
    const shouldbeOpen = parsedClaim.length === 1

    const collapsibleCredential = (claims: any[]) => {
      return claims.map((item: any, index: number) => {
        return (
          <Container key={item.key} flexDirection={'row'}>
            <Container w={item.level} backgroundColor={'#000000'} />
            <Container flex={1}>
              <ListItem
                hideForwardArrow
                onPress={() => this.revealChildren(item.key)}
                accessoryRight={!item.hasChildren && item.value}>
                {item.title}
              </ListItem>
              {item.hasChildren && (this.state[item.key] || shouldbeOpen) && collapsibleCredential(item.value)}
            </Container>
          </Container>
        )
      })
    }

    return collapsibleCredential(parsedClaim)
  }
}

export default CredentialExplorer
