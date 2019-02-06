# uPort Mobile

uPort mobile is a secure mobile self-sovereign identity wallet that gives you complete control over your identity and personal data.

Using uPort you can:

* Create an identity on the Ethereum blockchain network
* Securely log-in to applications without passwords
* Manage your personal information and verifications
* Sign Ethereum transactions

This mobile wallet is your connection to the uPort platform, an interoperable identity network for a secure, private, decentralized web. uPort provides open protocols for decentralized identity and interoperable messaging that enable trusted source attribution for all web communication. By allowing message recipients to trust message senders without centralized servers, we can create an entirely new framework for building applications, and many developers are already building on this system.

## Getting started

### JavaScript environment setup

- Install yarn with `brew install yarn` or `npm install yarn -g`
- Install the latest version of Xcode
- Install React Native CLI

After cloning this repository cd into the directory

```bash=
$ yarn global add react-native-cli (to install CLI)
$ yarn
```

If you are going to create release notes

```bash=
$ yarn global add gren
```

### Linking native libraries
Linking must be done manually. Do not run `react-native link` as this will mess up the exising links.


### IOS setup

- Install Xcode version 10+
- Install Xcode command line tools

#### Run from Xcode

Hit Run in X-Code and it should launch on your device. Simulator use may not support all features, always run on your device whenever possible.

#### Run from command line

```bash=
$ react-native run-ios
```

### Android setup

- Easiest way is to install Android Studio. This will manage the SDK for you and makes life easier for non Android devs
- Select the custom install option and select options for performance and AVD creation
- Ensure to install both the minnimum SDK 21 and the latest that the current version of React Native supports from the new project settings

**Do not upgrade any depencencies (gradle) if prompted by Android Studio**

#### Run from Android Studio
Open project in Android studio and press play

#### Run from command line

After cloning repository
```bash=
$ react-native run-android
```



## StandardJS

We're using StandardJS to maintain a consistent JavaScript style. Before submitting pull requests, please make sure that new code passes the StandardJS linter by running `npm run lint`. Some style errors can be fixed automatically by running `npm run lint-fix`. 

Alternatively, you can install StandardJS globally with `yarn global add standard`, and then for pretty output use Snazzy: `yarn global add snazzy` then `standard --verbose | snazzy`.

There are also a number of [text editor plugins](https://github.com/feross/standard#text-editor-plugins) available to highlight errors during development.   

## Unit Testing

We primarily use [jest](https://facebook.github.io/jest/) for unit testing. You can run all the tests once by typing:

```
yarn test
```

During development it's recommended that you leave the automatic testing code running in a window.

```
yarn test -- --watch
```

Jest tests of components, actions, reducers and selectors are mostly done using [Snapshotting](https://facebook.github.io/jest/docs/tutorial-react.html#snapshot-testing) which
means that tests will fail if you make any kind of change to a component being tested.

Have a look at the diff shown if the change is what you asked for. Type `u` to update the snapshot assuming you're using the automatic version of jest.

## Specs

Request / response specs can be found in our [specs repo](https://github.com/uport-project/specs).
