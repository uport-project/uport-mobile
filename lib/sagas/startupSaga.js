// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//
import { delay, eventChannel } from 'redux-saga'
import { Platform, AppState } from 'react-native'
import { call, put, select, spawn, take, takeLatest } from 'redux-saga/effects'
// import EthSigner from 'eth-signer/dist/eth-signer-simple.js'
// const Signer = EthSigner.signer
// const SimpleSigner = EthSigner.signers.SimpleSigner
import { RESET_DEVICE } from 'uPortMobile/lib/constants/GlobalActionTypes'
import {
  savePublicUport,
  switchIdentity,
  createEncryptionKey,
  importSnapshot,
} from 'uPortMobile/lib/actions/uportActions'
import {
  checkForNotifications,
  pollForNotifications,
  updateBadgeCount,
  initNotifications,
  sendLocalNotification,
} from 'uPortMobile/lib/actions/snsRegistrationActions'
import { accountRiskSent, storeAllKeyChainAddresses } from 'uPortMobile/lib/actions/HDWalletActions'
import { track, identify } from 'uPortMobile/lib/actions/metricActions'
// import { push } from 'uPortMobile/lib/actions/navigatorActions'
import { flagNewbie } from 'uPortMobile/lib/actions/onboardingActions'

import {
  currentAddress,
  currentIdentity,
  ipfsProfile,
  hasEncryptionKey,
  otherIdentities,
} from 'uPortMobile/lib/selectors/identities'
import { currentNetwork, fuelToken, networkSettings } from 'uPortMobile/lib/selectors/chains'
import { seedConfirmedSelector, accountRiskSentSelector, hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
// import { activationEvents } from 'uPortMobile/lib/selectors/userActivation'
// import { setError } from '../helpers/error'
// import { startMain, startOnboarding } from '../start'
import { startMain, startOnboarding } from '../navigators/navigation'
import { migrateKeys, listSeedAddresses } from './keychain'
import { initializeDatabase } from './stateSaver'
import { fetchAllSettings } from './blockchain'
import { checkCameraPermissions, checkNotificationsPermissions } from './permissionsSaga'
import { maybeSnapShot, sendQueuedEvents } from './hubSaga'
import { checkOldPendingTransactions } from './requests/transactionRequest'
import { activationEvent } from 'uPortMobile/lib/actions/userActivationActions'
import { defaultNetwork } from 'uPortMobile/lib/utilities/networks'
import { featureFlagsLoad } from 'uPortMobile/lib/actions/featureFlagsActions'

// import { whenConnected, onlyConnected } from './network_state'
// Leave this in. It is occasionally used by uncommenting a line below
import { handleURL } from 'uPortMobile/lib/actions/requestActions'
import { createToken, createShareRequestToken, createAttestationToken, createPututuAuthToken } from './jwt'
import { toJs } from 'mori'

function* longerRunningStartupTasks(address) {
  yield put(activationEvent('OPEN_APP'))
  yield call(checkCameraPermissions)
  yield call(checkNotificationsPermissions)
  yield put(featureFlagsLoad())
  yield put(updateBadgeCount())
  yield delay(1000)

  if (!address.match('^did:')) {
    // legacy stuff
    yield fetchAllSettings({ address })
    const hasEncKey = yield select(hasEncryptionKey)
    if (!hasEncKey) {
      yield put(createEncryptionKey(address))
    }

    const prevHash = yield select(ipfsProfile, address)
    // console.log(`ipfsHash: ${prevHash}`)
    if (!prevHash || !hasEncKey) {
      yield put(savePublicUport(address))
    }
  }

  yield checkOldPendingTransactions(address)
  // const events = yield select(activationEvents)
}

export function* startApplication() {
  try {
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< App Starting')
    yield call(initializeDatabase)
    yield put(initNotifications())
    const address = yield select(currentAddress)
    // console.log(`address`, address)

    yield put(identify(address))
    yield put(track('Open App'))
    // const identity = yield select(currentIdentity)
    // console.log(toJs(identity))
    // const uport = yield select(s => toJs(s.uport))
    // console.log(uport)
    const allSeeds = yield call(listSeedAddresses)
    yield put(storeAllKeyChainAddresses(allSeeds))

    // const network = yield select(currentNetwork)
    // const ft = yield select(fuelToken)

    if (address) {
      // console.log(`Current identity: ${address}`)
      // console.tron.log(`Current identity: ${address}`)
      // This controls the navigator
      // yield put(push({key: 'home'}))
      yield spawn(longerRunningStartupTasks, address)
      yield put(pollForNotifications())
      yield call(startMain)
      const hasHDWallet = yield select(hdRootAddress)
      if (!!hasHDWallet) {
        const riskNotificationSent = yield select(accountRiskSentSelector)
        const seedConfirmed = yield select(seedConfirmedSelector)
        if (seedConfirmed !== true && riskNotificationSent !== true) {
          yield put(
            sendLocalNotification(
              'recoveryNotification',
              'me.uport:info?infoType=seedRecovery&screen=backup.seedInstructions',
              'week',
            ),
          )
          yield put(accountRiskSent())
        }
      }
      // yield call([Intercom, Intercom.registerIdentifiedUser], { userId: address })
      yield call(sendQueuedEvents)
      yield call(maybeSnapShot)
      // yield call(delay, 1000)
      // DEVELOPERS Uncomment one of these lines to test url handling
      // Ethereum Transaction:
      // yield put(handleURL('me.uport:2ooE3vLGYi9vHmfYSc3ZxABfN5p8756sgi6?bytecode=0xb66084670000000000000000000000000000000000000000000000000000000000000002&label=uPort%20Demo'))
      // yield put(handleURL('me.uport:0x60dd15dec1732d6c8a6125b21f77d039821e5b93?bytecode=0x2c2159980000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000949276d2048617070790000000000000000000000000000000000000000000000'))
      // yield put(handleURL('me.uport:0x60b3774c4161a59b35cda8043670aadf71cc2aed?function=buyTokens(uint 12313)&client_id=0x60b3774c4161a59b35cda8043670aadf71cc2aed'))
      // yield put(handleURL('me.uport:2oZqgNx3pzzaT5V6xctreExLz21jVYrh9ef?function=transfer(address 0x60b3774c4161a59b35cda8043670aadf71cc2aed, uint 1231)&value=11231000000000000',))
      // yield put(handleURL('me.uport:0x60b3774c4161a59b35cda8043670aadf71cc2aed?label=Mike%20Goldin&value=1123100000000000'))
      // yield put(handleURL('me.uport:0x60b3774c4161a59b35cda8043670aadf71cc2aed?value=111123100000000000000'))
      // Gnosis buy Tokens:
      // yield put(handleURL('me.uport:0x99f3931d0e1285855ac3d37648d4bb3fc705743e?bytecode=d0febe4c&value=11231000000000000'))
      // yield put(handleURL('me.uport:recover/0xceaaac60d36d2cb52ac727a93ad5ea301afc89dc'))
      // TestApp Connect
      // yield put(handleURL('me.uport:me?callback_url=https://chasqui.uport.me/api/v1/topic/kgdq11Afb0HtjX5H&label=TestApp'))
      // TestApp Status TX
      // yield put(handleURL('me.uport:0xB42E70a3c6dd57003f4bFe7B06E370d21CDA8087?bytecode=0x2c2159980000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000949276d2048617070790000000000000000000000000000000000000000000000&callback_url=https://chasqui.uport.me/api/v1/topic/7FVqbR55FxI69Ijx&label=TestApp'))

      // Ethereum Transaciton
      // const token = yield createToken(address, {
      //   callback: 'https://testapp.uport.me',
      //   type: 'ethtx',
      //   net: '0x1', // 0x1 for mainnet, 0x4 for rinkeby, 0x2a for kovan
      //   act: 'keypair', // or segregated (not for mainnet)
      //   to: '2ooE3vLGYi9vHmfYSc3ZxABfN5p8756sgi6',
      //   data: '0xb66084670000000000000000000000000000000000000000000000000000000000000002'
      // })

      // Simple Selective Disclosure:
      // yield put(handleURL('me.uport:me?callback_url=https://testapp.uport.me'))
      // yield put(handleURL('me.uport:me?client_id=0x60b3774c4161a59b35cda8043670aadf71cc2aed&callback_url=https://testapp.uport.me'))
      // yield put(handleURL('me.uport:me?callback_url=https://chasqui.uport.me/api/v1/topic/dWHpxgykdsi4OkBd&label=FriendWallet'))

      // Crypto-x selective disclosure (mainly for testing push notifications)
      // yield put(handleURL('me.uport:me?requestToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1ZXN0ZWQiOlsibmFtZSIsInBob25lIiwiY291bnRyeSJdLCJwZXJtaXNzaW9ucyI6WyJub3RpZmljYXRpb25zIl0sImNhbGxiYWNrIjoiaHR0cHM6Ly9jaGFzcXVpLnVwb3J0Lm1lL2FwaS92MS90b3BpYy9Eb21hMkQ4NG5HSHNIUlZ0IiwidHlwZSI6InNoYXJlUmVxIiwiaXNzIjoiMHhlMmZlZjcxMWE1OTg4ZmJlODRiODA2ZDQ4MTcxOTdmMDMzZGRlMDUwIiwiaWF0IjoxNDkwMjA1NTgyNDA1fQ.Z1m53szrd6m2Mp2b8woQEWGIa4cOv0igaWnz_A4o4I7qmeamWUblMzUdOlt5LKEvhGiO90ON-rY4eWyduzaROQ'))
      // Recovery Test
      // yield put(handleURL('me.uport:recover/0xceaaac60d36d2cb52ac727a93ad5ea301afc89dc'))
      // Selective Disclosure:
      // const token = yield createShareRequestToken(address, {
        // callback: 'https://testapp.uport.me',
        // networkId: '0x1', // 0x1 for mainnet, 0x4 for rinkeby, 0x2a for kovan
        // accountType: 'keypair', // or segregated (not for mainnet)
        // notifications: true,
        // requested: ['name', 'phone', 'description', 'email', 'country', 'address'],
        // verified: [
        //   {iss: [{did: 'did:ethr:0xc0fb1c7099b2599d3450641d8b141d99836fe593', url: 'https://uportlandia.uport.me'}], type: 'Uportlandia City ID', essential: true, reason: 'We can only offer services to uPortlandia citizens'},
        //   {
        //     iss: [
        //     {did: 'did:ethr:0xc0fb1c7099b2599d3450641d8b141d99836fe593', url: 'https://uportlandia.uport.me'},
        //     {did: 'did:ethr:0xc0fb1c7099b2599d3450641d8b141d99836fe593', url: 'https://serto.claims'}], 
        //     type: 'email', essential: true, reason: 'We need to be able to communicate with you'}]
      // })
      // yield put(handleURL(`me.uport:me?requestToken=${token}`))

      // Add Network Request
      // yield put(handleURL('me.uport:me?requestToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIyb21SSlpMMjNaQ1lnYzFyWnJGVnBGWEpwV29hRUV1SlVjZiIsImlhdCI6MTUxOTM1MDI1NiwicGVybWlzc2lvbnMiOlsibm90aWZpY2F0aW9ucyJdLCJjYWxsYmFjayI6Imh0dHBzOi8vYXBpLnVwb3J0LnNwYWNlL29sb3J1bi9jcmVhdGVJZGVudGl0eSIsIm5ldCI6IjB4MzAzOSIsImFjdCI6ImRldmljZWtleSIsImV4cCI6MTUyMjU0MDgwMCwidHlwZSI6InNoYXJlUmVxIn0.EkqNUyrZhcDbTQl73XpL2tp470lCo2saMXzuOZ91UI2y-XzpcBMzhhSeUORnoJXJhHnkGGpshZlESWUgrbuiVQ'))
      // Add attestations:
      // simple
      // const token = yield createAttestationToken(address, address, {'employer': 'Uport AG'  })
      // yield put(handleURL(`me.uport:add?attestations=${token}`))

      // Contact Request
      // const token = yield createToken(address, {
      //   type: 'shareResp',
      //   own: { name: 'Bob Smith' }
      // })

      // complex attestation
      // const token = yield createAttestationToken(address, address, {'Zug Citizenship': { 'employer': 'Uport AG', 'name': 'ShokiShoki', 'phone': '+13104041586', 'email': 'ashoka.finley@gmail.com', 'address': '70 Commercial St', 'sign': 'libra', 'gender': 'male' }})
      // yield put(handleURL(`me.uport:add?attestations=${token}`))
      // yield put(handleURL(`me.uport:add?attestations=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NDIwMTM1MjQsInN1YiI6ImFueW9uZSIsImNsYWltIjp7InNpemUiOiJzbWFsbCJ9LCJpc3MiOiJkaWQ6aHR0cHM6NGNkYTY0ODEubmdyb2suaW8ifQ.R9Iq4n4uCeCc0OLr3RswL48YhumQuBMYj1ijfC1WZ_PuJtGqKW8HNNrp_Hi-8al4g6m5xJLmudi277ty4K42twA`))

      // Internal channel
      // yield put(handleURL('me.uport:property?requestToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIyb3BiUldyenRDYkd3VXNIUE03dERZY0FLSkd3aXhvczFNMyIsImlhdCI6MTUxMjA1Nzk1OCwicHJvcGVydHkiOnsia2V5IjoiY2hhbm5lbCIsInZhbHVlIjoiaW50ZXJuYWwifX0.k9cfy21HPk-YGUdR8W6WcqbRGnVK33xVdXwKa9szDhdMz8pGq9sIFVVWqgZbmIGM8QsjGkcmy61FgWbeiKCTxA'))

      // Production channel
      // yield put(handleURL('me.uport:property?requestToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIyb3BiUldyenRDYkd3VXNIUE03dERZY0FLSkd3aXhvczFNMyIsImlhdCI6MTUxMjA1OTA5NywicHJvcGVydHkiOnsia2V5IjoiY2hhbm5lbCIsInZhbHVlIjoicHJvZHVjdGlvbiJ9fQ.TFBmB0IOeUR1EMNuVyK4da13tCfYd8Zq-JUORCwt9vZkp9ixCITeuqvXJ60xejZ3Ff6ZBHO-D2GRBCOBz_DQ5w'))

      // console.log('token', token)
      // yield put(handleURL(`https://id.uport.me/req/${token}`))
      // yield put(handleURL('https://id.uport.me/req/eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1MjY5NTI2MzYsImV4cCI6MTUyNzAzOTAzNiwidHlwZSI6InNoYXJlUmVzcCIsIm93biI6eyJuYW1lIjoiUGVsbGUgQnLDpm5kZ2FhcmQiLCJhdmF0YXIiOnsidXJpIjoiaHR0cHM6Ly9pcGZzLmluZnVyYS5pby9pcGZzL1FtVm5aZkdFaHVRa3RuMWtGa0ZiOURwTEFvVUtiQm1qVWFEOWZZakFUY3Z2Z3EifSwicHVibGljS2V5IjoiMHgwNDdiNGUzYzFmZGRhZmY1MmY0MThkNGFmNjI3NDc2MTllMGZjNjEyMTgzNmZkZWM0ZjVmMTYwY2ZlN2Q3Y2IxZjQ0MzIxMmE5YjQ2ZmZhY2I3NjVhOTk0OGY1ZjQyMzUzM2ZkNmQyMDNkMzdjYzk0OGJhNGFiZTM2ZDJiYTgwZGI1IiwicHVibGljRW5jS2V5IjoiZGU3QU1xanFLanJWTUgxK3RqUEl6S1pOK2Z4TTV1dUVqMXVlL09NeW9DTT0ifSwiaXNzIjoiMm93M2RZa2tSQXNYU0Q4RTVjWTQyejdSTkdIYzFVaFYyZUcifQ._wCUUAMsNLKPazVKv6AUqJ39HVpJxl1fuxbHvxn_HsNHk_lwg1Vk3Py0EhxouCfu1SyC5qDYEVrx-VZRJBxctQ'))

      // Verification signing request
      // yield put(handleURL('https://id.uport.me/req/eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIyb2VYdWZIR0RwVTUxYmZLQnNaRGR1N0plOXdlSjNyN3NWRyIsImlhdCI6MTUyODkwMDA4MywidHlwZSI6InZlclJlcSIsInN1YiI6IjJvVHZCeFNHc2VXRnFoc3RzRUhnbUNCaTc2MkZiY2lnSzV1IiwiY2FsbGJhY2siOiJodHRwczovL2RlbW8udXBvcnQubWUvIiwicG9zdGJhY2siOmZhbHNlLCJ1bnNpZ25lZENsYWltIjp7ImdlbmVyYWxJbmZvIjp7ImFjY2lkZW50RGF0ZSI6IjIwMTgtMDYtMTIgMTY6MjAiLCJhZGRyZXNzIjp7InN0cmVldCI6Ik1haW4gc3RyLiAxMjMiLCJjaXR5IjoiVmlsbml1cyIsImNvdW50cnkiOiJMVCJ9LCJpbmp1cmllc0V2ZW5JZlNsaWdodCI6ZmFsc2V9LCJtYXRlcmlhbERhbWFnZSI6eyJvdGhlclRoYW5Ub1ZlaGljbGVzQUFuZEIiOmZhbHNlLCJvYmplY3RzT3RoZXJUaGFuVmVoaWNsZXMiOmZhbHNlfSwid2l0bmVzc2VzIjpbeyJuYW1lIjoiSm9obiBTbWl0aCIsInBob25lTnVtYmVyIjoiKzEyMzI0MjMyNCIsImFkZHJlc3MiOnsic3RyZWV0IjoiU2Vjb25kIHN0ci4gMzI0LTIiLCJjaXR5IjoiTG9uZG9uIiwiY291bnRyeSI6IlVLIn19LHsibmFtZSI6IkphbmUgRG9lIiwicGhvbmVOdW1iZXIiOiIrNDM1MjMyMzQiLCJhZGRyZXNzIjp7InN0cmVldCI6IlNvbWUgYXYuIDQzLTYiLCJjaXR5IjoiRHVibGluIiwiY291bnRyeSI6IklSIn19XSwidmVoaWNsZUEiOnsicG9saWN5SG9sZGVyIjp7Im5hbWVPckNvbXBhbnlOYW1lIjoiS2FydXphcyIsImZpcnN0TmFtZSI6IlNpbW9uYXMiLCJwZXJzb25hbENvZGVPclJlZ05yIjoiNTQzNTg5MzQzIiwiYWRkcmVzcyI6eyJwb3N0YWxDb2RlIjoiTFQtMzQ0MjMiLCJzdHJlZXQiOiJTb21lIHN0ci4gNTU0LTIiLCJjaXR5IjoiVmlsbml1cyIsImNvdW50cnkiOiJMVCJ9LCJwaG9uZU51bWJlciI6IiszNzA5ODIzNDQyMyIsImVtYWlsIjoic2ltb25hcy5rYXJ1emFzQGdtYWlsLmNvbSJ9LCJ2ZWhpY2xlIjp7Im1ha2UiOiJUb3lvdGEiLCJ0eXBlIjoiUkFWNCIsInJlZ2lzdHJhdGlvbk5yIjoiQUJDMTIzIiwiY291bnRyeU9mUmVnaXN0cmF0aW9uIjoiTFQiLCJ0cmFpbGVyIjpmYWxzZX0sImluc3VyYW5jZUNvbXBhbnkiOnsiY291bnRyeSI6IkxUIiwibmFtZSI6IlN1cGVyIEluc3VyYW5jZSIsInBvbGljeU5yIjoiOTg5NDgzIiwiZ3JlZW5DYXJkTnIiOiI1NDU0MjMiLCJ2YWxpZEZyb20iOiIyMDE3LTAxLTAxIiwidmFsaWRUbyI6IjIwMjItMDEtMDEiLCJhZ2VuY3lPckJyb2tlciI6IllvdXIgTG9jYWwgSW5zdXJhbmNlIEFnZW50IiwiYWRkcmVzcyI6IlJlYWwgc3RyLiA4MiwgVmlsbml1cywgTGl0aHVhbmlhIiwicGhvbmVOdW1iZXIiOiIrMzcwNDIzNDIzNSIsImVtYWlsIjoiYWdlbnRAZ21haWwuY29tIiwiZG9lc1RoZVBvbGljeUNvdmVyTWF0ZXJpYWxEYW1hZ2VUb1RoZVZlaGljbGUiOmZhbHNlfSwiZHJpdmVyIjp7Im5hbWUiOiJEb2UiLCJmaXJzdE5hbWUiOiJKb2huIiwiZGF0ZU9mQmlydGgiOiIxOTg3LTAxLTA1IiwicGVyc29uYWxDb2RlIjoiMjM0NDIzNDIzIiwiYWRkcmVzcyI6IlRoaXJkIHN0ciAzLTUsIFZpbG5pdXMiLCJjb3VudHJ5IjoiTFQiLCJwaG9uZU51bWJlciI6IiszNzA5ODMyNDkyMzQiLCJlbWFpbCI6ImpvaG4uZG9lQGdtYWlsLmNvbSIsImRyaXZpbmdMaWNlbnNlTnIiOiIyMzI0MjM0IiwiY2F0ZWdvcnkiOlsiQSIsIkIiXSwidmFsaWRGcm9tIjoiMjAxMC0wMS0wMSIsInZhbGlkVG8iOiIyMDIyLTAxLTAxIn0sInBvaW50T2ZJbml0aWFsSW1wYWN0VG9WZWhpY2xlQSI6OTgsInZpc2libGVEYW1hZ2VUb1ZlaGljbGVBIjpbIlJpZ2h0IGZyb250IGRvb3IiLCJSaWdodCByZWFyIHdoZWVsIl0sImFkZGl0aW9uYWxEZXNjcmlwdGlvbiI6IkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNjaW5nIGVsaXQuIE1vcmJpIHNpdCBhbWV0IGFudGUgY29uc2VxdWF0LCBmZXVnaWF0IHRlbGx1cyBhdCwgZnJpbmdpbGxhIG1pLiBQaGFzZWxsdXMgZWdlc3RhcywgbWV0dXMgc2l0IGFtZXQgc3VzY2lwaXQgc2NlbGVyaXNxdWUsIGFyY3UgbG9yZW0gbW9sbGlzIG1ldHVzLCBkaWduaXNzaW0gZ3JhdmlkYSBudW5jIHZlbGl0IHF1aXMgbG9yZW0uIFBoYXNlbGx1cyBtYXhpbXVzLCBsb3JlbSBsb2JvcnRpcyBjdXJzdXMgbW9sZXN0aWUsIGxpYmVybyBsb3JlbSB2ZW5lbmF0aXMgbWV0dXMsIGF0IGNvbmd1ZSBsb3JlbSBtZXR1cyBxdWlzIHJpc3VzLiBWaXZhbXVzIGFjY3Vtc2FuIGxlbyBwdXJ1cywgdmVsIG1vbGxpcyBsZWN0dXMgbW9sbGlzIHZlbC4gTnVuYyBvcmNpIG5pc2ksIGZlcm1lbnR1bSBhIGxvcmVtIG5vbiwgc29kYWxlcyBsb2JvcnRpcyBsb3JlbS4gTnVsbGFtIGJsYW5kaXQgdmFyaXVzIGZlbGlzIGluIGNvbnNlcXVhdC4gVml2YW11cyB0aW5jaWR1bnQgdml2ZXJyYSBtYXVyaXMsIGlkIHNjZWxlcmlzcXVlIHVybmEgdGVtcG9yIGF1Y3Rvci4gRXRpYW0gc2VkIGVmZmljaXR1ciBkb2xvci4gU3VzcGVuZGlzc2UgcHVsdmluYXIgZW5pbSBpZCBsaWJlcm8gcG9zdWVyZSBjdXJzdXMgbW9sZXN0aWUgcXVpcyBwdXJ1cy4gRHVpcyBhdCBtYXVyaXMgZWdldCBhdWd1ZSBpbnRlcmR1bSBlbGVtZW50dW0gZWdldCBpbiBsYWN1cy4iLCJjaXJjdW1zdGFuY2VzIjpbIlBhcmtlZCIsIk9wZW5pbmcgdGhlIGRvb3IiXSwibGlhYmxlRm9yQ2F1c2luZ0RhbWFnZSI6ZmFsc2V9LCJ2ZWhpY2xlQiI6eyJwb2xpY3lIb2xkZXIiOnsibmFtZU9yQ29tcGFueU5hbWUiOiJEb2UiLCJmaXJzdE5hbWUiOiJKYW5lIiwicGVyc29uYWxDb2RlT3JSZWdOciI6IjQ1MzQ1MzQiLCJhZGRyZXNzIjp7InBvc3RhbENvZGUiOiJMVC0zNjY2MyIsInN0cmVldCI6Ik90aGVyIHN0ci4gNTU1LTIiLCJjaXR5IjoiVmlsbml1cyIsImNvdW50cnkiOiJMVCJ9LCJwaG9uZU51bWJlciI6IiszNzA5ODIzNDQyMyIsImVtYWlsIjoiamFuZS5kb2VAZ21haWwuY29tIn0sInZlaGljbGUiOnsibWFrZSI6IldWIiwidHlwZSI6IkdvbGYiLCJyZWdpc3RyYXRpb25OciI6IktVUzkzNCIsImNvdW50cnlPZlJlZ2lzdHJhdGlvbiI6IkxUIiwidHJhaWxlciI6ZmFsc2V9LCJpbnN1cmFuY2VDb21wYW55Ijp7ImNvdW50cnkiOiJMVCIsIm5hbWUiOiJTdXBlciBJbnN1cmFuY2UiLCJwb2xpY3lOciI6IjIzNDIzNDIzNCIsImdyZWVuQ2FyZE5yIjoiNTQzYTQiLCJ2YWxpZEZyb20iOiIyMDE2LTAxLTAxIiwidmFsaWRUbyI6IjIwMjMtMDEtMDEiLCJhZ2VuY3lPckJyb2tlciI6IllvdXIgTG9jYWwgSW5zdXJhbmNlIEFnZW50IiwiYWRkcmVzcyI6IlJlYWwgc3RyLiA4MiwgVmlsbml1cywgTGl0aHVhbmlhIiwicGhvbmVOdW1iZXIiOiIrMzcwNDIzNDIzNSIsImVtYWlsIjoiYWdlbnRAZ21haWwuY29tIiwiZG9lc1RoZVBvbGljeUNvdmVyTWF0ZXJpYWxEYW1hZ2VUb1RoZVZlaGljbGUiOnRydWV9LCJkcml2ZXIiOnsibmFtZSI6IkRvZSIsImZpcnN0TmFtZSI6IkpvaG4iLCJkYXRlT2ZCaXJ0aCI6IjE5ODctMDEtMDUiLCJwZXJzb25hbENvZGUiOiIyMzQ0MjM0MjMiLCJhZGRyZXNzIjoiVGhpcmQgc3RyIDMtNSwgVmlsbml1cyIsImNvdW50cnkiOiJMVCIsInBob25lTnVtYmVyIjoiKzM3MDk4MzI0OTIzNCIsImVtYWlsIjoiam9obi5kb2VAZ21haWwuY29tIiwiZHJpdmluZ0xpY2Vuc2VOciI6IjIzMjQyMzQiLCJjYXRlZ29yeSI6WyJBIiwiQiJdLCJ2YWxpZEZyb20iOiIyMDEwLTAxLTAxIiwidmFsaWRUbyI6IjIwMjItMDEtMDEifSwicG9pbnRPZkluaXRpYWxJbXBhY3RUb1ZlaGljbGVCIjo5OCwidmlzaWJsZURhbWFnZVRvVmVoaWNsZUIiOlsiTGVmdCBmcm9udCBkb29yIiwiTGVmdCByZWFyIHdoZWVsIl0sImFkZGl0aW9uYWxEZXNjcmlwdGlvbiI6IkV0aWFtIHNhZ2l0dGlzIHNlbSBlbGVtZW50dW0gdGVtcHVzIHRlbXBvci4gUGVsbGVudGVzcXVlIGhhYml0YW50IG1vcmJpIHRyaXN0aXF1ZSBzZW5lY3R1cyBldCBuZXR1cyBldCBtYWxlc3VhZGEgZmFtZXMgYWMgdHVycGlzIGVnZXN0YXMuIEludGVnZXIgYWxpcXVhbSBsaWJlcm8gYWMgZXJhdCBtb2xsaXMsIGluIG1hbGVzdWFkYSB1cm5hIHZlc3RpYnVsdW0uIE51bGxhIGZlcm1lbnR1bSB1cm5hIGFjIG1hbGVzdWFkYSB0ZW1wdXMuIERvbmVjIGRpZ25pc3NpbSByaXN1cyBhIGhlbmRyZXJpdCBhbGlxdWFtLiBDcmFzIHVsdHJpY2llcyBvZGlvIGEgZmVsaXMgbWF4aW11cywgYWMgc29kYWxlcyBsaWd1bGEgbGFjaW5pYS4gQ3JhcyB1bGxhbWNvcnBlciBtaSB2ZWwgYXJjdSB2dWxwdXRhdGUgdm9sdXRwYXQuIEFsaXF1YW0gc2FnaXR0aXMgaW50ZXJkdW0gZW5pbSwgaWQgdmFyaXVzIGxpYmVybyBsb2JvcnRpcyBpbi4gUGVsbGVudGVzcXVlIGhhYml0YW50IG1vcmJpIHRyaXN0aXF1ZSBzZW5lY3R1cyBldCBuZXR1cyBldCBtYWxlc3VhZGEgZmFtZXMgYWMgdHVycGlzIGVnZXN0YXMuIFF1aXNxdWUgc2l0IGFtZXQgdXJuYSBsYWNpbmlhLCB1bGxhbWNvcnBlciB1cm5hIHNpdCBhbWV0LCB1bHRyaWNlcyBvcmNpLiBBZW5lYW4gZXUgZXggcG9ydHRpdG9yLCB0cmlzdGlxdWUgdGVsbHVzIG5lYywgdGVtcHVzIHB1cnVzLiBDdXJhYml0dXIgbm9uIHVybmEgcG9zdWVyZSwgdGVtcHVzIHR1cnBpcyBuZWMsIHVsbGFtY29ycGVyIG5pc2wuIEluIGhlbmRyZXJpdCBwdXJ1cyBldCBpbnRlcmR1bSBmaW5pYnVzLiBQcmFlc2VudCBmZXVnaWF0LCBhdWd1ZSBzZWQgZnJpbmdpbGxhIGxhb3JlZXQsIHF1YW0gZXJvcyBjb21tb2RvIGR1aSwgbm9uIHNvZGFsZXMgbWkgcXVhbSB1dCBlcm9zLiIsImNpcmN1bXN0YW5jZXMiOlsiRW50ZXJpbmcgcGFya2luZyBnYXJhZ2UiXSwibGlhYmxlRm9yQ2F1c2luZ0RhbWFnZSI6dHJ1ZX0sInNrZXRjaE9mQWNjaWRlbnRXaGVuSW1wYWN0T2NjdXJlZFVSTCI6Imh0dHBzOi8vaS5pbWd1ci5jb20vaUswYUpKZy5qcGcifX0.11W8IfWSrvKWMWtqznM4EDT34o1Z5JN2jFleWd6s63hM1x4A6zftKEGJZz0WJdl5qejB-kdYNO_4w4Tbmy3iCg'))

      // Disclosure request with redirect back to RN Demo app
      // yield put(handleURL('https://id.uport.me/req/eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1MzE4MTUxNjUsInJlcXVlc3RlZCI6WyJuYW1lIiwiYXZhdGFyIl0sImNhbGxiYWNrIjoiMm9lWHVmSEdEcFU1MWJmS0JzWkRkdTdKZTl3ZUozcjdzVkc6L3Vwb3J0IiwibmV0IjoiMHg0IiwiYWN0Ijoia2V5cGFpciIsImV4cCI6MTgzMTczODIwMywidHlwZSI6InNoYXJlUmVxIiwiaXNzIjoiMm9lWHVmSEdEcFU1MWJmS0JzWkRkdTdKZTl3ZUozcjdzVkcifQ.zbrk75RFGvN3XFNRcnLbkNui1ZU-7pzVsIOE5clfp1r1CCj3B0ID6MrS8atN5VjbM2OWGDZtkZ3SeSGndaLM6w?callback_type=redirect&redirect_url=2oeXufHGDpU51bfKBsZDdu7Je9weJ3r7sVG%3A%2Fuport%23id%3Dlogin'))

      // Request in unsupported URL
      // yield put(handleURL('https://bit.ly/2AcEuRT'))
      // yield put(handleURL('https://cloudflare-ipfs.com/ipfs/Qmaj9EbpoYKe71jBXnsSwocUdu6yQbVCYBwFmB6orQy4Cc'))
    } else {
      yield put(featureFlagsLoad())
      yield put(flagNewbie())
      yield call(startOnboarding)
    }
  } catch (e) {
    console.log('---------------------------------------------------')
    console.log('error while checking for identity')
    // console.tron.log('error while checking for identity')
    console.log(e)
    // console.tron.log(e)
  }
}

function* watchAppStateChange() {
  const appStateChannel = yield eventChannel(emitter => {
    function handler(state) {
      if (state === 'active') emitter(state)
    }
    AppState.addEventListener('change', handler)
    return () => AppState.removeEventListener('change', handler)
  })

  while (true) {
    yield take(appStateChannel)
    const address = yield select(currentAddress)
    const ft = yield select(fuelToken)
    if (address && address !== 'new' && ft) {
      yield put(activationEvent('OPEN_APP'))
      yield put(checkForNotifications())
      yield put(updateBadgeCount())
    }
  }
}

function* restartOnboarding() {
  yield call(startOnboarding)
}

function* startupSaga() {
  yield startApplication()
  yield spawn(watchAppStateChange)
  yield takeLatest(RESET_DEVICE, restartOnboarding)
}

export default startupSaga
