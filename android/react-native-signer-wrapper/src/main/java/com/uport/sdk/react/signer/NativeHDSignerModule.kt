/*
 * Copyright (C) 2018 ConsenSys AG
 *
 * This file is part of uPort Mobile App.
 *
 * uPort Mobile App is free software: you can redistribute it and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * uPort Mobile App is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with uPort Mobile App.
 * If not, see <http://www.gnu.org/licenses/>.
 *
 */

package com.uport.sdk.react.signer

import android.text.TextUtils
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import com.uport.sdk.signer.UportHDSigner
import com.uport.sdk.signer.UportSigner
import com.uport.sdk.signer.UportSigner.Companion.ERR_BLANK_KEY
import com.uport.sdk.signer.encryption.KeyProtection.Level
import com.uport.sdk.signer.keyToBase64
import org.kethereum.bip32.generateKey
import org.kethereum.bip39.Mnemonic


/**
 * wrapper for the UportSigner functionality
 */
class NativeHDSignerModule(reactContext: ReactApplicationContext?)
    : NativeSignerModule(reactContext) {

    override fun getName(): String = "NativeHDSignerModule"

    //hd signer methods
    @ReactMethod
    fun hasSeed(promise: Promise?) {
        promise!!

        promise.resolve(UportHDSigner().hasSeed(reactApplicationContext))
    }

    /**
     * Generates a seed securely and natively
     * Derives the root account with BIP 32 path `m/7696500'/0'/0'/0'`
     * Calculates the ethereum rootAddress and corresponding publicKey of the rootAccount
     * Stores seed phrase in vault using the rootAddress as label at the given security [level]
     * Returns address and publicKey as a dictionary in a promise
     *
     * @param level the security level used to store the encrypted seed
     * @param promise the promise used to pass back the results to react-native
     */
    @ReactMethod
    fun createSeed(level: String?, promise: Promise?) {
        promise!!

        val keyLevel: Level = keyLevelFromString(level ?: "")

        UportHDSigner().createHDSeed(
                reactApplicationContext,
                keyLevel,
                { err, address, pubKey ->
                    if (err != null) {
                        return@createHDSeed promise.reject(err)
                    }
                    val map = WritableNativeMap()
                    map.putString("address", address)
                    map.putString("pubKey", pubKey)
                    return@createHDSeed promise.resolve(map)
                }
        )
    }

    @ReactMethod
    fun deleteSeed(label: String) {
        UportHDSigner().deleteSeed(
                reactApplicationContext,
                label
        )
    }

    /**
     * Derives the ethereum address and public key using the given [derivationPath] starting from
     * the seed that generated the given [rootAddress]
     *
     * The respective seed must have been previously generated or imported.
     *
     * Returns the address and publicKey as a dictionary in the provided [promise]
     *
     * @param rootAddress a 0x prefixed hex string
     * @param derivationPath the BIP32 derivation desired
     * @param prompt the message shown to the user when decrypting the seed
     *          (if it is encoded using fingerprint or PIN )
     * @param promise the promise used to resolve the calculated address and publicKey or reject with an error
     *
     */
    @ReactMethod
    fun addressForPath(rootAddress: String?, derivationPath: String?, prompt: String?, promise: Promise?) {
        promise!!

        val rootAddr = rootAddress
                ?: return promise.reject(IllegalArgumentException("address can't be null"))
        val hdPath = derivationPath
                ?: return promise.reject(IllegalArgumentException("derivation path can't be null"))

        UportHDSigner().computeAddressForPath(
                reactApplicationContext,
                rootAddr,
                hdPath,
                prompt ?: "",
                { err, address, pubKey ->
                    if (err != null) {
                        return@computeAddressForPath promise.reject(err)
                    }
                    val map = WritableNativeMap()
                    map.putString("address", address)
                    map.putString("pubKey", pubKey)
                    return@computeAddressForPath promise.resolve(map)
                }
        )
    }

    /**
     * Decrypts the seed that generated the given [rootAddress] and returns it as a mnemonic phrase
     *
     * The respective seed must have been previously generated or imported.
     * The result is passed back to react-native using the provided [promise]
     *
     * @param rootAddress a 0x prefixed hex string
     * @param prompt is the msg string to show when requesting the Fingerprint / PIN (if required by the encryption level)
     * @param promise the promise used to pass back the resulting phrase or reject with an error
     *
     */
    @ReactMethod
    fun showSeed(rootAddress: String?, prompt: String?, promise: Promise?) {
        promise!!

        val rootAddr = rootAddress ?: return promise.reject(
                IllegalArgumentException("root address can't be null"))

        UportHDSigner().showHDSeed(
                reactApplicationContext,
                rootAddr,
                prompt ?: "",
                { err, phrase ->
                    return@showHDSeed if (err != null) {
                        promise.reject(err)
                    } else {
                        promise.resolve(phrase)
                    }
                }
        )
    }

    /**
     * Imports a seed from another source or other mobile app
     * Derives the `rootAccount`(extended private key) with BIP 32 path `m/7696500'/0'/0'/0'`
     * Calculates the ethereum `rootAddress` and corresponding `publicKey` of the `rootAccount`
     * Stores seed phrase in vault using the `rootAddress` as label at the given security [level]
     * Returns address and publicKey as a dictionary in the given [promise]
     *
     * @param seed a string containing 12 word BIP 39 seed phrase
     * @param level the security level used to store the encrypted seed
     * @param promise the promise used to pass back the results to react-native
     */
    @ReactMethod
    fun importSeed(seed: String?, level: String?, promise: Promise?) {
        promise!!

        val keyLevel: Level = keyLevelFromString(level ?: "")
        if (TextUtils.isEmpty(seed)) {
            return promise.reject(ERR_BLANK_KEY, "Cannot import a null or empty seed phrase")
        }

        //can't fail because of the above check
        seed!!

        UportHDSigner().importHDSeed(
                reactApplicationContext,
                keyLevel,
                seed,
                { err, address, pubKey ->
                    if (err != null) {
                        return@importHDSeed promise.reject(err)
                    }

                    val map = WritableNativeMap()
                    map.putString("address", address)
                    map.putString("pubKey", pubKey)
                    return@importHDSeed promise.resolve(map)
                }
        )
    }

    /**
     * Signs a transaction using the key derived using to the [derivationPath]
     * starting from the `seed` that generated [rootAddress]
     *
     * The `seed` should already have been imported or created.
     *
     * Unlocks seed from keychain, derives the key and then follows the exact same procedure as existing [NativeSignerModule.signTx]
     *
     * @param rootAddress the 0x prefixed hex string label used to locate the `seed`
     * @param derivationPath a String that defines the desired BIP32 derivation path
     * @param txPayload is a base64 encoded [ByteArray] of the raw message to be signed
     * @param prompt is the msg string to show when requesting the Fingerprint / PIN (if required by the `seed` encryption level)
     * @param promise used to pass back the resolved `(v,r,s)` signature elements or to reject with error
     *
     */
    @ReactMethod
    fun signTx(rootAddress: String?, derivationPath: String?, txPayload: String?, prompt: String?, promise: Promise?) {

        promise!!

        val rootAddr = rootAddress
                ?: return promise.reject(IllegalArgumentException("address can't be null"))
        val payload = txPayload
                ?: return promise.reject(IllegalArgumentException("data can't be null"))
        val hdPath = derivationPath
                ?: return promise.reject(IllegalArgumentException("derivation path can't be null"))

        val activity = currentActivity ?: reactApplicationContext

        UportHDSigner().signTransaction(
                activity,
                rootAddr,
                hdPath,
                payload,
                prompt ?: "",
                { err, sigData ->
                    if (err != null) {
                        return@signTransaction promise.reject(err)
                    }
                    val map = WritableNativeMap()
                    map.putInt("v", sigData.v.toInt())
                    map.putString("r", sigData.r.keyToBase64())
                    map.putString("s", sigData.s.keyToBase64())
                    return@signTransaction promise.resolve(map)
                }
        )
    }

    /**
     * Signs a JWT bundle using the key derived using to the [derivationPath]
     * starting from the `seed` that generated [rootAddress]
     *
     * The `seed` should already have been imported or created.
     *
     * Unlocks seed from keychain, derives the key and then follows the exact same procedure as existing [NativeSignerModule.signJwt]
     *
     * @param rootAddress the 0x prefixed hex string label used to locate the `seed`
     * @param derivationPath a String that defines the desired BIP32 derivation path
     * @param data is a base64 encoding of the bundle [ByteArray] to be signed
     * @param prompt is the msg string to show when requesting the Fingerprint / PIN (if required by the `seed` encryption level)
     * @param promise is used to pass back the resolved map of `(v,r,s)` signature components or reject with error.
     *
     *              The v and r signature components are passed back base64 encoded
     *
     */
    @ReactMethod
    fun signJwt(rootAddress: String?, derivationPath: String?, data: String?, prompt: String?, promise: Promise?) {
        promise!!

        val rootAddr = rootAddress
                ?: return promise.reject(IllegalArgumentException("address can't be null"))
        val payload = data ?: return promise.reject(IllegalArgumentException("data can't be null"))
        val hdPath = derivationPath
                ?: return promise.reject(IllegalArgumentException("derivation path can't be null"))

        val activity = currentActivity ?: reactApplicationContext

        UportHDSigner().signJwtBundle(
                activity,
                rootAddr,
                hdPath,
                payload,
                prompt ?: "",
                { err, sigData ->
                    if (err != null) {
                        return@signJwtBundle promise.reject(err)
                    }
                    val map = WritableNativeMap()
                    map.putInt("v", sigData.v.toInt())
                    map.putString("r", sigData.r.keyToBase64())
                    map.putString("s", sigData.s.keyToBase64())
                    return@signJwtBundle promise.resolve(map)

                }
        )
    }

    /**
     * FIXME: this method is a temporary workaround, it should be removed as soon as possible as it represents a security risk.
     * The method exists because the result is used to derive encryption keys for push notifications.
     * The push encryption method is not yet implemented in native so this is used instead.
     *
     *
     *
     * Decrypts the seed that generated the given [rootAddress] and derives a private key using the [derivationPath]
     * The respective seed must have been previously generated or imported.
     * The resulting key is passed back to RN as a [android.util.Base64] encoded string using the provided [promise]
     */
    @ReactMethod
    fun privateKeyForPath(rootAddress: String?, derivationPath: String?, prompt: String?, promise: Promise?) {
        promise!!
        val rootAddr = rootAddress
                ?: return promise.reject(IllegalArgumentException("address can't be null"))
        val hdPath = derivationPath
                ?: return promise.reject(IllegalArgumentException("derivation path can't be null"))

        val activity = currentActivity ?: reactApplicationContext

        val (encryptionLayer, encryptedEntropy, storageError) =
                UportHDSigner().getEncryptionForLabel(activity, UportSigner.asSeedLabel(rootAddr))

        if (storageError != null) {
            return promise.reject(storageError)
        }

        encryptionLayer.decrypt(activity, prompt ?: "", encryptedEntropy, { err, entropyBuff ->
            if (err != null) {
                return@decrypt promise.reject(err)
            }

            try {
                val phrase = Mnemonic.entropyToMnemonic(entropyBuff)
                val seed = Mnemonic.mnemonicToSeed(phrase)
                val extendedKey = generateKey(seed, hdPath)

                val keyPair = extendedKey.keyPair

                val encodedKey = keyPair.privateKey.keyToBase64()
                return@decrypt promise.resolve(encodedKey)
            } catch (exception: Exception) {
                return@decrypt promise.reject(exception)
            }
        })
    }

    /**
     * Verifies if the provided mnemonic phrase is usable for generating keys from a seed phrase
     */
    @ReactMethod
    fun validateMnemonic(phrase : String?, promise: Promise?) {
        promise!!

        promise.resolve(UportHDSigner().validateMnemonic(phrase ?: ""))
    }

}
