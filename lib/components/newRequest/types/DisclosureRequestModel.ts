/**
 * Types for the disclourse request
 */
interface DisclosureRequestModelType {
  title: string
  description: string
  actionButton: RequestActionButton
  cancelButton: RequestActionButton
  showEthereumAccounts: boolean
  statsMessage: any // To Type
  requestItems: any // To Type
  appBranding: any // To Type
}

interface RequestActionButton {
  disabled: boolean
  text: string
  action: (requestId: string, type?: string) => any
  actionType?: string
}

const parseErrorMessage = (message: string) => {
  return message.startsWith('JWT has expired') ? 'This credential has expired.' : message
}

/**
 * Move to utils
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

/**
 * Disclose request items model
 */
const disclosureRequestItemModel = (props: any) => {
  if (!!props.actType && (props.actType === 'none' || props.accountAuthorized === true)) {
    const requested =
      props.requested &&
      Object.keys(props.requested).map((claim, index) => {
        return {
          key: index + claim,
          type: claim.toUpperCase(),
          value: typeof props.requested[claim] !== 'object' ? props.requested[claim] : null,
        }
      })

    const pushStatus = props.pushPermissions && [
      {
        key: 'pushStatus',
        type: 'Push Notifications',
        value: props.snsRegistered ? 'Allow' : props.pushWorking ? 'Registering' : props.pushError || 'Not available',
      },
    ]

    const network = props.network && [
      {
        key: 'requestednetwork',
        type: 'Network',
        value: props.networkName,
      },
    ]

    const account = props.network && [
      {
        key: 'accountaddress',
        type: 'Address',
        value:
          props.account ||
          `New account will be created for ${
            props.actType === 'segregated' ? props.client.name || props.client.address.slice(0, 10) : props.networkName
          }`,
      },
    ]

    return [...requested, ...pushStatus, ...network, ...account]
  }

  return []
}

/**
 * function to return a configuration object. The component just renders the out put and doesnmt have to parse expensive JSX logic
 */
const DisclosureRequestModel = (props: any): DisclosureRequestModelType | null => {
  /**
   * Global for all disclosure request
   */
  const disclosureRequestCommon = {
    appBranding: {
      profileImage: props.client && props.client.avatar,
      bannerImage: props.client && props.client.bannerImage,
      requestor: props.client && props.client.name,
    },
    statsMessage: interactionStatsMessage(props.interactionStats, props.client && props.client.name),
    requestItems: disclosureRequestItemModel(props),
  }

  /**
   * Create New Account
   *
   * props.actType !== 'none' && props.account && props.interactionStats && props.accountAuthorized === false
   */
  if (props.actType !== 'none' && !props.account && props.accountAuthorized === false) {
    return {
      title: 'Create Account',
      description: `You need to create an ethereum keypair to interact with ${props.client.name}`,
      actionButton: {
        text: 'Create New Account',
        action: props.authorizeAccount,
        disabled: props.pushWorking || !!props.error,
      },
      cancelButton: {
        text: 'Cancel',
        action: props.cancelRequest,
        disabled: false,
      },
      showEthereumAccounts: false,
      ...disclosureRequestCommon,
    }
  }
  /**
   * Login with existing Account
   */
  if (props.actType !== 'none' && props.account && props.interactionStats && props.accountAuthorized === false) {
    return {
      title: 'Login with account',
      description: ``,
      actionButton: {
        text: 'Login',
        action: props.authorizeAccount,
        disabled: false,
        actionType: 'existing',
      },
      cancelButton: {
        text: 'Cancel',
        action: props.cancelRequest,
        disabled: false,
      },
      showEthereumAccounts: false,
      ...disclosureRequestCommon,
    }
  }

  /**
   * Share to Login
   */
  if (props.actType === 'none' || props.accountAuthorized === true) {
    return {
      title: 'Share to login',
      description: ``,
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
      showEthereumAccounts: false,
      ...disclosureRequestCommon,
    }
  }

  return null
}

export default DisclosureRequestModel
