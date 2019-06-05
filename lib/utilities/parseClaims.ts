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
