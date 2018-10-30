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
import com.facebook.soloader.SoLoader
import com.uport.sdk.signer.UportHDSigner.Companion.UPORT_ROOT_DERIVATION_PATH
import com.uport.sdk.signer.UportSigner.Companion.ERR_ACTIVITY_DOES_NOT_EXIST
import com.uport.sdk.signer.UportSigner.Companion.ERR_KEY_NOT_REGISTERED
import com.uport.sdk.signer.getJoseEncoded
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.kethereum.crypto.Keys.PUBLIC_KEY_SIZE
import org.kethereum.model.SignatureData
import java.math.BigInteger
import java.util.concurrent.CountDownLatch

class NativeHDSignerModuleTest {

    @Rule
    @JvmField
    val mActivityRule: ActivityTestRule<TestDummyActivity> = ActivityTestRule(TestDummyActivity::class.java, true, false)

    private lateinit var reactContext: ReactApplicationContext

    private val referenceSeedPhrase: String = "vessel ladder alter error federal sibling chat ability sun glass valve picture"
    private val refRootAddress = "0x794adde0672914159c1b77dd06d047904fe96ac8"

    @Before
    fun setUp() {
        reactContext = ReactApplicationContext(InstrumentationRegistry.getContext())
        SoLoader.init(reactContext, false)
    }

    @Test
    fun createsSeedSimpleEncryption() {

        val latch = CountDownLatch(1)

        NativeHDSignerModule(reactContext).createSeed(null, PromiseHelper({ err, result ->
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
    fun importSeedFailsOnEmptyPhrase() {

        NativeHDSignerModule(reactContext).importSeed("", null, PromiseHelper({ err, _ ->
            assertNotNull(err)
            assertTrue(err.toString().contains("E_BLANK_KEY"))
        }))

    }

    @Test
    fun importSeedFailsOnBadKey() {

        NativeHDSignerModule(reactContext).importSeed("bad seed: all your base are belong to us", null, PromiseHelper({ err, _ ->
            assertNotNull(err)
        }))

    }


    @Test
    fun importSeedWithSimpleEncryption() {

        val latch = CountDownLatch(1)

        val seedPhrase = referenceSeedPhrase
        val refPublicKeyB64 = "BFcWkA3uvBb9nSyJmk5rJgx69UtlGN0zwDiNx5TcVmENEUcvF2V26GYP9/3HNE/7vquemm45hDYEqr1/Nph9aIE="

        NativeHDSignerModule(reactContext).importSeed(seedPhrase,
                "simple",
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val address = wm.getString("address")
                    val publicKey = wm.getString("pubKey")

                    assertEquals(refRootAddress, address)
                    assertEquals(refPublicKeyB64, publicKey)

                    latch.countDown()
                }))

        latch.await()
    }

    @Test
    fun signTxWorksOnHappyPath() {

        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)

        ensureSeedIsImported(referenceSeedPhrase)

        val payload = Base64.encodeToString("Hello, world!".toByteArray(), Base64.DEFAULT)

        val referenceR = "/N/wUAux74/SQpO86paHzc+3JPDG7iVtfXTNhnUmNwo="
        val referenceS = "AYxscXoDrX3feb7HhXvwGS/4O1jrX91OkhhiknuC4QA="

        val sigLatch = CountDownLatch(1)

        NativeHDSignerModule(reactContext).signTx(refRootAddress, UPORT_ROOT_DERIVATION_PATH, payload, "",
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val v = wm.getInt("v")
                    val r = wm.getString("r")
                    val s = wm.getString("s")

                    assertEquals(27, v)
                    assertEquals(referenceR, r)
                    assertEquals(referenceS, s)
                    sigLatch.countDown()
                }))

