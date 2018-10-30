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

import com.facebook.react.bridge.Promise

/**
 * helper class that wraps a callback as a promise
 */
class PromiseHelper(private val callback: (err: Any?, result: Any?) -> Unit) : Promise {
    override fun resolve(value: Any?) {
        return callback(null, value)
    }

    override fun reject(code: String?, message: String?) {
        callback("code:$code, msg:$message", null)
    }

    override fun reject(code: String?, e: Throwable?) {
        callback("code:$code, exception:$e", null)
    }

    override fun reject(code: String?, message: String?, e: Throwable?) {
        callback("code:$code, msg:$message, exception:$e", null)
    }

    @Suppress("OverridingDeprecatedMember")
    override fun reject(message: String?) {
        callback("msg:$message", null)
    }

    override fun reject(reason: Throwable?) {
        callback("exception:$reason", null)
    }
}