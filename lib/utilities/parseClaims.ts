import { Linking } from 'react-native'
import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import S from 'string'

/*********************************************************************************
 * Needs to be refactored and moved to kancha utils
 *
 ********************************************************************************/

export function extractClaimType(verification: any) {
  if (verification.claimType) {
    return verification.claimType
  }
  return Object.keys(verification.claim).map(claim => capitalizeFirstLetter(claim))
}

export function parseClaimItem(item: any) {
  const claimTypes = extractClaimType(item)
  const claimType = claimTypes[0]
  const claimTypeHeader = claimType.toUpperCase()
  const more = `+ ${claimTypes.length - 1} more`
  const claimTypeTitle = claimTypes.length > 1 ? `${claimTypeHeader} ${more}` : claimTypeHeader
  const claimSubject = claimTypes.length === 1 && item.claim[claimTypes[0]]
  const claimCardHeader = claimTypes.length > 1 ? `${claimType} ${more}` : claimType

  return {
    claimTypeHeader,
    claimCardHeader,
    claimTypeTitle,
    claimSubject,
  }
}

/**
 * Move this out to a shared kancah utils
 */
export interface ClaimTreeNormalised {
  level: number
  key: string
  keyName: string
  title: string
  hasChildren: boolean
  isListItem: boolean
  value: any
}

/**
 * Returns true if the item being passed in is the only key ina claim and it's the top level = 0
 */
export const isTopLevelSingleKey = (claimObject: any, level: number): boolean => {
  return Object.keys(claimObject).length === 1 && level === 0
}

export const normaliseClaimTree = (claimObject: any, level: number = 0, isListItem = false): ClaimTreeNormalised[] => {
  const claimKeysArray = Object.keys(claimObject)

  return claimKeysArray.map((k: string, i: number) => {
    /**
     * Simple flags to check data types for children
     */
    const valueisObject = typeof claimObject[k] === 'object'
    const valueisArray = Array.isArray(claimObject[k])

    /**
     * parse keyname as human readable. Note S
     */
    const parsedKeyName = S(k)
      .humanize()
      .titleCase().s

    return {
      level,
      key: level + i + k.toLowerCase(),
      keyName: k,
      title: parsedKeyName,
      hasChildren: valueisObject || valueisArray,
      isList: valueisArray,
      isListItem: !valueisObject && !valueisArray && isListItem,
      value:
        valueisObject || valueisArray ? normaliseClaimTree(claimObject[k], level + 1, valueisArray) : claimObject[k],
    }
  })
}

export const renderCrendentialItem = (contentItem: any) => {
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
    return contentItem
  } else if (typeof contentItem === 'string') {
    return contentItem
  }
  /**
   * Return false if nothing is found
   */
  return false
}
