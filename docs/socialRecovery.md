# Social Recovery

## Recovery Network Setup

### Useful Selectors

These are all in 'recovery.js'

```js
recoveryType(state)
```

This returns either `seed` or `quorumV1`

```js
recoveryDelegates(state)
```

This returns a list of the `recoveryDelegates` for the current identity. These are the ones recorded on the blockchain.

```js
isRecoveryDelegate(state, '0x0102....')
```

Returns true if the address passed in as the second parameter is an existing recovery delegate. Use to show a check mark and mark on contact page

```js
requiredSignatures(state)
```

Returns the total amount of recovery delegates who need to assist me in recovering my identity

```js
proposedRecoveryDelegates(state)
```

This returns a list of the `proposedRecoveryDelegates` for the current identity. These are the ones not yet recorded on the blockchain.

```js
isProposedRecoveryDelegate(state, '0x0102....')
```

Returns true if the address passed in as the second parameter is a proposed recovery delegate. Use to show a check mark and mark on social recovery setup page

```js
proposedRequiredSignatures(state)
```

Returns the total amount of recovery delegates who need to assist me in recovering my identity if the current proposed delegates are commited

### Actions

```js
addRecoveryDelegate (address, delegate) 
```

Propose a given contact as a delegate

```js
removeRecoveryDelegate (address, delegate)
```

Remove a given contact as a delegate

```js
saveRecoveryDelegates (address)
```

Start updating delegates on blockchain. Will add a new RecoveryQuorum contract if one hasn't been setup before


## Recover My Identity

### Useful Selectors

These are all in 'recovery.js'

```js
socialRecoveryUrl(state)
```

This returns the url to be placed in a recovery QR code.

The following selectors can be used once the first friend helps recover:

```js
recoveryDelegates(state)
```

This returns a list of the `recoveryDelegates` for the identity being recovered. Use this to build up the list of friends helping

```js
requiredSignatures(state)
```

Returns the total amount of recovery delegates who need to assist me in recovering my identity

```js
missingSignatures(state)
```

Returns the total amount of recovery delegates still required to assist me in recovering my identity


```js
assistedInRecovery(state)
```

This returns a list of the `recoveryDelegates` who have already helped me recover

```js
assistedMe(state, '0x0102....')
```

Returns true if the address passed in as the second parameter has helped me out. Use to show a check mark and mark on contact page

Use regular selectors in `identities.js` to show information about the identity being recovered.

TODO Still missing are selectors to show who has helped you out

### Useful Actions

Use this from onboarding screen to start social recovery process

```js
startSocialRecovery ()
```

Present a button once all friends have helped you out.

```js
restoreIdentityAfterRecovery ()
```

## Help friend Recover

The request handler will setup the request for you. There is no information from it that needs to be displayed.

### Useful Actions

First update the activity with the friend you want to helps address.

```js
updateActivity(activity.id, {to: FRIEND_TO_HELP})
```

Then use the regular 

```js
authorizeRequest(activity.id)
```

