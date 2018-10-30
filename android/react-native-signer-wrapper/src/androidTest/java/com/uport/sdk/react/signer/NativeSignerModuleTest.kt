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

import android.support.test.InstrumentationRegistry
import android.support.test.rule.ActivityTestRule
import android.util.Base64
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.soloader.SoLoader
import com.uport.sdk.signer.UportSigner.Companion.ERR_ACTIVITY_DOES_NOT_EXIST
import com.uport.sdk.signer.UportSigner.Companion.ERR_ENCODING_ERROR
import com.uport.sdk.signer.UportSigner.Companion.ERR_KEY_NOT_REGISTERED
import com.uport.sdk.signer.getJoseEncoded
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.kethereum.crypto.Keys.PUBLIC_KEY_SIZE
import org.kethereum.extensions.toBigInteger
import org.kethereum.model.SignatureData
import java.math.BigInteger
import java.security.Signature
import java.util.*
import java.util.concurrent.CountDownLatch

class NativeSignerModuleTest {

    //TODO: move tests that require an activity to a new class for easier maintenance

    @Rule
    @JvmField
    val mActivityRule: ActivityTestRule<TestDummyActivity> = ActivityTestRule(TestDummyActivity::class.java, true, false)

    private val privKeyBase64 = "EOp3SR6K9wR6Nrx4RWCjL0NaXKNapJkSmCfjTDkGylM="
    private val pubKeyBase64WithPrefix = "BAt4lWIRBf8s8yEInDL20D0sl0f5+bYZ1r40XCfYbuu36fbUsg3kXEje0LHV54YnR1AgcbGJoBLl+rLQ5+/QPgM="
    private val addressReference = "0xbcaba6e236ac4d0bafa5f37fc756986c5b4b80f7"

    private lateinit var reactContext: ReactApplicationContext

    @Before
    fun setUp() {
        reactContext = ReactApplicationContext(InstrumentationRegistry.getContext())
        SoLoader.init(reactContext, false)
    }

    @Test
    fun createsKeypairSimpleEncryption() {

        val latch = CountDownLatch(1)

        NativeSignerModule(reactContext).createKeyPair(null, PromiseHelper({ err, result ->
            assertNull(err)
            assertTrue(result is WritableMap)
            val wm: WritableMap = result as WritableMap

            val address = wm.getString("address")
            val publicKey = wm.getString("pubKey")

            assertTrue(address.matches("0x[0-9a-fA-F]{40}".toRegex()))
            assertTrue(Base64.decode(publicKey, Base64.DEFAULT).size == PUBLIC_KEY_SIZE + 1)

            latch.countDown()
        }))

        latch.await()
    }


    @Test
    fun importKeyFailsOnEmptyKey() {

        NativeSignerModule(reactContext).importKey("", null, PromiseHelper({ err, _ ->
            assertNotNull(err)
            assertTrue(err.toString().contains("E_BLANK_KEY"))
        }))

    }

    @Test
    fun importKeyFailsOnBadKey() {

        NativeSignerModule(reactContext).importKey("bad^key+-_=", null, PromiseHelper({ err, _ ->
            assertNotNull(err)
            assertTrue(err.toString().contains(ERR_ENCODING_ERROR))
        }))

    }

    @Test
    fun importKeySimpleEncryption() {

        val latch = CountDownLatch(1)

        NativeSignerModule(reactContext).importKey(privKeyBase64, "simple", PromiseHelper({ err, result ->
            assertNull(err)
            assertTrue(result is WritableMap)
            val wm: WritableMap = result as WritableMap

            val address = wm.getString("address")
            val publicKey = wm.getString("pubKey")

            assertEquals(addressReference, address)
            assertEquals(pubKeyBase64WithPrefix, publicKey)

            latch.countDown()
        }))

        latch.await()
    }

    @Test
    fun signTxWorksOnHappyPath() {

        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)

        //ensure key exists
        val latch = CountDownLatch(1)
        NativeSignerModule(reactContext).importKey(privKeyBase64, "simple", PromiseHelper({ _, _ -> latch.countDown() }))
        latch.await()

        val sigLatch = CountDownLatch(1)

