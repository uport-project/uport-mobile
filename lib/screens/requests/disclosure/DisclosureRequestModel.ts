import { capitalizeFirstLetter } from 'uPortMobile/lib/utilities/string'
import { UserInfo } from 'uPortMobile/lib/types/Credentials'

/**
 * Types for the disclourse request
 */

export interface ClaimSpecType {
  essential?: boolean
  reason?: string
  claimType: string
}

export interface VerifiableClaimType {
  iss: string
  issuer: any
  claimType: string
}

export interface DisclosureRequestModelType {
  requestId: string
  componentId: string
  title: string
  description: string | null
  actionButton: RequestActionButton
  cancelButton: RequestActionButton
  statsMessage: string
  requestItems: RequestItem[] // To Type
  appBranding: AppBranding // To Type
  verifiedCredentials: VerifiableClaimType[] // To Type
  missingCredentials: ClaimSpecType[] // To Type
  error: string | null
}

interface RequestItem {
  key: string
  type: string
  value: string | number
}

interface AppBranding {
  profileImage: string
  bannerImage: string
  requestor: string
}

export interface RequestActionButton {
  disabled: boolean
  text: string
  action: (requestId: string, type?: string) => any
  actionType?: string
}

const parseErrorMessage = (message: string) => {
  return message.startsWith('JWT has expired') ? 'This credential has expired.' : message
}

/**
 * Count stats
 */
const countStats = (stats: { [key: string]: number }) => {
  let total = 0
  typeof stats === 'object'
    ? Object.keys(stats).forEach(value => (value !== 'request' ? (total += stats[value]) : null))
    : null
  return total
}

/**
 * Interaction stats
 */
const interactionStatsMessage = (intStats: any, client: string) => {
  return countStats(intStats) === 0
    ? `You have never interacted with ${client}`
    : `You have interacted with ${client} ${countStats(intStats)} times`
}

function objectToRequestItems(claims: UserInfo): RequestItem[] {
  return claims
    ? Object.keys(claims).map((claim, index) => {
        return {
          key: index + claim,
          type: capitalizeFirstLetter(claim),
          value: typeof claims[claim] !== 'object' ? claims[claim] : null,
        }
      })
    : []
}
/**
 * Disclose request items model
 */
function disclosureRequestItemModel({ requested }: any): RequestItem[] {
  return objectToRequestItems(requested) || []
}

function disclosureRequestVCModel({ verified }: any): any[] {
  return verified || []
}

/**
 * function to return a configuration object. The component just renders the out put and doesnmt have to parse expensive JSX logic
 */
const DisclosureRequestModel = (props: any): DisclosureRequestModelType | null => {
  /**
   * Global for all disclosure request
   */
  const disclosureRequestCommon = {
    requestId: props.requestId,
    componentId: props.componentId,
    appBranding: {
      profileImage: props.client && props.client.avatar,
      bannerImage: props.client && props.client.bannerImage,
      requestor: props.client && props.client.name,
    },
    statsMessage: interactionStatsMessage(props.interactionStats, props.client && props.client.name),
    error: props.error ? parseErrorMessage(props.error) : null,
  }

  /**
   * Create New Account
   *
   */
  if (props.actType !== 'none' && !props.account && props.accountAuthorized === false) {
    return {
      title: 'Create Account',
      description: `You need to create an ethereum account to interact with ${
        disclosureRequestCommon.appBranding.requestor
      }`,
      actionButton: {
        text: 'Create',
        action: props.authorizeAccount,
        disabled: props.pushWorking || !!props.error,
        actionType: 'new',
      },
      cancelButton: {
        text: 'Cancel',
        action: props.cancelRequest,
        disabled: false,
      },
      ...disclosureRequestCommon,
      requestItems: [],
      verifiedCredentials: [],
      missingCredentials: [],
    }
  }
  /**
   * Login with existing Account
   */
  if (props.actType !== 'none' && props.account && props.interactionStats && props.accountAuthorized === false) {
    /**
     * Auto confirm the account to be used
     */
    props.authorizeAccount(props.requestId, 'existing')

    return null
  }

  /**
   * Share to Login
   */
  if (props.actType === 'none' || props.accountAuthorized === true) {
    return {
      title: 'Share to login',
      description: null,
      actionButton: {
        text: 'Login',
        action: props.authorizeRequest,
        disabled: props.missingRequired,
        actionType: 'none',
      },
      cancelButton: {
        text: 'Cancel',
        action: props.cancelRequest,
        disabled: false,
      },
      ...disclosureRequestCommon,
      requestItems: disclosureRequestItemModel(props),
      verifiedCredentials: disclosureRequestVCModel(props),
      missingCredentials: props.missing || [],
    }
  }

  return null
}

export default DisclosureRequestModel
