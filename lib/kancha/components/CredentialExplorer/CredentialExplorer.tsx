import React from 'react'
import String from 'string'
import { LayoutAnimation, NativeModules, Image } from 'react-native'
import { Container, ListItem, Text, Icon } from '@kancha'
const { UIManager } = NativeModules

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)

/**
 * Move this out to a shared kancah utils
 */
const parseClaim = (claimObject: any, level: number = 0, isListItem = false): any[] => {
  const objectToArray = Object.keys(claimObject)

  return objectToArray.map((k: string, i: number) => {
    const parsedKeyName = String(k)
      .humanize()
      .titleCase().s

    if (typeof claimObject[k] === 'object') {
      const isArray = Array.isArray(claimObject[k])
      const isStringListItem = typeof claimObject[k] === 'string'

      return {
        level,
        key: level + i + k.toLowerCase(),
        title: parsedKeyName,
        hasChildren: true,
        isList: isArray,
        value: parseClaim(claimObject[k], level + 1, isArray),
        isLast: true,
      }
    }
    return {
      level,
      key: level + i + k.toLowerCase(),
      title: parsedKeyName,
      hasChildren: false,
      isListItem,
      value: claimObject[k],
      isLast: true,
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
    LayoutAnimation.configureNext({
      duration: 600,
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
    const parsedClaim = parseClaim(this.props.claim)
    const shouldbeOpen = (level: number): boolean => parsedClaim.length === 1 && level === 0
    const collapsibleCredential = (claims: any[]) => {
      return claims.map((item: any, index: number) => {
        const isObject = item.hasChildren && (this.state[item.key] || shouldbeOpen(item.level)) && !item.isList
        const isList = item.hasChildren && (this.state[item.key] || shouldbeOpen(item.level)) && item.isList
        const showExpand = item.hasChildren && (this.state[item.key] || shouldbeOpen(item.level))
        const showClose = item.hasChildren && !this.state[item.key]
        const parseContentItem = (contentItem: any, hideReturnString: boolean = false) => {
          if (typeof contentItem === 'boolean') {
            return contentItem.toString()
          }
          if (typeof contentItem === 'string' && contentItem.endsWith('.jpg')) {
            return hideReturnString ? null : 'IMAGE'
          }
          if (typeof contentItem === 'string') {
            return contentItem
          }
          if (typeof contentItem === 'number') {
            return contentItem
          }
        }
        return (
          <Container key={item.key} flexDirection={'row'}>
            <Container w={item.level} backgroundColor={'#000000'} />
            <Container flex={1}>
              <ListItem
                disabled={!item.hasChildren}
                avatarComponent={<Icon size={20} name={showExpand ? 'remove' : showClose ? 'add' : ''} />}
                last={true}
                hideForwardArrow
                onPress={() => this.revealChildren(item.key)}
                title={!item.hasChildren && item.title}>
                {!item.hasChildren ? parseContentItem(item.value, true) : item.title}
              </ListItem>
              {parseContentItem(item.value) === 'IMAGE' && (
                <Image source={{ uri: item.value }} style={{ height: 150 }} resizeMode={'cover'} />
              )}
              {isObject && collapsibleCredential(item.value)}
              {isList && (
                <Container>
                  {item.value.map((listItem: any) => {
                    return (
                      <Container
                        key={listItem.key}
                        padding={5}
                        br={5}
                        viewStyle={{ shadowColor: '#000000', shadowRadius: 5, shadowOpacity: 0.1 }}>
                        {!listItem.isListItem && listItem.hasChildren && collapsibleCredential(listItem.value)}
                        {listItem.isListItem && !listItem.hasChildren && (
                          <Container flexDirection={'row'}>
                            <Container w={item.level} backgroundColor={'#000000'} />
                            <Container flex={1}>
                              <ListItem last>{parseContentItem(listItem.value)}</ListItem>
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

    return collapsibleCredential(parsedClaim)
  }
}

export default CredentialExplorer
