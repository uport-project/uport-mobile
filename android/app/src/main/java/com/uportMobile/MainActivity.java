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
package com.uportMobile;

import android.content.Intent;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.controllers.SplashActivity;

public class MainActivity extends SplashActivity {

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // This activity is coerced into a single instance in the manifest (`launchMode="singleTask"`)
        // making this callback the place to capture deep links and pass them to react.
        NavigationApplication.instance.getReactGateway().onNewIntent(intent);
        NavigationApplication.instance.getActivityCallbacks().onNewIntent(intent);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (NavigationApplication.instance.isReactContextInitialized()) {
            //in case the app is resumed into an already initialized react-context,
            // the splash needs to disappear
            finish();
        }
    }

    @Override
    public int getSplashLayout() {
        return R.layout.splash;
    }
}
