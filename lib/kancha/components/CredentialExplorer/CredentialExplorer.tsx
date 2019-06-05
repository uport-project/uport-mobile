import React from 'react'
import String from 'string'
import { LayoutAnimation, NativeModules, Image, Linking } from 'react-native'
import { Container, ListItem, Text, Icon } from '@kancha'

import { normaliseClaimTree, ClaimTreeNormalised } from 'uPortMobile/lib/utilities/parseClaims'

const { UIManager } = NativeModules
/**
 * Android needs this for animations
 */
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)

/**
 * Examine the data type of the individual item in a claim and return the appropriate UI
 */

const parseContentValueItem = (contentItem: any) => {
  const imageUrlPattern = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g
  if (typeof contentItem === 'boolean') {
    return contentItem ? 'Yes' : 'No'
  } else if (typeof contentItem === 'number') {
    return contentItem
  } else if (typeof contentItem === 'string' && imageUrlPattern.test(contentItem)) {
    /**
     * Return null if we think it's an image url
     */
    return null
  } else if (typeof contentItem === 'string' && contentItem.startsWith('https://')) {
    return Linking.openURL(contentItem)
  } else if (typeof contentItem === 'string') {
    return contentItem
  }
  /**
   * Return false if nothing is found
   */
  return false
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
    LayoutAnimation.configureNext({
      duration: 500,
      create: { type: 'linear', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.8 },
      delete: { type: 'linear', property: 'opacity' },
    })

    this.setState((state: any) => {
      return {
        ...this.state,
        [stateKey]: !state[stateKey],
      }
    })
  }

  render() {
    /**
     * Normalise claim into predicatable array structure
     */
    const normalisedClaimTree: ClaimTreeNormalised[] = normaliseClaimTree(this.props.claim)

    /**
     * Function to check if we only have one key in the claim
     */
    const isOnlyKeyInClaim = (level: number): boolean => normalisedClaimTree.length === 1 && level === 0

    /**
     * Recursive function to iterate over a normalised claim to create an accordion
     */
    const collapsibleCredential = (claims: any[]) => {
      /**
       * Map through the normalised claim and produce UI
       */
      return claims.map((item: any, index: number) => {
        /**
         * Simple flags for UI to decise what to do with data types
         */
        const isObject = item.hasChildren && (this.state[item.key] || isOnlyKeyInClaim(item.level)) && !item.isList
        const isList = item.hasChildren && (this.state[item.key] || isOnlyKeyInClaim(item.level)) && item.isList
        const sectionClosed = item.hasChildren && (this.state[item.key] || isOnlyKeyInClaim(item.level))
        const sectionExpanded = item.hasChildren && !this.state[item.key]

        return (
          <Container key={item.key} flexDirection={'row'}>
            <Container w={item.level} backgroundColor={'#000000'} />
            <Container flex={1}>
              <ListItem
                disabled={!item.hasChildren}
                avatarComponent={
                  <Container>
                    <Icon size={20} name={sectionClosed ? 'remove' : sectionExpanded ? 'add' : ''} />
                  </Container>
                }
                last={true}
                hideForwardArrow
                onPress={() => this.revealChildren(item.key)}
                title={!item.hasChildren && item.title}>
                {!item.hasChildren
                  ? parseContentValueItem(item.value)
                  : isOnlyKeyInClaim(item.level)
                  ? item.keyName
                  : item.title}
              </ListItem>
              {parseContentValueItem(item.value) === null && (
                <Image source={{ uri: item.value }} style={{ height: 150 }} resizeMode={'cover'} />
              )}
              {isObject && collapsibleCredential(item.value)}
              {isList && (
                <Container dividerBottom={sectionExpanded}>
                  {item.value.map((listItem: any) => {
                    return (
                      <Container
                        key={listItem.key}
                        padding={5}
                        br={5}
                        viewStyle={{ shadowColor: '#000000', shadowRadius: 5, shadowOpacity: 0.1 }}>
                        {!listItem.isListItem && listItem.hasChildren && collapsibleCredential(listItem.value)}
                        {listItem.isListItem && !listItem.hasChildren && (
                          <Container flexDirection={'row'} br={5} flex={1}>
                            <Container w={item.level} backgroundColor={'#000000'} />
                            <Container flex={1}>
                              <ListItem last>{parseContentValueItem(listItem.value)}</ListItem>
                            </Container>
                          </Container>
                        )}
                      </Container>
                    )
                  })}
                </Container>
              )}
            </Container>
          </Container>
        )
      })
    }

    return collapsibleCredential(normalisedClaimTree)
  }
}

export default CredentialExplorer
