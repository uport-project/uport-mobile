import React from 'react'
import String from 'string'
import { LayoutAnimation, NativeModules, Image, Linking } from 'react-native'
import { Container, ListItem, Text, Icon } from '@kancha'

import {
  normaliseClaimTree,
  ClaimTreeNormalised,
  isTopLevelSingleKey,
  renderCrendentialItem,
} from 'uPortMobile/lib/utilities/parseClaims'

const { UIManager } = NativeModules

/**
 * Android needs this for animations
 */
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)

interface CredentialExplorerProps {
  claim: any
}

interface CredentialExplorerState {
  [index: string]: boolean
}

class CredentialExplorer extends React.Component<CredentialExplorerProps, CredentialExplorerState> {
  /**
   * Initialise empty state
   */
  state: CredentialExplorerState = {}

  /**
   * Save the open / closed state to a dynamic state key that gets generated as you interact
   */
  revealChildren(stateKey: string) {
    /**
     * Custom animation curve
     */
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
    // console.tron.log(normalisedClaimTree)
    /**
     * Recursive function to re-iterate over a normalised claim to create an accordion
     */
    const collapsibleCredential = (claims: any[]) => {
      /**
       * Map through the normalised claim and produce UI
       */
      return claims.map((item: any, index: number) => {
        /**
         * Simple flags for UI to decise what to do with data types
         */
        const isObjectVisible =
          item.hasChildren &&
          (this.state[item.key] || isTopLevelSingleKey(this.props.claim, item.level)) &&
          !item.isList
        const isListVisible =
          item.hasChildren && (this.state[item.key] || isTopLevelSingleKey(this.props.claim, item.level)) && item.isList
        const sectionClosed =
          item.hasChildren && (this.state[item.key] || isTopLevelSingleKey(this.props.claim, item.level))
        const sectionExpanded = item.hasChildren && !this.state[item.key]

        return (
          <Container key={item.key} flexDirection={'row'}>
            <Container w={item.level} backgroundColor={'#000000'} />
            <Container flex={1}>
              {!isTopLevelSingleKey(this.props.claim, item.level) && !item.hidden && (
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
                  {!item.hasChildren ? renderCrendentialItem(item.value) : item.title}
                </ListItem>
              )}
              {renderCrendentialItem(item.value) === null && (
                <Image source={{ uri: item.value }} style={{ height: 150 }} resizeMode={'cover'} />
              )}
              {isObjectVisible && collapsibleCredential(item.value)}
              {isListVisible && (
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
                              <ListItem last>{renderCrendentialItem(listItem.value)}</ListItem>
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
