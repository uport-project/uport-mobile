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

import com.RNFetchBlob.RNFetchBlobPackage;
import com.authentication.AuthenticationScreenPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.crashlytics.android.Crashlytics;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.facebook.common.logging.FLog;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.horcrux.svg.SvgPackage;
import com.imagepicker.ImagePickerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import com.poberwong.launcher.IntentLauncherPackage;
import com.reactnativenavigation.NavigationApplication;
import com.uport.sdk.react.signer.NativeSignerPackage;
import com.airbnb.android.react.lottie.LottiePackage;

import org.reactnative.camera.RNCameraPackage;

import java.util.Arrays;
import java.util.List;

import io.fabric.sdk.android.Fabric;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage;

public class MainApplication extends NavigationApplication {

    @Override
    public void onCreate() {
        super.onCreate();
        Fabric.with(this, new Crashlytics());
        FLog.setLoggingDelegate(ReactNativeFabricLogger.getInstance());
    }

    @Override
    public boolean isDebug() {
        // Make sure you are using BuildConfig from your own application
        return BuildConfig.DEBUG;
    }

    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return getPackages();
    }


    public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new RNFirebasePackage(),
                new RNFirebaseRemoteConfigPackage(),
                new SvgPackage(),
                new FIRMessagingPackage(),
                new RNDeviceInfo(),
                new RNFetchBlobPackage(),
                new VectorIconsPackage(),
                new RNCameraPackage(),
                new RandomBytesPackage(),
                new ImagePickerPackage(),
                new AuthenticationScreenPackage(),
                new MySNSPackage(),
                new IntentLauncherPackage(),
                new NativeSignerPackage(),
                new RNFirebaseAnalyticsPackage(),
                new LottiePackage()
        );
    }

}