        sigLatch.await()

    }

    private fun ensureSeedIsImported(referenceSeedPhrase: String) {
        //ensure key exists
        val latch = CountDownLatch(1)
        NativeHDSignerModule(reactContext).importSeed(referenceSeedPhrase, "simple", PromiseHelper({ _, _ -> latch.countDown() }))
        latch.await()
    }

    @Test
    fun signTxFailsOnMissingKey() {

        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)

        val sigLatch = CountDownLatch(1)

        NativeHDSignerModule(reactContext).signTx("unknown address",
                "m/",
                "b64==",
                "",
                PromiseHelper({ err, _ ->
                    assertNotNull(err)
                    assertTrue(err.toString().contains(ERR_KEY_NOT_REGISTERED))
                    sigLatch.countDown()
                }))

        sigLatch.await()

    }

    @Test
    fun signTxSimpleWorksOnMissingActivity() {

        ensureSeedIsImported(referenceSeedPhrase)

        val sigLatch = CountDownLatch(1)

        NativeHDSignerModule(reactContext).signTx(refRootAddress,
                "m/",
                Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT), "",
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val v = wm.getInt("v")
                    val r = wm.getString("r")
                    val s = wm.getString("s")

                    assertEquals(28, v)
                    assertEquals("Srv5DtojG+2HDPLDTZMKY2pfOpAhhklyUJl7qnTPAzY=", r)
                    assertEquals("PSlfxpSWBOYo+fh0NhmTj3topn/kQJo4r3d2UnNjXM8=", s)
                    sigLatch.countDown()
                }))

        sigLatch.await()

    }

    @Test
    fun signJwtWorksOnHappyPath() {
        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)

        ensureSeedIsImported(referenceSeedPhrase)

        val sigLatch = CountDownLatch(1)

        NativeHDSignerModule(reactContext).signJwt(refRootAddress,
                "m/",
                Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT),
                "",
                PromiseHelper({ err, result ->
                    assertNull(err)

                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val v = wm.getInt("v")
                    val r = Base64.decode(wm.getString("r"), Base64.DEFAULT)
                    val s = Base64.decode(wm.getString("s"), Base64.DEFAULT)

                    val sig = SignatureData(BigInteger(1, r), BigInteger(1, s), v.toByte())

                    assertEquals("oyEoq6O1D3414UabSk-Ylg6oPgV_FgSke6b8_Yt83_gu4n8ZvwCn3r7mVdS2BEKoBwWHBMx_-rbXBYFlN6Pdyg", sig.getJoseEncoded())

                    sigLatch.countDown()
                }))

        sigLatch.await()
    }

    @Test
    fun signJwtFailsOnMissingKey() {

        mActivityRule.launchActivity(null)
        reactContext.onHostResume(mActivityRule.activity)

        val sigLatch = CountDownLatch(1)

        NativeHDSignerModule(reactContext).signJwt("unknown address",
                "m/",
                "b64==",
                "",
                PromiseHelper({ err, _ ->
                    assertNotNull(err)
                    assertTrue(err.toString().contains(ERR_KEY_NOT_REGISTERED))
                    sigLatch.countDown()
                }))

        sigLatch.await()

    }

    @Test
    fun signJwtSimpleWorksWithMissingActivity() {

        ensureSeedIsImported(referenceSeedPhrase)
        val expectedSignature = "oyEoq6O1D3414UabSk-Ylg6oPgV_FgSke6b8_Yt83_gu4n8ZvwCn3r7mVdS2BEKoBwWHBMx_-rbXBYFlN6Pdyg"
        val refPayload = Base64.encodeToString("hello".toByteArray(), Base64.DEFAULT)

        val sigLatch = CountDownLatch(1)

        NativeHDSignerModule(reactContext).signJwt(
                refRootAddress,
                "m/",
                refPayload,
                "",
                PromiseHelper({ err, result ->
                    assertNull(err)

                    assertTrue(result is WritableMap)
                    val wm: WritableMap = result as WritableMap

                    val v = wm.getInt("v")
                    val r = Base64.decode(wm.getString("r"), Base64.DEFAULT)
                    val s = Base64.decode(wm.getString("s"), Base64.DEFAULT)

                    val sig = SignatureData(BigInteger(1, r), BigInteger(1, s), v.toByte())

                    assertEquals(expectedSignature, sig.getJoseEncoded())

                    sigLatch.countDown()
                }))

        sigLatch.await()
    }

    @Test
    fun signJwtKeyguardFailsWithMissingActivity() {

        //don't instantiate an activity

        //create a key under keyguard encryption
        var rootAddress = "0x"

        val latch = CountDownLatch(1)
        NativeHDSignerModule(reactContext).createSeed("singleprompt", PromiseHelper({ err, result ->
            assertNull(err)
            result as WritableMap
            rootAddress = result.getString("address")
            latch.countDown()
        }))
        latch.await()

        val sigLatch = CountDownLatch(1)
        NativeHDSignerModule(reactContext).signJwt(
                rootAddress,
                "m/",
                "b64==",
                "",
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
        var rootAddress = "0x"

        val latch = CountDownLatch(1)
        NativeHDSignerModule(reactContext).createSeed("prompt", PromiseHelper({ err, result ->
            assertNull(err)
            result as WritableMap
            rootAddress = result.getString("address")
            latch.countDown()
        }))
        latch.await()

        val sigLatch = CountDownLatch(1)
        NativeHDSignerModule(reactContext).signTx(
                rootAddress,
                "m/",
                "b64==",
                "",
                PromiseHelper({ err, _ ->

                    assertNotNull(err)

                    assertTrue("err is actually ${err.toString()}", err.toString().contains(ERR_ACTIVITY_DOES_NOT_EXIST))

                    sigLatch.countDown()

                }))

        sigLatch.await()
    }

    @Test
    fun addressForPath() {

        ensureSeedIsImported(referenceSeedPhrase)
        val expectedAddress = "0x7321fced9fe749d8480023d18cc27f1bbfd36f12"
        val expectedPubKey = "BDi9S+vSyAhUdAeGmLhFRyBr0swPFJTYQT4RIx5Xrh/pYXoNz21ymfqDtZ5tTOtqxacs7ti11/FERyF31VlvOXs="

        NativeHDSignerModule(reactContext).addressForPath(
                refRootAddress,
                "m/1'/2/3'/4",
                "",
                PromiseHelper(
                        { err, result ->
                            assertNull(err)
                            assertTrue(result is WritableMap)
                            val wm: WritableMap = result as WritableMap

                            val address = wm.getString("address")
                            val publicKey = wm.getString("pubKey")

                            assertEquals(expectedAddress, address)
                            assertEquals(expectedPubKey, publicKey)
                        }))
    }

    @Test
    fun privKeyForPath() {
        NativeHDSignerModule(reactContext).privateKeyForPath(
                refRootAddress,
                "m/1'/2/3'/4",
                "",
                PromiseHelper({ err, result ->
                    assertNull(err)
                    assertEquals("l5fC4EhTkzvGeoLp6N8Pn/Hw59w4sSl1OQaKHraLyRs=", result)
                })
        )
    }

    @Test(expected = KotlinNullPointerException::class)
    fun createSeedCrashOnNullPromise() {
        NativeHDSignerModule(reactContext).createSeed("simple", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun importKeyCrashOnNullPromise() {
        NativeHDSignerModule(reactContext).importSeed("pks", "simple", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun signTxCrashesOnNullPromise() {
        NativeHDSignerModule(reactContext).signTx("noaddr", "m/", "nopayload", "", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun signJwtCrashesOnNullPromise() {
        NativeHDSignerModule(reactContext).signJwt("noaddr", "m/", "nodata", "", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun addressForPathCrashesOnNullPromise() {
        NativeHDSignerModule(reactContext).addressForPath("noaddr", "m/", "", null)
    }

    @Test(expected = KotlinNullPointerException::class)
    fun privKeyForPathCrashesOnNullPromise() {
        NativeHDSignerModule(reactContext).privateKeyForPath("noaddr", "m/", "", null)
    }

}