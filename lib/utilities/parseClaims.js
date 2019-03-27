import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'

export function extractClaimType(verification) {
  if (verification.claimType) {
      return verification.claimType
  }
  return Object.keys(verification.claim).map(claim => capitalizeFirstLetter(claim))
}

export function parseClaimItem(item) {
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
      claimSubject
  }
}