        NativeSignerModule(reactContext).signTx(addressReference, Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val v = wm.getInt("v")
                    val r = wm.getString("r")
                    val s = wm.getString("s")

                    assertEquals(27, v)
                    assertEquals("06dDAXM7bh3sX022WwGifV+Rdh74TbhdwiotF0kOUj4=", r)
                    assertEquals("Y5hMbQzyI4iSEqp+Wu4dNBmgBIxIJNd3dWg8mnMRxug=", s)
                    sigLatch.countDown()
                }))

        sigLatch.await()

    }

    @Test
    fun signTxFailsOnMissingKey() {

        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)

        val sigLatch = CountDownLatch(1)

        NativeSignerModule(reactContext).signTx("unknown address", Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, _ ->
                    assertNotNull(err)
                    assertTrue(err.toString().contains(ERR_KEY_NOT_REGISTERED))
                    sigLatch.countDown()
                }))

        sigLatch.await()

    }

    @Test
    fun signTxSimpleWorksOnMissingActivity() {

        //ensure key exists under simple encryption
        val latch = CountDownLatch(1)
        NativeSignerModule(reactContext).importKey(privKeyBase64, "simple", PromiseHelper({ _, _ -> latch.countDown() }))
        latch.await()

        val sigLatch = CountDownLatch(1)

        NativeSignerModule(reactContext).signTx(addressReference, Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val v = wm.getInt("v")
                    val r = wm.getString("r")
                    val s = wm.getString("s")

                    assertEquals(27, v)
                    assertEquals("06dDAXM7bh3sX022WwGifV+Rdh74TbhdwiotF0kOUj4=", r)
                    assertEquals("Y5hMbQzyI4iSEqp+Wu4dNBmgBIxIJNd3dWg8mnMRxug=", s)
                    sigLatch.countDown()
                }))

        sigLatch.await()

    }

    @Test
    fun signJwtWorksOnHappyPath() {
        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)

        //ensure key exists
        val latch = CountDownLatch(1)
        NativeSignerModule(reactContext).importKey(privKeyBase64, "simple", PromiseHelper({ _, _ -> latch.countDown() }))
        latch.await()

        val sigLatch = CountDownLatch(1)

        NativeSignerModule(reactContext).signJwt(addressReference, Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, result ->
                    assertNull(err)

                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val v = wm.getInt("v")
                    val r = Base64.decode(wm.getString("r"), Base64.DEFAULT)
                    val s = Base64.decode(wm.getString("s"), Base64.DEFAULT)

                    val sig = SignatureData(BigInteger(1, r), BigInteger(1, s), v.toByte())

                    assertEquals("bShr9c0HgYe_CkYsm0EirRnbC35KS2NVHV6YG5vSpkbugjlWQT4R2-rzu7qxpV-2nRgmktlSnbvVKAi5D8dhrQ", sig.getJoseEncoded())

                    sigLatch.countDown()
                }))

        sigLatch.await()
    }

    @Test
    fun signJwtFailsOnMissingKey() {

        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)

        val sigLatch = CountDownLatch(1)

        NativeSignerModule(reactContext).signJwt("unknown address", Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, _ ->
                    assertNotNull(err)
                    assertTrue(err.toString().contains(ERR_KEY_NOT_REGISTERED))
                    sigLatch.countDown()
                }))

        sigLatch.await()

    }

    @Test
    fun signJwtSimpleWorksWithMissingActivity() {

        //ensure key exists under simple encryption
        val latch = CountDownLatch(1)
        NativeSignerModule(reactContext).importKey(privKeyBase64, "simple", PromiseHelper({ _, _ -> latch.countDown() }))
        latch.await()

        val sigLatch = CountDownLatch(1)

        NativeSignerModule(reactContext).signJwt(addressReference, Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, result ->
                    assertNull(err)

                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val v = wm.getInt("v")
                    val r = Base64.decode(wm.getString("r"), Base64.DEFAULT)
                    val s = Base64.decode(wm.getString("s"), Base64.DEFAULT)

                    val sig = SignatureData(BigInteger(1, r), BigInteger(1, s), v.toByte())

                    assertEquals("bShr9c0HgYe_CkYsm0EirRnbC35KS2NVHV6YG5vSpkbugjlWQT4R2-rzu7qxpV-2nRgmktlSnbvVKAi5D8dhrQ", sig.getJoseEncoded())

                    sigLatch.countDown()
                }))

        sigLatch.await()
    }

    @Test
    fun signJwtKeyguardFailsWithMissingActivity() {

        //don't instantiate an activity

        //create a key under keyguard encryption
        var address = "0x"

        val latch = CountDownLatch(1)
        NativeSignerModule(reactContext).createKeyPair("singleprompt", PromiseHelper({ err, result ->
            assertNull(err)
            result as WritableMap
            address = result.getString("address")
            latch.countDown()
        }))
        latch.await()

        val sigLatch = CountDownLatch(1)
        NativeSignerModule(reactContext).signJwt(address, Base64.encodeToString("whatever".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, _ ->

                    assertNotNull(err)

                    assertTrue(err.toString().contains(ERR_ACTIVITY_DOES_NOT_EXIST))

                    sigLatch.countDown()

                }))

        sigLatch.await()
    }

    @Test
    fun signTransactionFingerprintFailsWithMissingActivity() {

        //don't instantiate an activity

        //create a key under keyguard encryption
        var address = "0x"

        val latch = CountDownLatch(1)
        NativeSignerModule(reactContext).createKeyPair("prompt", PromiseHelper({ err, result ->
            assertNull(err)
            result as WritableMap
            address = result.getString("address")
            latch.countDown()
        }))
        latch.await()

        val sigLatch = CountDownLatch(1)
        NativeSignerModule(reactContext).signTx(address, Base64.encodeToString("whatever".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, _ ->

                    assertNotNull(err)

                    assertTrue(err.toString().contains(ERR_ACTIVITY_DOES_NOT_EXIST))

                    sigLatch.countDown()

                }))

        sigLatch.await()
    }

    @Test
    fun allAddresses() {
        //ensure key exists
        val latch = CountDownLatch(1)
        NativeSignerModule(reactContext).importKey(privKeyBase64, "simple", PromiseHelper({ _, _ -> latch.countDown() }))
        latch.await()

        NativeSignerModule(reactContext).allAddresses(PromiseHelper({ err, result ->
            assertNull(err)
            assertTrue(result is WritableNativeArray)
            val wna: WritableNativeArray = result as WritableNativeArray
            assertTrue(wna.toArrayList().contains(addressReference))
        }))
    }

    @Test
    fun allAddressesGetsNewlyImportedKey() {
        //ensure key exists
        val privKeyBytes = ByteArray(32)
        Random().nextBytes(privKeyBytes)
        var newAddress = "0xbadadd4e55"

        val latch = CountDownLatch(1)
        NativeSignerModule(reactContext).importKey(Base64.encodeToString(privKeyBytes, Base64.DEFAULT), "simple",
                PromiseHelper({ _, result ->
                    result as WritableMap
                    newAddress = result.getString("address")
                    latch.countDown()
                }))
        latch.await()

        NativeSignerModule(reactContext).allAddresses(PromiseHelper({ err, result ->
            assertNull(err)
            assertTrue(result is WritableNativeArray)
            result as WritableNativeArray
            assertTrue(result.toArrayList().contains(newAddress))
        }))
    }

    @Test
    fun storeEncryptionPrivateKey() {
        NativeSignerModule(reactContext).storeEncryptionPrivateKey(
                "whatever",
                "some key bytes",
                "simple",
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertTrue(result is Boolean)
                    assertEquals(true, result)
                })
        )
    }

    @Test
    fun loadEncryptionPrivateKey() {
        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)
        //ensure privKey has been previously stored
        val publicKey = "some public key encoded"
        val privateKey = "some private key encoded"
        var latch = CountDownLatch(1)
        NativeSignerModule(reactContext).storeEncryptionPrivateKey(
                publicKey,
                privateKey,
                "simple",
                PromiseHelper({ err, _ ->
                    assertNull(err)
                    latch.countDown()
                })
        )
        latch.await()

        latch = CountDownLatch(1)
        NativeSignerModule(reactContext).loadEncryptionPrivateKey(
                publicKey,
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertEquals(privateKey, result)
                    latch.countDown()
                })
        )
        latch.await()
    }

    @Test
    fun storeRecoverySeed() {
        NativeSignerModule(reactContext).storeRecoverySeed(
                "0x whatever address",
                "some seed",
                "simple",
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertTrue(result is Boolean)
                    assertEquals(true, result)
                })
        )
    }

    @Test
    fun loadRecoverySeed() {
        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)
        //ensure stored seed
        val address = "0x some address"
        val seed = "some seed words"
        var latch = CountDownLatch(1)
        NativeSignerModule(reactContext).storeRecoverySeed(
                address,
                seed,
                "simple",
                PromiseHelper({ err, _ ->
                    assertNull(err)
                    latch.countDown()
                })
        )
        latch.await()

        latch = CountDownLatch(1)
        NativeSignerModule(reactContext).loadRecoverySeed(
                address,
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertEquals(seed, result)
                    latch.countDown()
                })
        )
        latch.await()
    }

    @Test(expected = KotlinNullPointerException::class)
    fun createKeyCrashOnNullPromise() {
        NativeSignerModule(reactContext).createKeyPair("simple", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun importKeyCrashOnNullPromise() {
        NativeSignerModule(reactContext).importKey("pks", "simple", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun signTxCrashesOnNullPromise() {
        NativeSignerModule(reactContext).signTx("noaddr", "nopayload", "", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun signJwtCrashesOnNullPromise() {
        NativeSignerModule(reactContext).signJwt("noaddr", "nodata", "", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun allAddressesCrashesOnNullPromise() {
        NativeSignerModule(reactContext).allAddresses(null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun storeEncryptionPrivateKeyCrashesOnNullPromise() {
        NativeSignerModule(reactContext).storeEncryptionPrivateKey("nopk", "nopk", "", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun loadEncryptionPrivateKeyCrashesOnNullPromise() {
        NativeSignerModule(reactContext).loadEncryptionPrivateKey("nopk", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun storeRecoverySeedCrashesOnNullPromise() {
        NativeSignerModule(reactContext).storeRecoverySeed("noaddr", "noseed", "", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun loadRecoverySeedCrashesOnNullPromise() {
        NativeSignerModule(reactContext).loadRecoverySeed("noaddr", null)
    }

}