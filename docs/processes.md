# Processes

Processes is any external (or internal process) that isn't instant. 

The model of processes within the app is just a standard abstraction for the actual code doing the processing to mark that the process has started, any errors, status messages and data about what it's doing to the UX.

In other words it is not a OS process model. It is just a way for a Saga or other backend code to let the front end know what it's doing.

## Names and identifiers of process

All processes have a simple text identifier. They are used both in the actions and selectors for specifying a process.

These are the ones we currently have:

- `unnu` identity creation
- nisaba which is now split into 3 distinct processes
  - `verificationSMS` send verification sms
  - `verificationCall` make verification call
  - `verifyPhoneCode` verify code from the above
- blockchain.js
  - `balance` fetches balance
  - `fuel` fetches balance of devicekey
  - `gasPrice` fetches gasPrice
  - `nonce` fetches nonce of deviceKey
- notifications.js 
  - `push` registers phone for push notifications on Amazon SNS
- `tx` transaction signing and sending
- `persona` updating uport profile
- recoverySaga
  - `recoverySetup`
  - `restoreIdentity`

Please keep this list updated

## Writing a process

When designing a saga to call an external process there are a few actions to use. These all live in `uPortMobile/lib/actions/processStatusActions.js`

- `startWorking(processId)` The first thing to call for any process. In the beginning of the saga for example.
- `saveMessage(processId, 'Sending to ipfs')` If you want to show a message to the user about what is going on
- `completeProcess(processId)` Process completed successfully
- `failProcess(processId, 'Error message to user')` show message to end user

## Reading process status in the UX

There are a selection of selectors you can query in the container functions to check the current status of a process. They all live in `uPortMobile/lib/selectors/processStatus`.

- `offline(state)` Not process specific but returns a boolean if you're offline
- `working(state, processId)` Returns a boolean if the process is currently working. Meaning it has been started but not completed nor failed
- `completed(state, processId)` Returns a boolean if the process is completed
- `failed(state, processId)` Returns a boolean if the process failed
- `statusMessage(state, processId)` Returns the current status message for a process if available
- `errorMessage(state, processId)` Returns the current error message for a process if available

## UX Components

We currently have a couple of premade components that will automatically interact with a process.

- `Status` A simple view of the status of a process
- `ProcessCard` A view meant to encompass the UX surrounding calling a process

### Status

Just include this with the processId:

```jsx
<Status process='verifyPhoneCode' />
```

*Props*

- `process`* The processId
- `color` The color of notification text and spinner. Generally this uses the defaults from the stylesheet. Override this primarily when using on a dark background

### ProcessCard

Use this instead of a View wrapping any text or Data input components. It has an optional title at the top, it's child content, A `Status` component, an action button and an optional skip button.

```jsx
<ProcessCard 
  process='myProcess'
  invalid={!props.someDataValue}
  skippable
  onProcess={() => startMyProcess() }
  onContinue={() => moveOnToNextScreen() }
  >
  <Text>Hello</Text>
</ProcessCard>
```

*Props*

- `process` The processId
- `title` Optional title to display at top of card
- `actionText` Optional button text for action button. Defaults to `Next`
- `skippable` Optional boolean. Use if you want a skip button
- `invalid` An optional boolean prop to tell the card that any data input is invalid
- `onProcess` This is called to start the process when the user hits the action button
- `onContinue` A function to call to finish off the process. Use this to call the navigator to go to the next screen. If no `onProcess` is specified this is used instead
- `onSkip` An optional function to call when the skip button is pressed. If not included `onContinue` is called

#### Using with process

When using with a process you should include at least a `onProcess` function to start the saga and a `onContinue` function to continue to the next screen automatically once it's completed.

*Important* When using it in this setup `onProcess` should not return anything or `onContinue` is called.

### Using without process

The ProcessCard can be useful for data entry screens or other screens asking for user input. Such as the `OnboardingName` screen.

To do this, leave out the `process` and make sure the `onProcess` returns `true`. Alternatively if it is not `skippable` you can simply implement `onContinue`.